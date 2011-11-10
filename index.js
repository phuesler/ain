var dgram = require('dgram');
var Buffer = require('buffer').Buffer;
var nodeConsole = console;

var DefaultHostname = require("os").hostname();
var DefaultAddress = "127.0.0.1";


function leadZero(n) {
    if (n < 10) {
        return '0' + n;
    } else {
        return n;
    }
}

/**
 * Get current date in syslog format. Thanks https://github.com/kordless/lodge
 * @returns {String}
 */
function getDate() {
    var dt = new Date();
    var hours = leadZero(dt.getHours());
    var minutes = leadZero(dt.getMinutes());
    var seconds = leadZero(dt.getSeconds());
    var month = dt.getMonth();
    var day = dt.getDate();
    if(day < 10){
      day = ' ' + day;
    }
    var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
            'Sep', 'Oct', 'Nov', 'Dec' ];
    return months[month] + " " + day + " " + hours + ":" + minutes + ":" + seconds;
}

var Transport = {
    UDP: function(message, severity) {
        var client = dgram.createSocket('udp4');
        var self = this;

        message = new Buffer('<' + (this.facility * 8 + severity) + '>' +
            getDate() + ' ' + this.hostname + ' ' + 
            this.tag + '[' + process.pid + ']:' + message);

        client.send(message,
                    0,
                    message.length,
                    this.port,
                    this.address,
                    function(err, bytes) {
                      self._logError(err, bytes);
                      client.close();
                    }
        );
    },

    file: (function() {
        var logTarget ;

        switch(require('os').type()) {
            case 'Darwin': 
                logTarget = '/var/run/syslog' ;
                break ;

            case 'Linux':
                logTarget = '/dev/log' ;
                break ;

            default:
                throw new Error('Unknown OS Type: ' + require('os').type()) ;

        }

        return function(message, severity) {
            var client = dgram.createSocket('unix_dgram') ;
            message = new Buffer('<' + (this.facility * 8 + severity) + '>' +
                getDate() + ' ' + this.hostname + ' ' + 
                this.tag + '[' + process.pid + ']:' + message);

            client.send(message,
                        0,
                        message.length,
                        logTarget,
                        this._logError
            );
            client.close() ;

        };
    })()
};

var Facility = {
    kern:   0,
    user:   1,
    mail:   2,
    daemon: 3,
    auth:   4,
    syslog: 5,
    lpr:    6,
    news:   7,
    uucp:   8,
    local0: 16,
    local1: 17,
    local2: 18,
    local3: 19,
    local4: 20,
    local5: 21,
    local6: 22,
    local7: 23
};

var Severity = {
    emerg:  0,
    alert:  1,
    crit:   2,
    err:    3,
    warn:   4,
    notice: 5,
    info:   6,
    debug:  7
};

// Format RegExp
var formatRegExp = /%[sdj]/g;

/**
 * Just copy from node.js console
 * @param f
 * @returns
 */
function format(f) {
  var   util = require('util'),
        i    = 0;

  if (typeof f !== 'string') {
    var objects = [];
    for (i = 0; i < arguments.length; i++) {
      objects.push(util.inspect(arguments[i]));
    }
    return objects.join(' ');
  }


  i = 1;
  var args = arguments;
  var str = String(f).replace(formatRegExp, function(x) {
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for (var len = args.length, x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + util.inspect(x);
    }
  }
  return str;
}

/**
 * Syslog logger
 * @constructor
 * @returns {SysLogger}
 */
function SysLogger() {
    this._times = {};
    this._logError = function(err, other) {
      if(err){
        nodeConsole.error('Cannot log message via %s:%d', this.hostname, this.port);
      }
    }.bind(this);
}

/**
 * Init function, takes a configuration object. If a hostname is provided the transport is assumed
 * to be Transport.UDP
 * @param {Object} configuration object with the following keys:
 *          - tag       - {String}                  By default is __filename
 *          - facility  - {Facility|Number|String}  By default is "user"
 *          - hostname  - {String}                  By default is require("os").hostname()
 *          - port      - {Number}                  Defaults to 514
 *          - transport - {Transport|String}        Defaults to Transport.UDP
 */
SysLogger.prototype.set = function(config) {
    config = config || {} ;

    this.setTag(config.tag);
    this.setFacility(config.facility);
    this.setHostname(config.hostname);
    this.setPort(config.port);
    if (config.hostname) {
        this.setTransport(Transport.UDP) ;
    } else {
        this.setTransport(config.transport) ;
    }
    
    return this;
};

SysLogger.prototype.setTransport = function(transport) {
    this.transport = transport || Transport.UDP;
    if (typeof this.transport == 'string') {
        this.transport = Transport[this.transport] ;
    }
    return this;
};

SysLogger.prototype.setTag = function(tag) {
    this.tag = tag || __filename;
    return this;
};
SysLogger.prototype.setFacility = function(facility) {
    this.facility = facility || Facility.user;
    if (typeof this.facility == 'string'){ 
        this.facility = Facility[this.facility];
    }
    return this;
};
SysLogger.prototype.setHostname = function(hostname) {
    if (hostname) {
      this.hostname = this.address = hostname;
    } else {
      this.hostname = DefaultHostname;
      this.address = DefaultAddress;
    }
    return this;
};

SysLogger.prototype.setPort = function(port) {
    this.port = port || 514;
    return this;
};

/**
 * Get new instance of SysLogger. All arguments is similar as `set` 
 * @returns {SysLogger}
 */
SysLogger.prototype.get = function() {
    var newLogger = new SysLogger();
    newLogger.set.apply(newLogger, arguments);
    return newLogger;
};

/**
 * Send message
 * @param {String} message
 * @param {Severity} severity
 */
SysLogger.prototype._send = function(message, severity) {
    this.transport(message, severity) ;
};

/**
 * Send formatted message to syslog
 * @param {String} message
 * @param {Number|String} severity
 */
SysLogger.prototype.send = function(message, severity) {
    severity = severity || Severity.notice;
    if (typeof severity == 'string'){
      severity = Severity[severity];
    }
    this._send(message, severity);
};

/**
 * Send log message with notice severity.
 */
SysLogger.prototype.log = function() {
    this._send(format.apply(this, arguments), Severity.notice);
};
/**
 * Send log message with info severity.
 */
SysLogger.prototype.info = function() {
    this._send(format.apply(this, arguments), Severity.info);
};
/**
 * Send log message with warn severity.
 */
SysLogger.prototype.warn = function() {
    this._send(format.apply(this, arguments), Severity.warn);
};
/**
 * Send log message with err severity.
 */
SysLogger.prototype.error = function() {
    this._send(format.apply(this, arguments), Severity.err);
};
/**
 * Send log message with debug severity.
 */
SysLogger.prototype.debug = function() {
    this._send(format.apply(this, arguments), Severity.debug);
};

/**
 * Log object with `util.inspect` with notice severity
 */
SysLogger.prototype.dir = function(object) {
    var util = require('util');
    this._send(util.inspect(object) + '\n', Severity.notice);
};

SysLogger.prototype.time = function(label) {
    this._times[label] = Date.now();
};
SysLogger.prototype.timeEnd = function(label) {
    var duration = Date.now() - this._times[label];
    this.log('%s: %dms', label, duration);
};

SysLogger.prototype.trace = function(label) {
    var err = new Error();
    err.name = 'Trace';
    err.message = label || '';
    Error.captureStackTrace(err, arguments.callee);
    this.error(err.stack);
};

SysLogger.prototype.assert = function(expression) {
    if (!expression) {
        var arr = Array.prototype.slice.call(arguments, 1);
        this._send(format.apply(this, arr), Severity.err);
    }
};

var logger = new SysLogger();
logger.set();
module.exports = logger;
