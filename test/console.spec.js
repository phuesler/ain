var should = require('chai').should();
var ain = require('../index');
var dgram = require('dgram');

describe('implements the full console api', function(){
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
    it('info (info - 6)', function(done){
        callback = function(msg){
            msg.toString().should.contain('<14>');
            done();
        }
        logger.info('log me!');
    });
    it('log (notice - 5)', function(done){
        callback = function(msg){
            msg.toString().should.contain('<13>');
            done();
        }
        logger.log('log me!');
    });
    it('warn (warn - 4)', function(done){
        callback = function(msg){
            msg.toString().should.contain('<12>');
            done();
        }
        logger.warn('log me!');
    });
    it('error (err - 3)', function(done){
        callback = function(msg){
            msg.toString().should.contain('<11>');
            done();
        }
        logger.error('log me!');
    });
    it('dir (notice - 5)', function(done){
        callback = function(msg){
            msg.toString().should.contain('<13>');
            done();
        }
        logger.dir('log me!');
    });
    it('timeEnd (notice - 5)', function(done){
        callback = function(msg){
            msg.toString().should.contain('<13>');
            done();
        }
        logger.time();
        logger.timeEnd();
    });
    it('trace (err - 3)', function(done){
        callback = function(msg){
            msg.toString().should.contain('<11>');
            done();
        }
        logger.trace('log me!');
    });
    it('assert (err - 3)', function(done){
        callback = function(msg){
            msg.toString().should.contain('<11>');
            done();
        }
        logger.assert(false);
    });
    it('does not send a message if assertion is true', function(done){
        callback = function(msg){
            done(new Error(msg + ' was sent when none expected'));
        }
        setTimeout(done, 10);
        logger.assert(true);
    });
});

