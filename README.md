reelay
======

Relay for a reel data stream.  Under active development, only the core functionality in place as of the current version.


Installation
------------

    npm install reelay


Hello reelay
------------

Relay internally generated test packets via UDP to port 50000 on the local machine:

    var reelay = require('reelay');

    var relay = new reelay();
    relay.addListener( { protocol: 'test', path: null, enableMixing: false } );
    relay.addForwarder( { protocol: 'udp', port: 50000, address: 'localhost' } );


Supported listeners
-------------------

### serial

Listen on a serial port:

    relay.addListener( { protocol: "serial", path: "auto" } );

Requires explicit installation of the [serialport](https://www.npmjs.com/package/serialport) package:

    npm install serialport

### UDP

Listen on a UDP port:

    relay.addListener( { protocol: 'udp', path: '127.0.0.1:50000' } );

### emitter

Listen on an event emitter:

    var emitter = null; // Assign your reel data emitter here
    relay.addListener( { protocol: 'event', path: emitter } );

### HCI

Listen on a local Bluetooth radio via HCI:

    relay.addListener( { protocol: "hci", path: null } );

Requires explicit installation of the [bluetooth-hci-socket](https://www.npmjs.com/package/bluetooth-hci-socket) package:

    npm install bluetooth-hci-socket

You may need to run as super-user to have permission to access the Bluetooth radio.

### test

Internally generate packets for testing:

    relay.addListener( { protocol: "test", path: null } );


Supported forwarders
--------------------

### UDP

Forward via UDP packets:

    relay.addForwarder({
      protocol: 'udp',
      port: 50000,
      address: 'localhost',
      maxPayloadBytes: 508,
      maxDelayMilliseconds: 500
    });


License
-------

MIT License

Copyright (c) 2017 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.


