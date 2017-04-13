/**
 * Copyright reelyActive 2014-2017
 * We believe in an open Internet of Things
 */


var util = require('util');
var events = require('events');
var time = require('../utils/time');


// Constants
var PROTOCOL = 'event';


/**
 * EventListener Class
 * Listens for events and emits the included data
 * @param {Object} path Event source object, ex: eventSource.
 * @constructor
 * @extends {events.EventEmitter}
 */
function EventListener(path) {
  var self = this;

  events.EventEmitter.call(self);

  path.on('data', function (data, origin, timestamp) {
    timestamp = timestamp || time.getCurrent();
    origin = origin || PROTOCOL;
    self.emit('data', data, origin, timestamp);
  });

}
util.inherits(EventListener, events.EventEmitter);


module.exports = EventListener;
module.exports.PROTOCOL = PROTOCOL;
