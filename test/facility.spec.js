var should = require('chai').should();
var ain = require('../index');
var dgram = require('dgram');

describe('facilities', function(){
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
    it('sends the kern facility', function(done){
        logger.setFacility('kern').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<5>');
            done();
        }
    });
    it('sends the user facility', function(done){
        logger.setFacility('user').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<13>');
            done();
        }
    });
    it('sends the mail facility', function(done){
        logger.setFacility('mail').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<21>');
            done();
        }
    });
    it('sends the daemon facility', function(done){
        logger.setFacility('daemon').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<29>');
            done();
        }
    });
    it('sends the auth facility', function(done){
        logger.setFacility('auth').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<37>');
            done();
        }
    });
    it('sends the syslog facility', function(done){
        logger.setFacility('syslog').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<45>');
            done();
        }
    });
    it('sends the lpr facility', function(done){
        logger.setFacility('lpr').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<53>');
            done();
        }
    });
    it('sends the news facility', function(done){
        logger.setFacility('news').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<61>');
            done();
        }
    });
    it('sends the uucp facility', function(done){
        logger.setFacility('uucp').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<69>');
            done();
        }
    });
    it('sends the local0 facility', function(done){
        logger.setFacility('local0').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<133>');
            done();
        }
    });
    it('sends the local1 facility', function(done){
        logger.setFacility('local1').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<141>');
            done();
        }
    });
    it('sends the local2 facility', function(done){
        logger.setFacility('local2').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<149>');
            done();
        }
    });
    it('sends the local3 facility', function(done){
        logger.setFacility('local3').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<157>');
            done();
        }
    });
    it('sends the local4 facility', function(done){
        logger.setFacility('local4').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<165>');
            done();
        }
    });
    it('sends the local5 facility', function(done){
        logger.setFacility('local5').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<173>');
            done();
        }
    });
    it('sends the local6 facility', function(done){
        logger.setFacility('local6').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<181>');
            done();
        }
    });
    it('sends the local7 facility', function(done){
        logger.setFacility('local7').log('hi');
        callback = function(msg){
            msg.toString().should.contain('<189>');
            done();
        }
    });
});

