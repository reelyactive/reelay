/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


const dgram = require('dgram');


const PROTOCOL = 'udp';
const DEFAULT_PORT = 50000;
const DEFAULT_ADDRESS = 'localhost';


/**
 * UDPForwarder Class
 * Forwards packets over UDP.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function UDPForwarder(options) {
  var self = this;

  self.port = options.port || DEFAULT_PORT;
  self.address = options.address || DEFAULT_ADDRESS;

  self.client = dgram.createSocket('udp4');
}


/**
 * Forward the given packets.
 * @param {Array} packets The packets to forward.
 */
UDPForwarder.prototype.forward = function(packets) {
  var self = this;

  // Determine the required buffer length
  var length = 0;
  for(var cPacket = 0; cPacket < packets.length; cPacket++) {
    length += packets[cPacket].packet.length;
  }

  // Copy all packets into the buffer
  var buf = new Buffer(length);
  var cursor = 0;
  for(var cPacket = 0; cPacket < packets.length; cPacket++) {
    packets[cPacket].packet.copy(buf, cursor);
    cursor += packets[cPacket].packet.length;
  }

  // Send the UDP packet
  self.client.send(buf, 0, buf.length, self.port, self.address, function(err) {
    if(err) {
      console.log('reelay UDP forwarding error', err);
    }
  });
};


module.exports = UDPForwarder;
module.exports.PROTOCOL = PROTOCOL;
