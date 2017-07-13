/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


const util = require('util');
const events = require('events');
const eventListener = require('./eventlistener');
const hciListener = require('./hcilistener');
const serialListener = require('./seriallistener');
const testListener = require('./testlistener');
const udpListener = require('./udplistener');
const reel = require('../utils/reel');


const DEFAULT_PROTOCOL = 'test';
const DEFAULT_PATH = 'default';
const DEFAULT_ENABLE_MIXING = false;


/**
 * ListenerService Class
 * Funnel for all listeners.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function ListenerService(options) {
  var self = this;

  events.EventEmitter.call(self);
}
util.inherits(ListenerService, events.EventEmitter);


/**
 * Add a listener for a given data stream.
 * @param {Object} options The options as a JSON object.
 */
ListenerService.prototype.add = function(options) {
  var self = this;
  options = options || {};

  var protocol = options.protocol || DEFAULT_PROTOCOL;
  var path = options.path || DEFAULT_PATH;
  var enableMixing = options.enableMixing || DEFAULT_ENABLE_MIXING;
  var listener = createListener(protocol, path, enableMixing);

  if(listener === null) {
    return;
  }

  // Handle incoming data fragments
  listener.on('fragment', function(fragment, origin, timestamp) {
    self.emit(reel.REEL_PACKET_FRAGMENT, fragment, origin, timestamp);
  });

  // Handle incoming (intact) packets
  listener.on('packet', function(packet, origin, timestamp) {
    handlePacket(self, packet, origin, timestamp);
  });
};


/**
 * Create a new listener.
 * @param {String} protocol The listener protocol.
 * @param {String} path The listener protocol.
 */
function createListener(protocol, path, enableMixing) {
  switch(protocol) {
    case serialListener.PROTOCOL:
      return new serialListener(path, enableMixing);
    case udpListener.PROTOCOL:
      return new udpListener(path, enableMixing);
    case hciListener.PROTOCOL:
      return new hciListener(path, enableMixing);
    case eventListener.PROTOCOL:
      return new eventListener(path, enableMixing);
    case testListener.PROTOCOL:
      return new testListener(path, enableMixing);
    default:
      console.log("Unsupported listener protocol: " + protocol);
      return null;
  }
}


/**
 * Handle an incoming packet.
 * @param {ListenerService} instance The ListenerService instance.
 * @param {Buffer} packet The packet.
 * @param {String} origin The origin of the packet.
 * @param {Number} timestamp The timestamp of the packet.
 */
function handlePacket(instance, packet, origin, timestamp) {
  var type = reel.determinePacketType(packet);

  if(type === reel.REEL_MANAGEMENT_PACKET) {
    instance.emit(reel.REEL_MANAGEMENT_PACKET, packet, origin, timestamp);
  }
  else if(type === reel.DECODED_RADIO_SIGNAL_PACKET) {
    instance.emit(reel.DECODED_RADIO_SIGNAL_PACKET, packet, origin, timestamp);
  }
}


module.exports = ListenerService;
