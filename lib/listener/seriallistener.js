/**
 * Copyright reelyActive 2014-2017
 * We believe in an open Internet of Things
 */


const util = require('util');
const events = require('events');
const packetSplitter = require('./packetsplitter');
const time = require('../utils/time');


const PROTOCOL = 'serial';
const BAUDRATE = 230400;
const AUTO_PATH = 'auto';
const AUTO_MANUFACTURER = 'FTDI';
const DEFAULT_ENABLE_MIXING = false;


/**
 * SerialListener Class
 * Listens for data on a serial port and emits this data
 * @param {String} path Path to serial port, ex: /dev/ttyUSB0.
 * @param {boolean} enableMixing Use mixing if true, else bypass.
 * @constructor
 * @extends {events.EventEmitter}
 */
function SerialListener(path, enableMixing) {
  var self = this;

  self.enableMixing = enableMixing || DEFAULT_ENABLE_MIXING;
  if(self.enableMixing) {
    self.packetSplitter = new packetSplitter(self);
  }

  openSerialPort(path, function(err, serialPort, path) {
    if(err) {
      self.emit('error', err);
      return;
    }
    else {
      serialPort.on('data', function(data) {
        var timestamp = time.getCurrent();
        if(typeof data === 'string') {
          data = new Buffer(data, 'hex');
        }
        handleFragment(self, data, path, timestamp);
      });
      serialPort.on('close', function(data) {
        self.emit('error', { message: "Serial port closed" } );
      });
      serialPort.on('error', function(err) {
        self.emit('error', err);
      });
    }
  });

  events.EventEmitter.call(self);

}
util.inherits(SerialListener, events.EventEmitter);


/**
 * Open the serial port based on the given path.
 * @param {String} path Path to serial port, ex: /dev/ttyUSB0 or auto.
 * @param {function} callback The function to call on completion.
 */
function openSerialPort(path, callback) {
  var SerialPort = require('serialport');
  var serialPort;

  if(path === AUTO_PATH) {
    var detectedPath;
    SerialPort.list(function(err, ports) {
      if(err) {
        return callback(err);
      }
      for(var cPort = 0; cPort < ports.length; cPort++) {
        var path = ports[cPort].comName;
        var manufacturer = ports[cPort].manufacturer;
        if(manufacturer === AUTO_MANUFACTURER) {
          detectedPath = path;
          serialPort = new SerialPort(path, { baudrate: BAUDRATE },
                                      function(err) {
            console.log('Auto serial path: \'' + path + '\' was selected');
            return callback(err, serialPort, detectedPath);
          });
        }
        else if(manufacturer) {
          console.log('Alternate serial path: \'' + path + '\' is a ' +
                      manufacturer + 'device.');
        }
      }
      if(!serialPort) {
        return callback( { message: "Can't auto-determine serial port" } );
      }
    });
  }
  else {
    serialPort = new SerialPort(path, { baudrate: BAUDRATE }, function(err) {
      return callback(err, serialPort, path);
    });
  }
}


/**
 * Handle an incoming data fragment.
 * @param {SerialListener} instance The SerialListener instance.
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


module.exports = SerialListener;
module.exports.PROTOCOL = PROTOCOL;
