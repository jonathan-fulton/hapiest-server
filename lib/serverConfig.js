'use strict';

const VO = require('hapiest-vo');

class ServerConfig extends VO {

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
     * @param {string} [serverConfig.redirectMethod]
     * @param {string} [serverConfig.redirectPort]
     * @param {PluginsConfig} [serverConfig.plugins]
     */
    constructor(serverConfig) {
        super();
        this._addProperties(serverConfig);
    }

    /**
     * @returns {string}
     */
    get host() {return this.get('host')}

    /**
     * @returns {string|number}
     */
    get port() {return this.get('port')}

    /**
     * @returns {boolean}
     */
    get sslEnabled() {return this.get('sslEnabled')}

    /**
     * @returns {"direct"|"file"|null} - see ServerConfigEnums.SslKeyMethod
     */
    get sslKeyMethod() {return this.get('sslKeyMethod')}

    /**
     * @returns {string|null}
     */
    get sslKey() {return this.get('sslKey')}

    /**
     * @returns {string|null}
     */
    get sslCertificate() {return this.get('sslCertificate')}

    /**
     * @returns {string|null}
     */
    get sslKeyFile() {return this.get('sslKeyFile')}

    /**
     * @returns {string|null}
     */
    get sslCertificateFile() {return this.get('sslCertificateFile')}

    /**
     * @returns {boolean}
     */
    get redirectHttpToHttps() {return this.get('redirectHttpToHttps')}

    /**
     * @returns {"redirectServer"|"headerInspection"|null} - see ServerConfigEnums.HttpToHttpsMethod
     */
    get redirectMethod() {return this.get('redirectMethod')}

    /**
     * When redirectMethod = redirectServer, the port to bind the HTTP connection that will list to all URI's and redirect
     * When redirectMethod = headerInspection, the port to redirect traffic to, e.g., http://localhost:3000 --> https:localhost:3001 
     * @returns {number|null}
     */
    get redirectPort() {return this.get('redirectPort')}

    /**
     * @returns {PluginsConfig}
     */
    get plugins() {return this.get('plugins')}
    
}

module.exports = ServerConfig;