# CHANGELOG

## v4.0.0

* Upgrade unix-dgram to 2.0.4
* Upgrade mocha to 8.3.2
* Replace deprecated [DEP0005] Buffer() to Buffer.from()

## v2.0.0

* Upgrade unix-dgram to 0.2.3 (josephfrazier)

## v1.5.2

* Fix socket bind problem in combination with cluster.js for node verions > v0.10.x (Issue #33)
* Have travis test more node versions

## v1.5.1

* Remove debug console.log (thx chazomaticus)

## v1.5.0

* Bubble up callbacks from udp and unix socket up to the caller

## v1.4.0

* Workaround for issue with node cluster on node 0.11.x (greenboxal)

## v1.3.1

* Added support for unix-dgram for node versions > 0.5
* Added travis build file to drive tests

## v1.2.1

* Reusing socket to send messages over UDP (Carlos Brito Lage/cblage)

## v1.1.1

Bugfix release

* The logging to file function crashed on unsupported systems due to
  immediate execution



## v1.1.0

* Custom message composer

## v1.0.0

WARNING: This upgrade is not API compatible to previous version.

* Change the API to actually use JavaScript's new operator to create loggers

		var SysLogger = require('ain2');
		var logger = new SysLogger({ port : 514, tag : 'myTag' });

* If you want to have singleton logger, use

		var logger = require('ain2').getInstance();

## v0.2.1

* Support for node v0.6.0 (Yoji Shidara/darashi)

## v0.2.0

* Support for unix sockets, for the 0.4.x branch of node (Parham Michael
  Ossareh/ossareh)

## v0.0.3

* Explicitly fall back to original `console` object to log send failures (Mark Wubben/novemberborn)
* Default hostname to machine name rather than localhost (Mark Wubben/novemberborn)
* Fixes to make jslint happy (Mark Wubben/novemberborn, Patrick
  Huesler/phuesler)
* Test server for local testing

## v0.0.2

* add support for custom host and port
