'use strict';

const ServerConfig = require('./serverConfig');
const PluginsConfig = require('./plugins/pluginsConfig');
const PluginsConfigFactory = require('./plugins/pluginsConfigFactory');

class ServerConfigFactory {

    /**
     * @param {Config} nodeConfig
     * @param {string} projectRootDir
     * @returns {ServerConfig}
     */
    static createFromNodeConfig(nodeConfig, projectRootDir) {
        let config = {
            host: nodeConfig.get('server.host'),
            port: nodeConfig.get('server.port')
        };

        Internals.mergeNodeConfigIntoConfig(config, nodeConfig, 'sslEnabled',          'server.sslEnabled');
        Internals.mergeNodeConfigIntoConfig(config, nodeConfig, 'sslKeyMethod',        'server.sslKeyMethod');
        Internals.mergeNodeConfigIntoConfig(config, nodeConfig, 'sslKey',              'server.sslKey');
        Internals.mergeNodeConfigIntoConfig(config, nodeConfig, 'sslCertificate',      'server.sslCertificate');
        Internals.mergeNodeConfigIntoConfig(config, nodeConfig, 'sslKeyFile',          'server.sslKeyFile');
        Internals.mergeNodeConfigIntoConfig(config, nodeConfig, 'sslCertificateFile',  'server.sslCertificateFile');
        Internals.mergeNodeConfigIntoConfig(config, nodeConfig, 'redirectHttpToHttps', 'server.redirectHttpToHttps');
        Internals.mergeNodeConfigIntoConfig(config, nodeConfig, 'redirectMethod',      'server.redirectMethod');
        Internals.mergeNodeConfigIntoConfig(config, nodeConfig, 'redirectPort',        'server.redirectPort');

        config.plugins = PluginsConfigFactory.createFromNodeConfig(nodeConfig, projectRootDir);


        return ServerConfigFactory.createFromJsObj(config);
    }

    /**
     * @param {object} serverConfig
     * @param {string} serverConfig.host
     * @param {string} serverConfig.port
     * @param {boolean} [serverConfig.sslEnabled]
     * @param {string} [serverConfig.sslKeyMethod]
     * @param {string} [serverConfig.sslKey]
     * @param {string} [serverConfig.sslCertificate]
     * @param {string} [serverConfig.sslKeyFile]
     * @param {string} [serverConfig.sslCertificateFile]
     * @param {boolean} [serverConfig.redirectHttpToHttps]
     * @param {string} [serverConfig.redirectHttpToHttpsMethod]
     * @param {string} [serverConfig.redirectServerPort]
     * @param {PluginsConfig|object} [serverConfig.plugins]
     * @returns {ServerConfig}
     */
    static createFromJsObj(serverConfig) {
        if (!(serverConfig.plugins instanceof PluginsConfig)) {
            serverConfig.plugins = PluginsConfigFactory.createFromJsObj(serverConfig.plugins || {});
        }
        return new ServerConfig(serverConfig);
    }
    
}

module.exports = ServerConfigFactory;

class Internals {
    /**
     * @param {object} obj
     * @param {Config} nodeConfig
     * @param {string} objProperty
     * @param {string} nodeConfigProperty
     */
    static mergeNodeConfigIntoConfig(obj, nodeConfig, objProperty, nodeConfigProperty) {
        if (nodeConfig.has(nodeConfigProperty)) {
            obj[objProperty] = nodeConfig.get(nodeConfigProperty);
        }
    }
}