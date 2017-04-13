/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


var util = require('util');
var events = require('events');


/**
 * TemporalMixingQueue Class
 * Mix signature-based objects on a defined time base.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function TemporalMixingQueue(options) {
  var self = this;

  events.EventEmitter.call(self);
}
util.inherits(TemporalMixingQueue, events.EventEmitter);


/**
 * Add a listener for a given data stream.
 * @param {Object} options The options as a JSON object.
 */
TemporalMixingQueue.prototype.insert = function(signature, object) {
  var self = this;

  // TODO: implement the queue
  self.emit('expiration', { signature: signature, object: object });
};


module.exports = TemporalMixingQueue;
