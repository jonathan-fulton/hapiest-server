'use strict';

const Path = require('path');
const PluginsConfig = require('./pluginsConfig');
const BlippPluginConfig = require('./config/blippPluginConfig');
const GoodPluginConfig = require('./config/goodPluginConfig');
const VisionPluginConfig = require('./config/visionPluginConfig');
const InertPluginConfig = require('./config/inertPluginConfig');
const LoutPluginConfig = require('./config/loutPluginConfig');
const PoopPluginConfig = require('./config/poopPluginConfig');
const HapiRouterPluginConfig = require('./config/hapiRouterPluginConfig');

const HapiRouter_DefaultRoutes = 'app/server/routes/**/*Routes.js';

class PluginsConfigFactory {

    /**
     * @param {Config} nodeConfig
     * @param {string} projectRootDir
     * @returns {PluginsConfig}
     */
    static createFromNodeConfig(nodeConfig, projectRootDir) {
        const config = {};

        if (nodeConfig.has('server.plugins.blipp')) {
            config.blipp = new BlippPluginConfig(nodeConfig.get('server.plugins.blipp'));
        }
        if (nodeConfig.has('server.plugins.good')) {
            config.good = new GoodPluginConfig(nodeConfig.get('server.plugins.good'));
        }
        if (nodeConfig.has('server.plugins.vision')) {
            config.vision = new VisionPluginConfig(nodeConfig.get('server.plugins.vision'));
        }
        if (nodeConfig.has('server.plugins.inert')) {
            config.inert = new InertPluginConfig(nodeConfig.get('server.plugins.inert'));
        }
        if (nodeConfig.has('server.plugins.lout')) {
            config.lout = new LoutPluginConfig(nodeConfig.get('server.plugins.lout'));
        }
        if (nodeConfig.has('server.plugins.poop')) {
            const poopConfig = nodeConfig.get('server.plugins.poop');
            if (poopConfig.poopFile) {
                poopConfig.poopFile = Path.join(projectRootDir, poopConfig.poopFile);
            } else {
                poopConfig.poopFile = Path.join(projectRootDir, 'poop.log');
            }
            config.poop = new PoopPluginConfig(poopConfig);
        }


        let hapiRouterConfig = {
            enabled: true,
            routes: HapiRouter_DefaultRoutes
        };
        if (nodeConfig.has('server.plugins.hapiRouter')) {
            hapiRouterConfig = nodeConfig.get('server.plugins.hapiRouter');
        }
        config.hapiRouter = new HapiRouterPluginConfig(hapiRouterConfig);

        return PluginsConfigFactory.createFromJsObj(config);
    }

    /**
     * @param {object} config
     * @returns {PluginsConfig}
     */
    static createFromJsObj(config) {
        if (!(config.blipp instanceof BlippPluginConfig)) {
            config.blipp = new BlippPluginConfig(config.blipp || {enabled: false});
        }
        if (!(config.good instanceof GoodPluginConfig)) {
            config.good = new GoodPluginConfig(config.good || {enabled: false});
        }
        if (!(config.vision instanceof VisionPluginConfig)) {
            config.vision = new VisionPluginConfig(config.vision || {enabled: false});
        }
        if (!(config.inert instanceof InertPluginConfig)) {
            config.inert = new InertPluginConfig(config.inert || {enabled: false});
        }
        if (!(config.lout instanceof LoutPluginConfig)) {
            config.lout = new LoutPluginConfig(config.lout || {enabled: false});
        }
        if (!(config.poop instanceof PoopPluginConfig)) {
            config.poop = new PoopPluginConfig(config.poop || {enabled: false});
        }
        if (!(config.hapiRouter instanceof HapiRouterPluginConfig)) {
            config.hapiRouter = new HapiRouterPluginConfig(config.hapiRouter || {enabled: true, routes: HapiRouter_DefaultRoutes});
        }
        
        return new PluginsConfig(config);
    }

}

module.exports = PluginsConfigFactory;