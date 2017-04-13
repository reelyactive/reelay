/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


var util = require('util');
var events = require('events');
var eventListener = require('./eventlistener');


var DEFAULT_PROTOCOL = 'test';
var DEFAULT_PATH = 'default';


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

  var protocol = options.protocol || DEFAULT_PROTOCOL;
  var path = options.path || DEFAULT_PATH;
  var listener = createListener(protocol, path);

  if(listener === null) {
    return;
  }

  listener.on('data', function(data, origin, timestamp) {
    // TODO: check if radioDecoding or reelManagement
    // TODO: break apart data into constituent elements
    self.emit('decodedRadioSignalPacket', data, origin, timestamp); 
  });
};


/**
 * Create a new listener.
 * @param {String} protocol The listener protocol.
 * @param {String} path The listener protocol.
 */
function createListener(protocol, path) {
  switch(protocol) {
    //case 'serial':
    //  return new serialListener(path);
    //case 'udp':
    //  return new udpListener(path);
    //case 'hci':
    //  return new hciListener(path);
    case 'event':
      return new eventListener(path);
    //case 'test':
    //  return new testListener(path);
    default:
      console.log("Unsupported listener protocol: " + protocol);
      return null;
  }
}


module.exports = ListenerService;
