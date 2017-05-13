/**
 * Copyright reelyActive 2016-2017
 * Adapted from node-bluetooth-hci-socket example by Sandeep Mistry (c) 2015
 * We believe in an open Internet of Things
 */


const util = require('util');
const events = require('events');
const packetSplitter = require('./packetsplitter');
const time = require('../utils/time');


const PROTOCOL = 'hci';
const DEFAULT_ENABLE_MIXING = false;
const SCAN_ENABLE_MS = 250;
const SCAN_DISABLE_MS = 50;
const HCI_COMMAND_PKT = 0x01;
const HCI_ACLDATA_PKT = 0x02;
const HCI_EVENT_PKT = 0x04;
const EVT_CMD_COMPLETE = 0x0e;
const EVT_CMD_STATUS = 0x0f;
const EVT_LE_META_EVENT = 0x3e;
const EVT_LE_ADVERTISING_REPORT = 0x02;
const OGF_INFO_PARAM = 0x04;
const OGF_LE_CTL = 0x08;
const OCF_READ_BD_ADDR = 0x0009;
const OCF_LE_SET_SCAN_PARAMETERS = 0x000b;
const OCF_LE_SET_SCAN_ENABLE = 0x000c;
const LE_SET_SCAN_PARAMETERS_CMD = OCF_LE_SET_SCAN_PARAMETERS | OGF_LE_CTL << 10;
const LE_SET_SCAN_ENABLE_CMD = OCF_LE_SET_SCAN_ENABLE | OGF_LE_CTL << 10;
const READ_BD_ADDR_CMD = OCF_READ_BD_ADDR | (OGF_INFO_PARAM << 10);
const HCI_SUCCESS = 0;


/**
 * HCIListener Class
 * Listens for data on HCI and emits this data
 * @param {String} path Path to HCI device, ex: TBD.
 * @param {boolean} enableMixing Use mixing if true, else bypass.
 * @constructor
 * @extends {events.EventEmitter}
 */
function HCIListener(path, enableMixing) {
  var self = this;

  self.enableMixing = enableMixing || DEFAULT_ENABLE_MIXING;
  if(self.enableMixing) {
    self.packetSplitter = new packetSplitter(self);
  }

  self.path = path;
  self.origin = PROTOCOL;
  if(path) {
    self.origin += '-' + path;
  }

  openHciSocket(path, function(err, socket) {
    if(err) {
      self.emit('error', err);
      return;
    }
    else {
      socket.on('data', function(data) {
        var timestamp = time.getCurrent();
        reelData = handleSocketData(self, data);
        if(reelData) {
          if(typeof reelData === 'string') {
            reelData = new Buffer(reelData, 'hex');
          }
          handleFragment(self, reelData, self.origin, timestamp);
        }
      });
      socket.on('error', function(err) {
        self.emit('error', err);
      });
    }
  });

  events.EventEmitter.call(self);
}
util.inherits(HCIListener, events.EventEmitter);


/**
 * Open the HCI socket based on the given path.
 * @param {String} path Path to HCI socket, ex: TBD.
 * @param {function} callback The function to call on completion.
 */
function openHciSocket(path, callback) {
  var BluetoothHciSocket = require('bluetooth-hci-socket');
  var bluetoothHciSocket = new BluetoothHciSocket();

  bluetoothHciSocket.bindRaw(); // TODO: path
  setFilter(bluetoothHciSocket);
  bluetoothHciSocket.start();
  setScanEnable(bluetoothHciSocket, false, true);
  setScanParameters(bluetoothHciSocket);

  // Periodically enable and disable the scan for consistent results
  setInterval(function() {
    setScanEnable(bluetoothHciSocket, true, true);
    setTimeout(function() {
      setScanEnable(bluetoothHciSocket, false, true);
    }, SCAN_ENABLE_MS);
  }, SCAN_ENABLE_MS + SCAN_DISABLE_MS);

  callback(null, bluetoothHciSocket); // TODO: include error
  readBdAddr(bluetoothHciSocket);
}


/**
 * Handle data from the socket and return a reel packet, if applicable.
 * @param {Buffer} data HCI data.
 */
function handleSocketData(instance, data) {
  if(data.readUInt8(0) === HCI_EVENT_PKT) {
    if(data.readUInt8(1) === EVT_LE_META_EVENT) {
      if(data.readUInt8(3) === EVT_LE_ADVERTISING_REPORT) {
        var gapAdvTypeMap = [ '0', '1', '6', '2', '4' ];
        var gapAdvType = data.readUInt8(5);  // 0 to 4, non-BLE spec
        var gapAddrType = data.readUInt8(6); // 0 = public, 1 = random
        var gapAddr = data.slice(7, 13);
        var eir = data.slice(14, data.length - 1);
        var rssi = data.readInt8(data.length - 1);
        var gapAdvLength = data.length - 9;
        var reelHeader = gapAdvLength + 2;

        var reelData = 'aaaa';                                    // Prefix
        reelData += ('0' + reelHeader.toString(16)).substr(-2);   // Header
        reelData += '01';                                         // Count
        reelData += 4 * gapAddrType;                              // txAdd
        reelData += gapAdvTypeMap[gapAdvType];                    // Type
        reelData += ('0' + gapAdvLength.toString(16)).substr(-2); // Length
        reelData += gapAddr.toString('hex');                      // Address
        reelData += eir.toString('hex');                          // PDU
        reelData += '00';                                         // Reel pos
        reelData += ('0' + (rssi + 128).toString(16)).substr(-2); // RSSI

        return reelData;
      }
    }
    else if(data.readUInt8(1) === EVT_CMD_COMPLETE) {
      var cmd = data.readUInt16LE(4);
      var result = data.slice(7);

      if(cmd === READ_BD_ADDR_CMD) {
        instance.address = result.toString('hex').match(/.{1,2}/g)
                           .reverse().join('');
        emitReelAnnounce(instance);
        console.log('HCI Bluetooth address is ' + instance.address +
                    ', query as receiver ' + '001bc5094' +
                    instance.address.substr(5,7));
      }
    }
  }
  return null;
}


/**
 * Set the filters of the Bluetooth HCI Socket.
 * @param {Object} socket The Bluetooth HCI Socket.
 */
function setFilter(socket) {
  var filter = new Buffer(14);
  var typeMask = (1 << HCI_EVENT_PKT);
  var eventMask1 = (1 << EVT_CMD_COMPLETE) | (1 << EVT_CMD_STATUS);
  var eventMask2 = (1 << (EVT_LE_META_EVENT - 32));
  var opcode = 0;

  filter.writeUInt32LE(typeMask, 0);
  filter.writeUInt32LE(eventMask1, 4);
  filter.writeUInt32LE(eventMask2, 8);
  filter.writeUInt16LE(opcode, 12);

  socket.setFilter(filter);
}


/**
 * Set the scan parameters of the Bluetooth HCI Socket.
 * @param {Object} socket The Bluetooth HCI Socket.
 */
function setScanParameters(socket) {
  var cmd = new Buffer(11);

  // header
  cmd.writeUInt8(HCI_COMMAND_PKT, 0);
  cmd.writeUInt16LE(LE_SET_SCAN_PARAMETERS_CMD, 1);

  // length
  cmd.writeUInt8(0x07, 3);

  // data
  cmd.writeUInt8(0x01, 4);      // type: 0 -> passive, 1 -> active
  cmd.writeUInt16LE(0x0010, 5); // internal, ms * 1.6
  cmd.writeUInt16LE(0x0010, 7); // window, ms * 1.6
  cmd.writeUInt8(0x00, 9);      // own address type: 0 -> public, 1 -> random
  cmd.writeUInt8(0x00, 10);     // filter: 0 -> all event types

  socket.write(cmd);
}


/**
 * Set the scan state of the Bluetooth HCI Socket.
 * @param {Object} socket The Bluetooth HCI Socket.
 */
function setScanEnable(socket, enabled, duplicates) {
  var cmd = new Buffer(6);

  // header
  cmd.writeUInt8(HCI_COMMAND_PKT, 0);
  cmd.writeUInt16LE(LE_SET_SCAN_ENABLE_CMD, 1);

  // length
  cmd.writeUInt8(0x02, 3);

  // data
  cmd.writeUInt8(enabled ? 0x01 : 0x00, 4);    // enabled:    0 (no), 1 (yes)
  cmd.writeUInt8(duplicates ? 0x01 : 0x00, 5); // duplicates: 0 (no), 1 (yes)

  socket.write(cmd);
}


/**
 * Read the Bluetooth MAC address of the adapter.
 * @param {Object} socket The Bluetooth HCI Socket.
 */
function readBdAddr(socket) {
  var cmd = new Buffer(4);

  // header
  cmd.writeUInt8(HCI_COMMAND_PKT, 0);
  cmd.writeUInt16LE(READ_BD_ADDR_CMD, 1);

  // length
  cmd.writeUInt8(0x0, 3);

  socket.write(cmd);
};


/**
 * Emit simulated reel announce packet
 * @param {HCIListener} instance The given instance.
 */
function emitReelAnnounce(instance) {
  if(!instance.address) {
    return;
  }
  // TODO: update this to support the full 48-bit MAC address
  var simulatedPacket = new Buffer('aaaa7000' + instance.address.substr(4,8) +
                                   '00000000000000000000000000000000', 'hex');
  handleFragment(instance, simulatedPacket, instance.origin, time.getCurrent());
}


/**
 * Handle an incoming data fragment.
 * @param {HCIListener} instance The HCIListener instance.
 * @param {Buffer} data The packet fragment data.
 * @param {String} origin The origin of the packet fragment.
 * @param {Number} timestamp The timestamp of the packet fragment.
 */
function handleFragment(instance, data, origin, timestamp) {
  timestamp = timestamp || time.getCurrent();
  origin = origin || PROTOCOL;

  // Send to packet splitter if mixing enabled
  if(instance.enableMixing) {
    instance.packetSplitter.append(data, origin, timestamp);
  }

  // Simply emit the packet fragment if mixing disabled
  else {
    instance.emit('fragment', data, origin, timestamp);
  }
}


module.exports = HCIListener;
module.exports.PROTOCOL = PROTOCOL
