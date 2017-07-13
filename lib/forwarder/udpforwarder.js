/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


const dgram = require('dgram');


const PROTOCOL = 'udp';
const DEFAULT_PORT = 50000;
const DEFAULT_ADDRESS = 'localhost';
const DEFAULT_MAX_PAYLOAD_BYTES = 508;
const DEFAULT_MAX_DELAY_MILLISECONDS = 500;


/**
 * UDPForwarder Class
 * Forwards packets over UDP.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function UDPForwarder(options) {
  var self = this;
  options = options || {};

  self.port = options.port || DEFAULT_PORT;
  self.address = options.address || DEFAULT_ADDRESS;
  self.maxPayloadBytes = options.maxPayloadBytes || DEFAULT_MAX_PAYLOAD_BYTES;
  self.maxDelayMilliseconds = options.maxDelayMilliseconds ||
                              DEFAULT_MAX_DELAY_MILLISECONDS;

  self.payloadIndex = 0;
  self.payload = new Buffer(self.maxPayloadBytes);
  self.client = dgram.createSocket('udp4');
}


/**
 * Forward the given packets.
 * @param {Array} packets The packets to forward.
 */
UDPForwarder.prototype.forward = function(packets) {
  var self = this;

  // Loop through all packets
  for(var cPacket = 0; cPacket < packets.length; cPacket++) {
    var packet = packets[cPacket].packet;
    var hasCapacity = (packet.length + self.payloadIndex) <
                      self.maxPayloadBytes;

    // May payload reached: send current payload, create new empty payload
    if(!hasCapacity) {
      sendPayload(self);
    }

    // Copy the packet to the payload
    packet.copy(self.payload, self.payloadIndex);
    self.payloadIndex += packet.length;
  }
};


/**
 * Send the current payload buffer and create a new payload buffer.
 * @param {UDPForwarder} instance The UDPForwarder instance.
 */
function sendPayload(instance) {
  var payload = instance.payload;
  var length = instance.payloadIndex;

  // Create a new payload buffer and reset index
  instance.payloadIndex = 0;
  instance.payload = new Buffer(instance.maxPayloadBytes);

  // Clear the previous timeout and set the new timeout
  clearTimeout(instance.timeout);
  instance.timeout = setTimeout(sendPayload, instance.maxDelayMilliseconds,
                                instance);

  // Send the original payload buffer
  instance.client.send(payload, 0, length, instance.port, instance.address,
                       function(err) {
    if(err) {
      console.log('reelay UDP forwarding error', err);
    }
  });
}


module.exports = UDPForwarder;
module.exports.PROTOCOL = PROTOCOL;
