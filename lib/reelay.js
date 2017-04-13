/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


var listenerService = require('./listener/listenerservice');
var forwarderService = require('./forwarder/forwarderservice');
var temporalMixingQueue = require('./temporalmixingqueue');


/**
 * Reelay Class
 * Relay for a reel data stream.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function Reelay(options) {
  var self = this;

  // Create the services
  self.listeners = new listenerService();
  self.mixer = new temporalMixingQueue();
  self.forwarders = new forwarderService();

  // Connect the services
  self.listeners.on('decodedRadioSignalPacket',
                    function(data, origin, timestamp) {
    self.mixer.insert(data, { origin: origin, timestamp: timestamp });
  });
  self.listeners.on('reelManagementPacket', function(packet) {
    var packets = [ packet ];
    self.forwarders.forward(packets);
  });
  self.mixer.on('expiration', function(objects) {
    // TODO: create the packets
    var packets = objects;
    self.forwarders.forward(packets);
  });

  // Let the console know we're up and running
  console.log("reelyActive Reelay instance is relaying data in an open IoT");
}


/**
 * Add a listener for a given data stream.
 * @param {Object} options The options as a JSON object.
 */
Reelay.prototype.addListener = function(options) {
  var self = this;
  self.listeners.add(options);
};


/**
 * Add a forwarder to a given target.
 * @param {Object} options The options as a JSON object.
 */
Reelay.prototype.addForwarder = function(options) {
  var self = this;
  self.forwarders.add(options);
};


module.exports = Reelay;
