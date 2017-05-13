/**
 * Copyright reelyActive 2014-2017
 * We believe in an open Internet of Things
 */


const util = require('util');
const events = require('events');
const packetSplitter = require('./packetsplitter');
const time = require('../utils/time');


const PROTOCOL = 'test';
const TEST_ORIGIN = 'test';
const RADIO_DECODINGS_PERIOD_MILLISECONDS = 1000;
const LOGISTICS_PERIOD_MILLISECONDS = 60000;
const DEFAULT_ENABLE_MIXING = false;


/**
 * TestListener Class
 * Listens for events and emits the included data
 * @param {Object} path Test type, ex: default.
 * @param {boolean} enableMixing Use mixing if true, else bypass.
 * @constructor
 * @extends {events.EventEmitter}
 */
function TestListener(path, enableMixing) {
  var self = this;
  self.rssi = [ 0, 0, 0, 0 ];

  function periodicRadioDecodings() {
    emitRadioDecodings(self);
  }
  setInterval(periodicRadioDecodings, RADIO_DECODINGS_PERIOD_MILLISECONDS);

  function periodicLogistics() {
    emitReelceiverStatistics(self);
    emitReelAnnounce(self);
  }
  setInterval(periodicLogistics, LOGISTICS_PERIOD_MILLISECONDS);

  process.nextTick(function() {
    emitReelceiverStatistics(self);
    emitReelAnnounce(self);
  });

  events.EventEmitter.call(self);
}
util.inherits(TestListener, events.EventEmitter);


/**
 * Emit simulated radio decoding packets
 * @param {TestListener} instance The given instance.
 */
function emitRadioDecodings(instance) {
  var simulatedPacket = new Buffer(
    "aaaa04020100000000" + toRssiString(instance.rssi[0]) +
                    "02" + toRssiString(instance.rssi[2]) +
    "aaaa1802421655daba50e1fe0201050c097265656c79416374697665" +
                    "01" + toRssiString(instance.rssi[1]) +
                    "03" + toRssiString(instance.rssi[3]), "hex");
  updateSimulatedRssi(instance);
  handleFragment(instance, simulatedPacket, TEST_ORIGIN, time.getCurrent());
}


/**
 * Emit simulated reelceiver statistics packets
 * @param {TestListener} instance The given instance.
 */
function emitReelceiverStatistics(instance) {
  var simulatedPacket = new Buffer(
    "aaaa7800008000000000000000000000000000000000503300" +
    "aaaa7801008100000000000000000000000000000000503300" +
    "aaaa7802008000010000000000000000000000000000503300" +
    "aaaa7803008100010000000000000000000000000000503300", "hex");
  handleFragment(instance, simulatedPacket, TEST_ORIGIN, time.getCurrent());
}


/**
 * Emit simulated reel announce packets
 * @param {TestListener} instance The given instance.
 */
function emitReelAnnounce(instance) {
  var simulatedPacket = new Buffer(
    "aaaa70030080000000000000000000000000000000000000" +
    "aaaa70020081000000000000000000000000000000000000" +
    "aaaa70010080000100000000000000000000000000000000" +
    "aaaa70000081000100000000000000000000000000000000", "hex");
  handleFragment(instance, simulatedPacket, TEST_ORIGIN, time.getCurrent());
}


/**
 * Update the simulated RSSI values
 * @param {TestListener} instance The given instance.
 */
function updateSimulatedRssi(instance) {
  for(cRssi = 0; cRssi < instance.rssi.length; cRssi++) {
    instance.rssi[cRssi] += Math.floor((Math.random() * 5) - 2);
    if(instance.rssi[cRssi] > 18) {
      instance.rssi[cRssi] = 18;
    }
    else if(instance.rssi[cRssi] <= 0) {
      instance.rssi[cRssi] = 0;
    }
  }
}


/**
 * Convert an integer to a two-character hexadecimal RSSI
 * @param {Number} integer The given integer.
 */
function toRssiString(integer) {
  return ("0" + integer.toString(16)).substr(-2);
}


/**
 * Handle an incoming data fragment.
 * @param {TestListener} instance The TestListener instance.
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


module.exports = TestListener;
module.exports.PROTOCOL = PROTOCOL;
