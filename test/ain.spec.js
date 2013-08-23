var should = require('chai').should();
var ain = require('../index');
var fs = require('fs');

describe('ain', function(){
    it('should be a constructor', function(){
        ain.should.be.a('function');
    });
    it('allows fetching of a singleton', function(){
        ain.getInstance().should.be.equal(ain.getInstance());
    });
});
