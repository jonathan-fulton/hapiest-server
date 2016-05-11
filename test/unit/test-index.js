'use strict';

const Should = require('should');
const ServerFactory = require('../../index');

describe('index.js', function() {
    it('Should expose the function createServer', function() {
        ServerFactory.should.be.a.Function();
        ServerFactory.name.should.eql('ServerFactory');
        ServerFactory.createServer.should.be.a.Function();
    });
});