/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


const reel = require('../utils/reel');


/**
 * PacketSplitter Class
 * Aggregates packet fragments, splitting and emitting them individually.
 * @param {Object} listener The listener instance which extends EventEmitter.
 * @constructor
 */
function PacketSplitter(listener) {
  var self = this;

  self.listener = listener;
  self.fragments = [];
}


/**
 * Append a packet fragment to the buffer.
 * @param {Buffer} data The packet fragment data.
 */
PacketSplitter.prototype.append = function(data, origin, timestamp) {
  var self = this;

  // This is the first packet fragment
  if(self.fragments.length === 0) {
    data = alignWithPrefix(data);
    if(data !== null) {
      var packet = extractPacket(data);
      if(packet !== null) {
        self.listener.emit('packet', packet, origin, timestamp);
      }
      if(data.length > 0) {
        // Is there another packet in there?
        // Add to fragments
      }
    }
  }

  // There are existing packet fragments
  else {
    // Add to array
    // Stitch
  }

};


/**
 * Align the given buffer with the prefix by stripping any preceding data.
 * @param {Buffer} data The packet fragment data.
 * @return {Buffer} The aligned buffer.
 */
function alignWithPrefix(data) {
  var prefixIndex = data.indexOf(reel.PREFIX, 0, 'hex');

  // Already aligned, return data as is
  if(prefixIndex === 0) {
    return data;
  }

  // Prefix not found, return null
  if(prefixIndex < 0) {
    return null;
  }

  // Found prefix, return stripped data
  return data.slice(prefixIndex);
}


/**
 * Extract the first packet, if possible, from the given data.
 * @param {Buffer} data The packet fragment data.
 * @return {Buffer} The aligned buffer.
 */
function extractPacket(data) {

  // Determine if valid packet is present
  var length = reel.determinePacketLength(data);
  if(length > 0) {
    var packet = data.slice(0, length);
    data = data.slice(length);
    return packet;
  }

  // No valid packet, return null
  return null;
}


module.exports = PacketSplitter;
