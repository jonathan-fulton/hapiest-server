'use strict';

const NodeConfig = require('config');
const ServerConfig = require('./serverConfig');
const PluginsConfig = require('./plugins/pluginsConfig');
const PluginsConfigFactory = require('./plugins/pluginsConfigFactory');

class ServerConfigFactory {

    /**
     * @return {ServerConfig}
     */
    static createFromNodeConfig(projectRootDir) {
        let config = {
            host: NodeConfig.get('server.host'),
            port: NodeConfig.get('server.port')
        };

        if (NodeConfig.has('server.sslEnabled')) { config.sslEnabled = NodeConfig.has('server.sslEnabled'); }
        if (NodeConfig.has('server.sslKeyMethod')) { config.sslKeyMethod = NodeConfig.has('server.sslKeyMethod'); }
        if (NodeConfig.has('server.sslKey')) { config.sslKey = NodeConfig.has('server.sslKey'); }
        if (NodeConfig.has('server.sslCertificate')) { config.sslCertificate = NodeConfig.has('server.sslCertificate'); }
        if (NodeConfig.has('server.sslKeyFile')) { config.sslKeyFile = NodeConfig.has('server.sslKeyFile'); }
        if (NodeConfig.has('server.sslCertificateFile')) { config.sslCertificateFile = NodeConfig.has('server.sslCertificateFile'); }
        if (NodeConfig.has('server.redirectHttpToHttps')) { config.redirectHttpToHttps = NodeConfig.has('server.redirectHttpToHttps'); }
        if (NodeConfig.has('server.redirectMethod')) { config.redirectMethod = NodeConfig.has('server.redirectMethod'); }
        if (NodeConfig.has('server.redirectPort')) { config.sslEnabled = NodeConfig.has('server.redirectPort'); }

        config.plugins = PluginsConfigFactory.createFromNodeConfig(projectRootDir);


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
     */
    static createFromJsObj(serverConfig) {
        if (!(serverConfig.plugins instanceof PluginsConfig)) {
            serverConfig.plugins = PluginsConfigFactory.createFromJsObj(serverConfig.plugins || {});
        }
        return new ServerConfig(serverConfig);
    }
    
}

module.exports = ServerConfigFactory;