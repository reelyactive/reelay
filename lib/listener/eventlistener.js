/**
 * Copyright reelyActive 2014-2017
 * We believe in an open Internet of Things
 */


const util = require('util');
const events = require('events');
const packetSplitter = require('./packetsplitter');
const time = require('../utils/time');


const PROTOCOL = 'event';
const DEFAULT_ENABLE_MIXING = false;


/**
 * EventListener Class
 * Listens for events and emits the included data
 * @param {Object} path Event source object, ex: eventSource.
 * @param {boolean} enableMixing Use mixing if true, else bypass.
 * @constructor
 * @extends {events.EventEmitter}
 */
function EventListener(path, enableMixing) {
  var self = this;

  self.enableMixing = enableMixing || DEFAULT_ENABLE_MIXING;
  if(self.enableMixing) {
    self.packetSplitter = new packetSplitter(self);
  }

  // Handle incoming data fragments
  path.on('data', function (data, origin, timestamp) {
    if(typeof data === 'string') {
      data = new Buffer(data, 'hex');
    }
    handleFragment(self, data, origin, timestamp);
  });

  events.EventEmitter.call(self);
}
util.inherits(EventListener, events.EventEmitter);


/**
 * Handle an incoming data fragment.
 * @param {EventListener} instance The EventListener instance.
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


module.exports = EventListener;
module.exports.PROTOCOL = PROTOCOL;
