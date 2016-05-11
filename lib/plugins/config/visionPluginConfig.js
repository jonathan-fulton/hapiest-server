'use strict';

const VO = require('hapiest-vo');

class VisionPluginConfig extends VO {

    /**
     * @param {object} config
     * @param {boolean} config.enabled
     */
    constructor(config) {
        super();
        this._addProperties(config);
    }

    get enabled() { return this.get('enabled'); }

}

module.exports = VisionPluginConfig;