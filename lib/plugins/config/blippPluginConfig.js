'use strict';

const VO = require('hapiest-vo');

class BlippPluginConfig extends VO {

    constructor(config) {
        super();

        this._addProperties(config);
    }

    get enabled() { return this.get('enabled'); }
    get showStart() { return this.get('showStart'); }
    get showAuth() { return this.get('showAuth'); }

}

module.exports = BlippPluginConfig;