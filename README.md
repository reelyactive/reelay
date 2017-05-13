reelay
======

Relay for a reel data stream.  Under active development, only the core functionality in place as of the current version.


Installation
------------

    npm install reelay


Hello reelay
------------

Relay packets from an _emitter_ via UDP to port 50000 on the local machine:

    var reelay = require('reelay');

    var emitter = null; // Assign your reel data emitter here

    var relay = new reelay();
    relay.addListener( { protocol: 'event', path: emitter, enableMixing: false } );
    relay.addForwarder( { protocol: 'udp', port: 50000, address: 'localhost' } );


Supported listeners
-------------------

### serial

Listen on a serial port:

    relay.addListener( { protocol: "serial", path: "auto" } );

Requires explicit installation of the serialport package:

    npm install serialport

### emitter

Listen on an event emitter:

    var emitter = null; // Assign your reel data emitter here
    relay.addListener( { protocol: 'event', path: emitter } );

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


