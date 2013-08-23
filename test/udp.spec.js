var dgram = require('dgram');
var should = require('chai').should();
var ain = require('../index');

describe('udp', function(){
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
    it('can send a udp buffer', function(done){
        logger.log('I will buff you up');
        callback = function(msg){
            msg.should.be.an.instanceof(Buffer);
            done();
        }
    });
});
