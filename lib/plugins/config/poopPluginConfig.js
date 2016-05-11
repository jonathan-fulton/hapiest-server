'use strict';

const VO = require('hapiest-vo');

class PoopPluginConfig extends VO {

    constructor(config) {
        super();
        this._addProperties(config);
    }

    get enabled() { return this.get('enabled'); }

    get poopFile() {return this.get('poopFile')}
}

module.exports = PoopPluginConfig;