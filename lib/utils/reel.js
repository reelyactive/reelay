/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */


const PREFIX = 'aaaa';
const PREFIX_LENGTH_BYTES = 2;
const DECODED_RADIO_SIGNAL_MIN_PACKET_LENGTH_BYTES = 0;
const DECODED_RADIO_SIGNAL_MAX_PACKET_LENGTH_BYTES = 39;
const DECODED_RADIO_SIGNAL_OVERHEAD_BYTES = 2;
const DECODED_RADIO_SIGNAL_BYTES_PER_DECODING = 2;
const REEL_ANNOUNCE_PACKET_LENGTH_BYTES = 22;
const REEL_ANNOUNCE_REEL_PACKET_CODE = 0x70;
const REELCEIVER_STATISTICS_PACKET_LENGTH_BYTES = 23;
const REELCEIVER_STATISTICS_REEL_PACKET_CODE = 0x78;
const DECODED_RADIO_SIGNAL_PACKET = 'decodedRadioSignalPacket';
const REEL_MANAGEMENT_PACKET = 'reelManagementPacket';
const REEL_PACKET_FRAGMENT = 'reelPacketFragment';


/**
 * Determine the length of the first packet, if any, in the given buffer. 
 * @param {Buffer} data The data buffer which may contain a valid packet.
 * @return {Number} The length of the packet if valid, -1 otherwise.
 */
function determinePacketLength(data) {

  // Abort if it does not begin with the expected prefix
  if(data.indexOf(PREFIX, 0, 'hex') !== 0) {
    return -1;
  }

  var length = data.length + 1;
  var header = data.readUInt8(PREFIX_LENGTH_BYTES);

  // Calculate packet length based on header
  switch(header) {
    case REEL_ANNOUNCE_REEL_PACKET_CODE:
      length = PREFIX_LENGTH_BYTES + REEL_ANNOUNCE_PACKET_LENGTH_BYTES;
      break;
    case REELCEIVER_STATISTICS_REEL_PACKET_CODE:
      length = PREFIX_LENGTH_BYTES + REELCEIVER_STATISTICS_PACKET_LENGTH_BYTES;
      break;
    default:
      if((header >= DECODED_RADIO_SIGNAL_MIN_PACKET_LENGTH_BYTES) &&
         (header <= DECODED_RADIO_SIGNAL_MAX_PACKET_LENGTH_BYTES)) {
        var decodings = data.readUInt8(PREFIX_LENGTH_BYTES + 1);
        length = PREFIX_LENGTH_BYTES + DECODED_RADIO_SIGNAL_OVERHEAD_BYTES +
                 header + (decodings * DECODED_RADIO_SIGNAL_BYTES_PER_DECODING);
      }
  }

  // Valid packet within buffer, return its length
  if(length <= data.length) {
    return length;
  }

  return -1;
};


/**
 * Determine the type of the first packet, if any, in the given buffer. 
 * @param {Buffer} data The data buffer which may contain a valid packet.
 * @return {String} The type of the packet if valid, null otherwise.
 */
function determinePacketType(data) {

  // Abort if it does not begin with the expected prefix
  if(data.indexOf(PREFIX, 0, 'hex') !== 0) {
    return null;
  }

  var header = data.readUInt8(PREFIX_LENGTH_BYTES);

  // Determine packet type based on header
  switch(header) {
    case REEL_ANNOUNCE_REEL_PACKET_CODE:
      return REEL_MANAGEMENT_PACKET;
    case REELCEIVER_STATISTICS_REEL_PACKET_CODE:
      return REEL_MANAGEMENT_PACKET;
    default:
      if((header >= DECODED_RADIO_SIGNAL_MIN_PACKET_LENGTH_BYTES) &&
         (header <= DECODED_RADIO_SIGNAL_MAX_PACKET_LENGTH_BYTES)) {
        return DECODED_RADIO_SIGNAL_PACKET;
      }
  }

  // Unrecognised packet type, return null
  return null;
}


/**
 * Return the raw radio packet from the given decoded radio signal packet. 
 * @param {Buffer} packet The decoded radio signal packet.
 * @return {Buffer} The raw radio packet, null if invalid.
 */
function getRadioPacket(packet) {

  // Abort if it does not begin with the expected prefix
  if(packet.indexOf(PREFIX, 0, 'hex') !== 0) {
    return null;
  }

  var header = packet.readUInt8(PREFIX_LENGTH_BYTES);

  // Copy and return the raw radio packet 
  if((header >= DECODED_RADIO_SIGNAL_MIN_PACKET_LENGTH_BYTES) &&
     (header <= DECODED_RADIO_SIGNAL_MAX_PACKET_LENGTH_BYTES)) {
    var radioPacket = new Buffer(header);
    packet.copy(radioPacket, 0, 4, 4 + header);
    return radioPacket;
  }

  // Not a decoded radio signal packet, return null
  return null;
}


module.exports.PREFIX = PREFIX;
module.exports.DECODED_RADIO_SIGNAL_PACKET = DECODED_RADIO_SIGNAL_PACKET;
module.exports.REEL_MANAGEMENT_PACKET = REEL_MANAGEMENT_PACKET;
module.exports.REEL_PACKET_FRAGMENT = REEL_PACKET_FRAGMENT;
module.exports.determinePacketLength = determinePacketLength;
module.exports.determinePacketType = determinePacketType;
module.exports.getRadioPacket = getRadioPacket;
