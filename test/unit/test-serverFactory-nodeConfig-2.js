'use strict';

const Should = require('should');
const Path = require('path');
const EventEmitter = require('events');
const NodeConfig = require('config-uncached'); // Need config-uncached so we can reload the config files
const ServerFactory = require('../../lib/serverFactory');

describe('ServerFactory', function() {

    describe('createServerFromNodeConfig', function() {

        it ('Should create a server with both HTTP & HTTPS connections using config file', function(done) {

            const projectRootDir = Path.resolve(__dirname, '../unit-helper/serverFactory/projectRoot-nodeConfig');
            const configDir = Path.resolve(projectRootDir, 'config-2');

            process.env.NODE_CONFIG_DIR = configDir;

            ServerFactory.createServerFromNodeConfig(NodeConfig(true), projectRootDir, [], function(err, server) {
                if(err) { done(err); }

                try {
                    (server).should.be.an.instanceOf(EventEmitter);
                    (server).should.have.property('connections');
                    (server.connections.length).should.eql(2);

                    const coreServer = server.select('core');
                    (coreServer).should.be.an.instanceOf(EventEmitter);
                    (coreServer).should.have.property('connections');
                    (coreServer.connections.length).should.eql(1);
                    (coreServer.connections[0]).should.have.property('info');
                    (coreServer.connections[0].info.host).should.eql('localhost');
                    (coreServer.connections[0].info.port).should.eql(3004);
                    (coreServer.connections[0].info.protocol).should.eql('https');
                    (coreServer.connections[0].info.uri).should.eql('https://localhost:3004');

                    const redirectServer = server.select('redirect');
                    (redirectServer).should.be.an.instanceOf(EventEmitter);
                    (redirectServer).should.have.property('connections');
                    (redirectServer.connections.length).should.eql(1);
                    (redirectServer.connections[0]).should.have.property('info');
                    (redirectServer.connections[0].info.host).should.eql('localhost');
                    (redirectServer.connections[0].info.port).should.eql(3003);
                    (redirectServer.connections[0].info.protocol).should.eql('http');
                    (redirectServer.connections[0].info.uri).should.eql('http://localhost:3003');

                    return done();
                } catch(e) {
                    return done(e);
                }
            });

        });

    });

});