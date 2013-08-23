var unixDgram = require('unix-dgram');
var should = require('chai').should();
var ain = require('../index');
var fs = require('fs');

describe('unix dgram', function(){
    var server;
    var callback;
    var logger = new ain({address: __dirname + '/socket', transport: 'unix_dgram'});
    before(function(done){
        server = unixDgram.createSocket('unix_dgram', function(msg, rinfo){
            if (callback) callback(msg);
        });
        server.bind(__dirname + '/socket');
        setTimeout(done, 1000); // give the socket time to open
    });
    after(function(){
        server.close();
        try{fs.unlinkSync(__dirname + '/socket'); } catch(e){};
    });
    it('can send a unix dgram buffer', function(done){
        logger.log('hello world');
        callback = function(msg){
            msg.should.be.an.instanceof(Buffer);
            msg.toString().should.contain('hello world');
            done();
        }
    });
});
