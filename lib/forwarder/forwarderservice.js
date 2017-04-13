/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


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

};


/**
 * Forward the given packet.
 * @param {Buffer} packet The packet to forward.
 */
ForwarderService.prototype.forward = function(packets) {
  var self = this;

  console.log('Should be forwarding packets:', packets);

  for(var cForwarder = 0; cForwarder < self.forwarders.length; cForwarder++) {
    // TODO: forward
  }
};

module.exports = ForwarderService;
