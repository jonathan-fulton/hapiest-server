'use strict';

const Should = require('should');
const Path = require('path');
const EventEmitter = require('events');
const NodeConfig = require('config-uncached'); // Need config-uncached so we can reload the config files
const ServerFactory = require('../../lib/serverFactory');


describe('ServerFactory', function() {

    describe('createServerFromNodeConfig', function() {

        it ('Should create an HTTP server using config file', function(done) {

            const projectRootDir = Path.resolve(__dirname, '../unit-helper/serverFactory/projectRoot-nodeConfig');
            const configDir = Path.resolve(projectRootDir, 'config-1');

            process.env.NODE_CONFIG_DIR = configDir;

            ServerFactory.createServerFromNodeConfig(NodeConfig(true), projectRootDir, [], function(err, server) {
                if (err) { return done(err); }

                try {
                    (server).should.be.an.instanceOf(EventEmitter);
                    (server).should.have.property('connections');
                    (server.connections.length).should.eql(1);

                    (server).should.have.property('info');
                    (server.info.host).should.eql('localhost');
                    (server.info.port).should.eql(3003);
                    (server.info.protocol).should.eql('http');
                    (server.info.uri).should.eql('http://localhost:3003');
                    return done();
                } catch (e) {
                    return done(e);
                }
            });

        });

    });

});