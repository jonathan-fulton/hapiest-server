'use strict';

const VO = require('hapiest-vo');

class HapiRouterPluginConfig extends VO {

    constructor(config) {
        super();
        this._addProperties(config);
    }

    get enabled() { return this.get('enabled'); }

    get routes() { return this.get('routes'); }
}

module.exports = HapiRouterPluginConfig;
