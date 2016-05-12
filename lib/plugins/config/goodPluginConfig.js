'use strict';

const VO = require('hapiest-vo');

class GoodPluginConfig extends VO {

    constructor(config) {
        super();
        this._addProperties(config);
    }

    get enabled() { return this.get('enabled'); }
}

module.exports = GoodPluginConfig;