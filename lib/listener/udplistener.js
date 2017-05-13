/**
 * Copyright reelyActive 2014-2017
 * We believe in an open Internet of Things
 */


const dgram = require('dgram');
const util = require('util');
const events = require('events');
const packetSplitter = require('./packetsplitter');
const time = require('../utils/time');


const PROTOCOL = 'udp';
const DEFAULT_ENABLE_MIXING = false;


/**
 * UdpListener Class
 * Listens for data on a UDP port and emits this data
 * @param {string} path Path to UDP host and port, ex: 192.168.1.1:50000.
 * @param {boolean} enableMixing Use mixing if true, else bypass.
 * @constructor
 * @extends {events.EventEmitter}
 */
function UdpListener(path, enableMixing) {
  var self = this;
  var pathElements = path.split(':');
  self.host = pathElements[0];
  self.port = pathElements[1];
  self.server = dgram.createSocket('udp4');

  self.enableMixing = enableMixing || DEFAULT_ENABLE_MIXING;
  if(self.enableMixing) {
    self.packetSplitter = new packetSplitter(self);
  }

  self.server.on('listening', function() {
    var address = self.server.address();
    console.log('UDP Listening on ' + address.address + ':' + address.port);
  });
  self.server.on('message', function(data, remote) {
    var origin = remote.address + ':' + remote.port;
    var timestamp = time.getCurrent();

    if(typeof data === 'string') {
      data = new Buffer(data, 'hex');
    }
    handleFragment(self, data, origin, timestamp);
  });
  self.server.on('error', function (err) {
    self.server.close();
    self.emit('error', err);
  });

  self.server.bind(self.port, self.host);

  events.EventEmitter.call(self);
}
util.inherits(UdpListener, events.EventEmitter);


/**
 * Handle an incoming data fragment.
 * @param {UDPListener} instance The UDPListener instance.
 * @param {Buffer} data The packet fragment data.
 * @param {String} origin The origin of the packet fragment.
 * @param {Number} timestamp The timestamp of the packet fragment.
 */
function handleFragment(instance, data, origin, timestamp) {
  timestamp = timestamp || time.getCurrent();
  origin = origin || PROTOCOL;

  // Send to packet splitter if mixing enabled
  if(instance.enableMixing) {
    instance.packetSplitter.append(data, origin, timestamp);
  }

  // Simply emit the packet fragment if mixing disabled
  else {
    instance.emit('fragment', data, origin, timestamp);
  }
}


module.exports = UdpListener;
module.exports.PROTOCOL = PROTOCOL;
