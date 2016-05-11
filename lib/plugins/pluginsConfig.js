'use strict';

const Joi = require('joi');

const VO = require('hapiest-vo');

const PluginsConfigSchema = require('./pluginsConfigSchema');

class PluginsConfig extends VO {

    /**
     * @param {object} config
     * @param {BlippPluginConfig} config.blipp
     * @param {GoodPluginConfig} config.good
     * @param {VisionPluginConfig} config.vision
     * @param {InertPluginConfig} config.inert
     * @param {LoutPluginConfig} config.lout
     * @param {PoopPluginConfig} config.poop
     * @param {HapiRouterPluginConfig} config.hapiRouter
     */
    constructor(config) {
        super();

        const result = Joi.validate(config, PluginsConfigSchema);
        if (result.error) { throw result.error; }

        this._addProperties(config);
    }

    /**
     * @returns {BlippPluginConfig}
     */
    get blipp() { return this.get('blipp'); }

    /**
     * @returns {GoodPluginConfig}
     */
    get good() { return this.get('good'); }

    /**
     * @returns {VisionPluginConfig}
     */
    get vision() { return this.get('vision'); }

    /**
     * @returns {InertPluginConfig}
     */
    get inert() { return this.get('inert'); }

    /**
     * @returns {LoutPluginConfig}
     */
    get lout() { return this.get('lout'); }

    /**
     * @returns {PoopPluginConfig}
     */
    get poop() { return this.get('poop'); }

    /**
     * @returns {HapiRouterPluginConfig}
     */
    get hapiRouter() { return this.get('hapiRouter'); }
}

module.exports = PluginsConfig;
