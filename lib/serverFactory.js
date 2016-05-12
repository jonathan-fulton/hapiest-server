'use strict';

const Path = require('path');
const Fs = require('fs');
const Url = require('url');

const Async = require('async');

// Core Hapi server
const Hapi = require('hapi');

const PluginFactory = require('./plugins/pluginFactory');
const ServerConfigEnums = require('./serverConfigEnums');

const ServerConfigFactory = require('./serverConfigFactory');
const ServerDependenciesFactory = require('./serverDependenciesFactory');
const LoggerSingleton = require('hapiest-logger/lib/loggerSingleton');

class ServerFactory {

    /**
     * @param {ServerConfig} config
     * @param {ServerDependencies} dependencies
     * @param {[function(server, options)]} beforeRoutingPlugins - e.g., hook up auth strategies
     * @param {function(err,server)} done
     */
    static createServer(config, dependencies, beforeRoutingPlugins, done) {
        const internals = new Internals(config, dependencies, beforeRoutingPlugins);
        return internals.createServer(done);
    }

    /**
     * @param {Config} nodeConfig
     * @param {string} projectRootDir
     * @param {[function(server, options)]} beforeRoutingPlugins - e.g., hook up auth strategies
     * @param {function(err,server)} done
     */
    static createServerFromNodeConfig(nodeConfig, projectRootDir, beforeRoutingPlugins, done) {
        const Logger = LoggerSingleton.getLogger();
        const config = ServerConfigFactory.createFromNodeConfig(nodeConfig, projectRootDir);
        const dependencies = ServerDependenciesFactory.createDependencies(projectRootDir, Logger);

        return ServerFactory.createServer(config, dependencies, beforeRoutingPlugins, done);
    }

}

module.exports = ServerFactory;

const SERVER_CORE = 'core';
const SERVER_REDIRECT = 'redirect';
const STANDARD_SSL_PORT = 443;

class Internals {

    /**
     * @param {ServerConfig} config
     * @param {ServerDependencies} dependencies
     * @param {[function(server, options)]} beforeRoutingPlugins
     */
    constructor(config, dependencies, beforeRoutingPlugins) {
        this.config = config;
        this.projectRootDir = dependencies.projectRootDir;
        this.logger = dependencies.logger;
        this.beforeRoutingPlugins = beforeRoutingPlugins;
    }

    /**
     * @param {function(err,server)} done
     */
    createServer(done) {
        const server = this._initializeServer();
        this._configureConnections(server);

        // Note, routes are configured by the hapi-routes plugin
        this._configurePlugins(server, (err) => {
            done(err, server);
        });
    }

    /**
     * @returns Hapi.Server
     */
    _initializeServer() {
        const server = new Hapi.Server();
        return server;
    }

    /**
     * @param {Hapi.Server} server
     */
    _configureConnections(server) {
        const coreConnectionConfig = this._getCoreConnectionConfig();
        server.connection(coreConnectionConfig);
        this._createHttpToHttpsRedirectConnectionIfNecessary(server);
    }

    /**
     * @returns {object}
     */
    _getCoreConnectionConfig() {
        let conConfig = this._getBaseConnectionConfig(this.config.host, this.config.port, [SERVER_CORE]);
        this._addSslConfig(conConfig);

        return conConfig;
    }

    /**
     * @param host
     * @param port
     * @param {Array} labels
     */
    _getBaseConnectionConfig(host, port, labels) {
        return {
            host: host,
            port: port,
            router: {
                stripTrailingSlash: true
            },
            labels: labels
        }
    }

    /**
     * @param {object} conConfig
     */
    _addSslConfig(conConfig) {
        if (this.config.sslEnabled) {
            this._addTlsKeyCert(conConfig);
        }
    }

    /**
     * @param {object} conConfig
     */
    _addTlsKeyCert(conConfig) {
        if (this.config.sslKeyMethod === ServerConfigEnums.SslKeyMethod.FILE) {
            const keyPath = Path.join(this.projectRootDir, this.config.sslKeyFile);
            const certPath = Path.join(this.projectRootDir, this.config.sslCertificateFile);

            conConfig.tls = {
                key: Fs.readFileSync(keyPath, 'utf8'),
                cert: Fs.readFileSync(certPath, 'utf8')
            };
        } else if (this.config.sslKeyMethod === ServerConfigEnums.SslKeyMethod.DIRECT) {
            conConfig.tls = {
                key: this.config.sslKey,
                cert: this.config.sslCertificate
            };
        } else {
            throw new Error('Invalid server configuration for sslKeyMethod (' + this.config.sslKeyMethod + ')');
        }
    }

    /**
     * Adds an HTTP connection to the server to handle redirects if SSL is enabled and redirectHttpToHttps is on
     * Defaults to port 80 if it's available and 8080 if it's not
     *
     * @param {Hapi.Server} server
     */
    _createHttpToHttpsRedirectConnectionIfNecessary(server) {
        if (this._shouldCreateHttpToHttpsRedirectConnection()) {
            let redirectConConfig = this._getBaseConnectionConfig(this.config.host, this.config.redirectPort, [SERVER_REDIRECT]);
            server.connection(redirectConConfig);
            this._addHttpToHttpsCatchAllRoute(server);
        } else if (this._shouldAddHttpToHttpsOnRequestExtension()) {
            this._addHttpToHttpsOnRequestExtension(server);
        }
    }

    _shouldCreateHttpToHttpsRedirectConnection() {
        return (
                this.config.redirectHttpToHttps &&
                this.config.redirectMethod === ServerConfigEnums.HttpToHttpsMethod.REDIRECT_SERVER
        );
    }

    _shouldAddHttpToHttpsOnRequestExtension() {
        return (
            this.config.redirectHttpToHttps &&
            this.config.redirectMethod === ServerConfigEnums.HttpToHttpsMethod.HEADER_INSPECTION
        );
    }

    /**
     * @param {Hapi.Server} server
     */
    _addHttpToHttpsCatchAllRoute(server) {
        const serverConfig = this.config;
        server.select(SERVER_REDIRECT).route({
            method: 'GET',
            path: '/{path*}',
            handler: function (request, reply) {
                const url = this._getUrlForHttpToHttpsRedirectServer(request.path, serverConfig);
                reply().redirect(url);
            }
        });
    }

    _getUrlForHttpToHttpsRedirectServer(path, serverConfig) {
        let urlConfig = {
            protocol: 'https',
            hostname: serverConfig.host,
            pathname: path
        };
        if (serverConfig.port !== STANDARD_SSL_PORT) {
            urlConfig.port = serverConfig.port;
        }
        return Url.format(urlConfig);
    }

    _addHttpToHttpsOnRequestExtension(server) {
        if (this.config.sslEnabled) {
            console.log('WARNING: SSL is currently enabled. You should either disable redirect by header inspection, disable SSL, or switch to redirect server');
        }

        const serverConfig = this.config;
        server.ext('onRequest', (request, reply) => {
            if (request.headers['x-forwarded-proto'] === 'http') {
                const url = this._getUrlForHttpToHttpsRedirectByHeaderInspection(request.info.hostname, request.path, serverConfig);
                reply.redirect(url).permanent();
            } else {
                reply.continue();
            }
        });
    }

    /**
     * @param hostanme
     * @param path
     * @param {ServerConfig} serverConfig
     * @returns {string}
     */
    _getUrlForHttpToHttpsRedirectByHeaderInspection(hostname, path, serverConfig) {
        let urlConfig = {
            protocol: 'https',
            hostname: hostname,
            pathname: path
        };
        if (serverConfig.redirectPort !== STANDARD_SSL_PORT) {
            urlConfig.port = serverConfig.redirectPort;
        }
        return Url.format(urlConfig);
    }

    /**
     * @param {Hapi.Server} server
     * @param {function(err)} done - func(err)
     */
    _configurePlugins(server, done) {
        Async.auto({
            configureAll: (next) => { this._configurePluginsAllConnections(server, next); },
            configureBeforeRouting: ['configureAll', (results, next) => {
                this._configurePluginsBeforeRouting(server, next);
            }],
            configureCore: ['configureBeforeRouting', (results, next) => {this._configurePluginsCoreConnection(server, next);}]
        }, done);
    }

    /**
     * @param {Hapi.Server} server
     * @param {function(err)} done - func(err)
     */
    _configurePluginsAllConnections(server, done) {
        const plugins = this._getPluginsAllConnections();
        this._configurePluginsBase(server, plugins, done);
    }

    /**
     * @param {Hapi.Server} server
     * @param {function(err)} done
     * @private
     */
    _configurePluginsBeforeRouting(server, done) {
        this._configurePluginsBase(server.select(SERVER_CORE), this.beforeRoutingPlugins, done);
    }

    /**
     * @param {Hapi.Server} server
     * @param {function(err)} done - func(err)
     */
    _configurePluginsCoreConnection(server, done) {
        const plugins = this._getPluginsCoreConnections();
        this._configurePluginsBase(server.select(SERVER_CORE), plugins, done);
    }

    /**
     * @param {Hapi.Server} server
     * @param {Object[]} plugins
     * @param {function(err)} done - func(err)
     */
    _configurePluginsBase(server, plugins, done) {
        server.register(plugins, (err) => {
            if (err) {
                this.logger.error('Error loading plugins', err);
            }
            return done(err);
        });
    }

    /**
     * @returns {Object[]}
     */
    _getPluginsAllConnections() {
        const plugins = PluginFactory.createPluginsForAllConnections(this.config.plugins, this.logger);
        return plugins;
    }

    /**
     * @returns {Object[]}
     */
    _getPluginsCoreConnections() {
        const plugins = PluginFactory.createPluginsForCoreConnection(this.config.plugins);
        return plugins;
    }
}