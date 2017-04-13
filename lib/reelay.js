/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


const listenerService = require('./listener/listenerservice');
const forwarderService = require('./forwarder/forwarderservice');
const temporalMixingQueue = require('./temporalmixingqueue');
const reel = require('./utils/reel');


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
  connectServices(self);

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


/**
 * Connect all the internal services.
 * @param {Reelay} instance The Reelay instance.
 */
function connectServices(instance) {

  // Send decoded radio signal packets to the mixer
  instance.listeners.on(reel.DECODED_RADIO_SIGNAL_PACKET,
                        function(packet, origin, timestamp) {
    var signature = reel.getRadioPacket(packet);
    var object = { packet: packet, origin: origin, timestamp: timestamp };
    instance.mixer.insert(signature, object);
  });

  // Send reel management packets to the forwarders
  instance.listeners.on(reel.REEL_MANAGEMENT_PACKET,
                        function(packet, origin, timestamp) {
    var packets = [ { packet: packet, origin: origin, timestamp: timestamp } ];
    instance.forwarders.forward(packets);
  });

  // Send reel packet fragments to the forwarders (bypass mixer)
  instance.listeners.on(reel.REEL_PACKET_FRAGMENT,
                        function(fragment, origin, timestamp) {
    var packets = [ { packet: fragment, origin: origin, timestamp: timestamp } ];
    instance.forwarders.forward(packets);
  });

  // Send mixed packets to the forwarders
  instance.mixer.on('expiration', function(objects) {
    var packets = [];
    for(var cObject = 0; cObject < objects.length; cObject++) {
      packets.push(objects[cObject].object);
    }
    instance.forwarders.forward(packets);
  });

}


module.exports = Reelay;
