# ain*

Brain-free [syslog](http://en.wikipedia.org/wiki/Syslog)** logging for 
[node.js](http://nodejs.org).

*Ain* written with full compatibility with *node.js* `console` module. It 
implements all `console` functions and formatting. Also *ain* supports UTF-8 
(tested on Debian Testing/Sid).

*Ain* by default sends messages by TCP to `127.0.0.1:514` udp can be specified instead by using the set() method

*In the Phoenician alphabet letter "ain" indicates eye.

**All examples tested under Debian Squeeze `rsyslog`. On other operating 
systems and logging daemons settings and paths may differ.

## Installation

You can install *ain* as usual - by copy "ain" directory in your 
`~/.node_libraries` or via *npm*

    npm install ain

## Usage

Usage of *ain* is very similar to *node.js* console. Following example 
demonstrates the replacement of the console:

    var console = require('ain');
    
    console.log('notice: %d', Date.now());
    console.info('info');
    console.error('error');
    
After launch in `/var/log/user` you can see the following:

    Dec  5 06:45:26 localhost ex.js[6041]: notice: 1291513526013
    Dec  5 06:45:26 localhost ex.js[6041]: info
    Dec  5 06:45:26 localhost ex.js[6041]: error
    
## Changing destinations

By default *ain* sets following destinations:

* `TAG` - `__filename`
* `Facility` - user (1)
* `HOSTNAME` - localhost

You can change them by `set` function. `set` function is chainable.

    var logger = require('ain')
            .set('node-test-app', 'daemon', 'devhost');
    logger.warn('some warning');
    
... and in `/var/log/daemon.log`:

    Dec  5 07:08:58 devhost node-test-app[10045]: some warning
    
`set` function takes three arguments: `tag`, `facility`, `hostname`, `sysloghost`, and `port`. All 
of these are optional.

`tag` and `hostname` arguments is just *RFC 3164* `TAG` and `HOSTNAME` of 
your messages.

`facility` is little more than just name. Refer to *Section 4.1.1* of 
[RFC 3164](http://www.faqs.org/rfcs/rfc3164.html) it can be:

    ##  String  Description
    -----------------------
     0  kern    kernel messages
     1  user    user-level messages
     2  mail    mail system
     3  daemon  system daemons
     4  auth    security/authorization messages
     5  syslog  messages generated internally by syslog daemon
     6  lpr     line printer subsystem
     7  news    network news subsystem
     8  uucp    UUCP subsystem
    16  local0  local use 0
    17  local1  local use 1
    18  local2  local use 2
    19  local3  local use 3
    20  local4  local use 4
    21  local5  local use 5
    22  local6  local use 6
    23  local7  local use 7

You can set `facility` by `String` or `Number`:

    logger.set('node-test-app', 3);
    logger.set('node-test-app', 'daemon');
    
Also you can set `TAG`, `Facility` and `HOSTNAME` separatelly by `setTag`, 
`setFacility` and `setHostname` functions. All of them is chainable too.

You can get all destinations by theese properties:

* `tag` TAG
* `facility` Numerical representation of RFC 3164 facility
* `hostname` HOSTNAME

`sysloghost` allows you to optionally specify an alternate remote syslog host:port, for example,
to send log messages to a syslog server running on the host `myloggingserver.com` using the default port (514),
specify `myloggingserver.com` -- to use a non-standard port, separate it from the hostname with a `:`,
example `myloggingserver.com:5140`.  The default is `localhost:514`.

`protocol` allows you to specify what transport protocol to use to send log messages, the default is `tcp`,
however, you can specify `udp` here for non-reliable log delivery over UDP.

## Logging

As noticed before *ain* implements all `console` functions. Severity level is 
referenced to [RFC 3164](http://www.faqs.org/rfcs/rfc3164.html):

    #  String   Description
    -----------------------
    0  emerg    Emergency: system is unusable
    1  alert    Alert: action must be taken immediately
    2  crit     Critical: critical conditions
    3  err      Error: error conditions
    4  warn     Warning: warning conditions
    5  notice   Notice: normal but significant condition
    6  info     Informational: informational messages
    7  debug    Debug: debug-level messages

*Ain* `console`-like functions behaviour is fully compatible to *node.js* and 
logs messages with different severity levels: 

* `log` - notice (5)
* `info` - info (6)
* `warn` - warn (4)
* `error` - err (3)
* `dir` - notice (5)
* `time`, `timeEnd` - notice (5)
* `trace` - err (3)
* `assert` - err (3)

To log message with desired severity level you can use `send` function:

    logger.send('message', 'alert');
    
`send` function takes two arguments: message and optional severity level. By 
default, severity level is *notice*.

## Additional loggers

After importing *ain* already has default logger. Everything that was 
described above - just about it.

If you need log message with different `TAG`, `facility` and `HOSTNAME` 
without touching default logger, you can get independent instance of logger 
by `get` function.

    var logger = require('ain').set('node-test-app', 'daemon', 'devhost');
    logger.warn('some warning');
    
    var anotherLogger = logger.get(logger.tag, 'local0', logger.hostname);
    anotherLogger.log('another messgage'); 

`get` function takes three arguments - as well as `set` function and return 
new logger object. This object is just new instance of "logger" and has all 
*ain* functions (including `get`). 


