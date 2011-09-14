var dgram = require('dgram'),
    Buffer = require('buffer').Buffer,
    events = require('events'),
    net = require('net'),
    sys = require('sys');

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
  if (typeof f !== 'string') {
    var objects = [], util = require('util');
    for (var i = 0; i < arguments.length; i++) {
      objects.push(util.inspect(arguments[i]));
    }
    return objects.join(' ');
  }
  
  var i = 1;
  var args = arguments;
  var str = String(f).replace(formatRegExp, function(x) {
    switch (x) {
      case '%s': return args[i++];
      case '%d': return +args[i++];
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for (var len = args.length; i < len; ++i) {
    str += ' ' + args[i];
  }
  return str;
}

function leadZero(n) {
    if (n < 10) {
        return '0' + n;
    } else {
        return n.toString();
    }
}

/**
 * Get current date in syslog format. Thanks https://github.com/kordless/lodge
 * @returns {String}
 */
function getDate() {
    var dt = new Date();
    var hours = leadZero(dt.getUTCHours());
    var minutes = leadZero(dt.getUTCMinutes());
    var seconds = leadZero(dt.getUTCSeconds());
    var month = leadZero((dt.getUTCMonth() + 1));
    var day = leadZero(dt.getUTCDate());
    var year = dt.getUTCFullYear();
    return year+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds;
}

/**
 * Syslog logger
 * @constructor
 * @returns {SysLogger}
 */
function SysLogger() {
    this._times = {};
    this._tcpConnection = null;
}
sys.inherits(SysLogger, events.EventEmitter);

/**
 * Send message with UDP
 * @param {String} message
 * @param {Severity} severity
 */
SysLogger.prototype._sendUDP = function(message, severity, tag) {
    var self = this;
    tag = tag || this.tag;
    var client = dgram.createSocket('udp4');
    var message = new Buffer('<' + (this.facility * 8 + severity) + '>' +
        getDate() + ' ' + this.hostname + ' ' + 
        tag + '[' + process.pid + ']:' + message);
    client.send(message, 0, message.length, this.port, this.sysloghost, 
        function(err) {
            if (err) {
              if(!self.quiet) console.error('Can\'t connect to '+this.sysloghost+':'+this.port + ':' + err);
              self.emit("error", 'Can\'t connect to '+this.sysloghost+':'+this.port + ':' + err);
            }
    });
    client.close();
};

/**
 * Setup our TCP connection to syslog, if appropriate
 */
SysLogger.prototype._setupTCP = function(done) {
  var self = this;
  this._tcpConnection = net.createConnection(this.port, this.sysloghost)
    .on("error", function(exception) {
      if(!self.quiet) console.log("tcp connect error : " + exception);
      self.emit("error", exception);
    })
    .on("close", function(had_error) {
      self._tcpConnection = null;
    })
    .on("connect", function() {
      done();
    });
};

/**
 * Send message with TCP
 * @param {String} message
 * @param {Severity} severity
 */
SysLogger.prototype._sendTCP = function(message, severity, tag, done) {
  var self = this;
  tag = tag || this.tag;
  if(this._tcpConnection == null) {
    this._setupTCP(function() {
      self._sendTCP(message, severity, tag, done);
    });
    return;
  }
  var msg = new Buffer('<' + (this.facility * 8 + severity) + '>' +
      getDate() + ' ' + this.hostname + ' ' + 
      tag + '[' + process.pid + ']:' + message);
  if(message.charAt(message.length-1) != '\n') msg+='\n';
  this._tcpConnection.write(msg, undefined, 
      function(err) {
          if (err) {
            if(!self.quiet) console.log('Can\'t connect to '+this.sysloghost+':'+this.port + ':' + err);
            self.emit("error", 'Can\'t connect to '+this.sysloghost+':'+this.port + ':' + err);
          }
          if(done !== undefined) done(err);
  });
};


/**
 * Init function. All arguments is optional
 * @param {String} tag By default is __filename
 * @param {Facility|Number|String} By default is "user"
 * @param {String} hostname log messages will appear from. By default is "localhost"
 * @param {String} Syslog server and optional port number, default is "localhost:514" 
 * @param {String} protocol to use for syslog communication, can be "tcp" or "udp".  Default is "tcp" 
 */
SysLogger.prototype.set = function(tag, facility, hostname, sysloghost, protocol, quiet) {
    this.setTag(tag);
    this.setFacility(facility);
    this.setHostname(hostname);
    this.setQuiet(quiet);
    if(sysloghost === undefined) sysloghost="localhost";
    loghost_and_port = sysloghost.split(':');
    this.setSyslogHost(loghost_and_port[0]);
    if(loghost_and_port.length > 1) {
      this.setPort(loghost_and_port[1])
    } else {
      this.setPort(514)
    }
    this.setProtocol(protocol);
    return this;
};

SysLogger.prototype.setTag = function(tag) {
    this.tag = tag || __filename;
    return this;
};
SysLogger.prototype.setFacility = function(facility) {
    this.facility = facility || Facility.user;
    if (typeof this.facility == 'string') 
        this.facility = Facility[this.facility];
    return this;
};
SysLogger.prototype.setHostname = function(hostname) {
    this.hostname = hostname || 'localhost';
    return this;
};
SysLogger.prototype.setPort = function(port) {
  this.port = port || 514;
  return this;
}
SysLogger.prototype.setProtocol = function(protocol) {
  if((this.protocol = protocol || "tcp") == "tcp") {
    SysLogger.prototype._send = SysLogger.prototype._sendTCP;
  } else {
    SysLogger.prototype._send = SysLogger.prototype._sendUDP;
  }

  return this;
}
SysLogger.prototype.setSyslogHost = function(sysloghost) {
  this.sysloghost = sysloghost || "localhost";
  return this;
}
SysLoggr.prototype.setQuier = function(quiet) {
  this.quiet = quiet || false;
  return this;
}
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
 * Send formatted message to syslog
 * @param {String} message
 * @param {Number|String} severity
 */
SysLogger.prototype.send = function(message, severity, tag, done) {
    severity = severity || Severity.notice;
    tag = tag || this.tag;
    if (typeof severity == 'string') severity = Severity[severity];
    this._send(message, severity, tag, done);
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
    var err = new Error;
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
