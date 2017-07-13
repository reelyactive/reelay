/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


const udpForwarder = require('./udpforwarder');


/**
 * ForwarderService Class
 * Funnel for all forwarders.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function ForwarderService(options) {
  var self = this;

  self.forwarders = [];
}


/**
 * Add a forwarder to a given target.
 * @param {Object} options The options as a JSON object.
 */
ForwarderService.prototype.add = function(options) {
  var self = this;
  options = options || {};

  var protocol = options.protocol || DEFAULT_PROTOCOL;
  var forwarder = createForwarder(protocol, options);

  if(forwarder !== null) {
    self.forwarders.push(forwarder);
  }
};


/**
 * Forward the given packets.
 * @param {Array} packets The array of packets to forward.
 */
ForwarderService.prototype.forward = function(packets) {
  var self = this;

  for(var cForwarder = 0; cForwarder < self.forwarders.length; cForwarder++) {
    self.forwarders[cForwarder].forward(packets);
  }
};


/**
 * Create a new forwarder.
 * @param {String} protocol The forwarder protocol.
 * @param {Object} options The forwarder options.
 */
function createForwarder(protocol, options) {
  switch(protocol) {
    case udpForwarder.PROTOCOL:
      return new udpForwarder(options);
    default:
      console.log('Unsupported forwarder protocol: ' + protocol);
      return null;
  }
}


module.exports = ForwarderService;
