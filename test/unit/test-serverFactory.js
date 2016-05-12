'use strict';

const Should = require('should');
const Async = require('async');
const EventEmitter = require('events');
const Path = require('path');
const NodeConfig = require('config-uncached'); // Need config-uncached so we can reload the config files

const LoggerConfigFactory = require('hapiest-logger/lib/loggerConfigFactory');
const LoggerFactory = require('hapiest-logger/lib/loggerFactory');
const loggerConfig = LoggerConfigFactory.createFromJsObj({
    enabled: false,
    consoleTransport: {
        enabled: true,
        level: "debug",
        colorize: true
    }
});
const logger = LoggerFactory.createLogger(loggerConfig);

const ServerFactory = require('../../lib/serverFactory');
const ServerConfigFactory = require('../../lib/serverConfigFactory');
const ServerDependenciesFactory = require('../../lib/serverDependenciesFactory');

const projectRootDir = Path.resolve(__dirname, '../unit-helper/serverFactory/projectRoot');
const serverDependencies = ServerDependenciesFactory.createDependencies(projectRootDir, logger);
const beforeRoutingPlugins = [];

describe('ServerFactory', function() {
    
    describe('createServer', function() {
       
        it('should return a Hapi server object with one connection at http://localhost:30000', function(done) {
            const config = getBasicHttpServerConfig();
            Async.auto({
                server: Async.apply(ServerFactory.createServer, config, serverDependencies, beforeRoutingPlugins)
            }, (err, result) => {
                if (err) { return done(err); }

                try {
                    const server = result.server;

                    (server).should.be.an.instanceOf(EventEmitter);
                    (server).should.have.property('connections');
                    (server.connections.length).should.eql(1);

                    (server).should.have.property('info');
                    (server.info.host).should.eql('localhost');
                    (server.info.port).should.eql(30000);
                    (server.info.protocol).should.eql('http');
                    (server.info.uri).should.eql('http://localhost:30000');
                    return done();
                } catch (e) {
                    return done(e);
                }
            });
        });

        it('should return a Hapi server object with two connections, https://localhost:30000 and http://localhost:30001', function(done) {
            const config = getHttpsWithHttpRedirectServerConfig();

            Async.auto({
                server: Async.apply(ServerFactory.createServer, config, serverDependencies, beforeRoutingPlugins)
            }, (err, result) => {

                if(err) { done(err); }

                try {
                    const server = result.server;

                    (server).should.be.an.instanceOf(EventEmitter);
                    (server).should.have.property('connections');
                    (server.connections.length).should.eql(2);

                    const coreServer = server.select('core');
                    (coreServer).should.be.an.instanceOf(EventEmitter);
                    (coreServer).should.have.property('connections');
                    (coreServer.connections.length).should.eql(1);
                    (coreServer.connections[0]).should.have.property('info');
                    (coreServer.connections[0].info.host).should.eql('localhost');
                    (coreServer.connections[0].info.port).should.eql(30000);
                    (coreServer.connections[0].info.protocol).should.eql('https');
                    (coreServer.connections[0].info.uri).should.eql('https://localhost:30000');

                    const redirectServer = server.select('redirect');
                    (redirectServer).should.be.an.instanceOf(EventEmitter);
                    (redirectServer).should.have.property('connections');
                    (redirectServer.connections.length).should.eql(1);
                    (redirectServer.connections[0]).should.have.property('info');
                    (redirectServer.connections[0].info.host).should.eql('localhost');
                    (redirectServer.connections[0].info.port).should.eql(30001);
                    (redirectServer.connections[0].info.protocol).should.eql('http');
                    (redirectServer.connections[0].info.uri).should.eql('http://localhost:30001');

                    return done();
                } catch(e) {
                    return done(e);
                }
            });
        });

        it('should return a Hapi server object with one connection at http://localhost:30000', function(done) {
            const config = getHttpConfigWithHeaderRedirect();

            Async.auto({
                server: Async.apply(ServerFactory.createServer, config, serverDependencies, beforeRoutingPlugins),
                redirectResponse: ['server', (result, next) => {
                    result.server.inject({
                        method: 'GET',
                        url: '/',
                        headers: {
                            'x-forwarded-proto': 'http'
                        }
                    }, (res) => { return next(null, res); });
                }],
                nonRedirectResponse: ['server', (result, next) => {
                    result.server.inject({
                        method: 'GET',
                        url: '/healthcheck'
                    }, (res) => { return next(null, res); })
                }]
            }, (err, result) => {

                if (err) { return done(err); }

                try {
                    (result).should.have.property('server');
                    (result).should.have.property('redirectResponse');
                    (result).should.have.property('nonRedirectResponse');

                    const server = result.server;

                    (server).should.be.an.instanceOf(EventEmitter);
                    (server).should.have.property('connections');
                    (server.connections.length).should.eql(1);

                    (server).should.have.property('info');
                    (server.info.host).should.eql('localhost');
                    (server.info.port).should.eql(30000);
                    (server.info.protocol).should.eql('http');
                    (server.info.uri).should.eql('http://localhost:30000');

                    const redirectResponse = result.redirectResponse;

                    Should.exist(redirectResponse);
                    (redirectResponse).should.have.property('statusCode');
                    (redirectResponse.statusCode).should.eql(301);
                    (redirectResponse).should.have.property('headers');
                    (redirectResponse.headers).should.have.property('location');
                    (redirectResponse.headers.location).should.eql('https://localhost:30001/');

                    const nonRedirectResponse = result.nonRedirectResponse;

                    (nonRedirectResponse).should.have.property('statusCode');
                    (nonRedirectResponse.statusCode).should.eql(200);

                    done();
                } catch (e) {
                    done(e);
                }
            });
        });
        
    });

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

/**
 * @returns {Config}
 */
function getBasicHttpServerConfig() {
    const configObj = {
        host: 'localhost',
        port: '30000',
        plugins: {
            blipp: { enabled: true },
            good: { enabled: true },
            lout: { enabled: true },
            poop: { enabled: true }
        }
    };
    const config = ServerConfigFactory.createFromJsObj(configObj);

    return config;
}

/**
 * @returns {Config}
 */
function getHttpsWithHttpRedirectServerConfig() {
    const configObj = {
        host: 'localhost',
        port: '30000',
        sslEnabled: true,
        sslKeyMethod: 'file',
        sslKeyFile: 'config/certs/local/key.pem',
        sslCertificateFile: 'config/certs/local/server.crt',
        redirectHttpToHttps: true,
        redirectMethod: 'redirectServer',
        redirectPort: '30001',
        plugins: {
            blipp: { enabled: true },
            good: { enabled: true },
            lout: { enabled: true },
            poop: { enabled: true },
            hapiRouter: { enabled: true, routes: 'test/unit-helper/serverFactory/projectRoot/routes/**/*Routes.js'}
        }
    };
    const config = ServerConfigFactory.createFromJsObj(configObj);

    return config;
}

/**
 * @returns {Config}
 */
function getHttpConfigWithHeaderRedirect() {
    const configObj = {
        host: 'localhost',
        port: '30000',
        redirectHttpToHttps: true,
        redirectMethod: 'headerInspection',
        redirectPort: '30001',
        plugins: {
            blipp: { enabled: true },
            good: { enabled: true },
            lout: { enabled: true },
            poop: { enabled: true },
            hapiRouter: { enabled: true, routes: 'test/unit-helper/serverFactory/projectRoot/routes/**/*Routes.js'}
        }
    };
    const config = ServerConfigFactory.createFromJsObj(configObj);

    return config;
}