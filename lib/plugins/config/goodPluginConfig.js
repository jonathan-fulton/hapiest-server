'use strict';

const VO = require('hapiest-vo');

class GoodPluginConfig extends VO {

    constructor(config) {
        super();
        this._addProperties(config);
    }

    get enabled() { return this.get('enabled'); }

    get events() { return this.get('events'); }

    get opsInterval() { return this.get('opsInterval') }
}

module.exports = GoodPluginConfig;