var dgram = require('dgram');
var should = require('chai').should();
var ain = require('../index');

describe('sends different severity levels', function(){
    var server;
    var callback;
    var logger = new ain({port: 5514});
    before(function(){
        server = dgram.createSocket('udp4', function(msg, rinfo){
            if (callback) callback(msg);
        });
        server.bind(5514);
    });
    after(function(){
        server.close();
    });
    it('debug level (7)', function(done){
        logger.send('flyswatter', 'debug');
        callback = function(msg){
            msg.toString().should.contain('<15>');
            done();
        }
    });
    it('info level (6)', function(done){
        logger.send('tell me something useful', 'info');
        callback = function(msg){
            msg.toString().should.contain('<14>');
            done();
        }
    });
    it('notice level (5)', function(done){
        logger.send('this is final notice', 'notice');
        callback = function(msg){
            msg.toString().should.contain('<13>');
            done();
        }
    });
    it('warn level (4)', function(done){
        logger.send('error error!', 'warn');
        callback = function(msg){
            msg.toString().should.contain('<12>');
            done();
        }
    });
    it('error level (3)', function(done){
        logger.send('error error!', 'err');
        callback = function(msg){
            msg.toString().should.contain('<11>');
            done();
        }
    });
    it('critical level (2)', function(done){
        logger.send('it was super effective!', 'crit');
        callback = function(msg){
            msg.toString().should.contain('<10>');
            done();
        }
    });
    it('alert level (1)', function(done){
        logger.send('sound the horns!', 'alert');
        callback = function(msg){
            msg.toString().should.contain('<9>');
            done();
        }
    });
    it('emergency level (0)', function(done){
        logger.send('houston, we have a problem', 'emerg');
        callback = function(msg){
            msg.toString().should.contain('<8>');
            done();
        }
    });
});
