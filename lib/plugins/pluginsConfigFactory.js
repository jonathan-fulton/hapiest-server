'use strict';

const Path = require('path');
const NodeConfig = require('config');
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
     * @returns {*}
     */
    static createFromNodeConfig(projectRootDir) {
        const config = {};

        if (NodeConfig.has('server.plugins.blipp.enabled')) {
            config.blipp = new BlippPluginConfig({ enabled: NodeConfig.get('server.plugins.blipp.enabled') });
        }
        if (NodeConfig.has('server.plugins.good.enabled')) {
            const goodPluginConfig = {
                enabled: NodeConfig.get('server.plugins.good.enabled'),
                consoleReporterEnabled: NodeConfig.has('server.plugins.good.consoleReporterEnabled') &&
                                            NodeConfig.get('server.plugins.good.consoleReporterEnabled') || false
            };

            config.good = new GoodPluginConfig(goodPluginConfig);
        }
        if (NodeConfig.has('server.plugins.vision')) {
            config.vision = new VisionPluginConfig({enabled: NodeConfig.get('server.plugins.vision.enabled')});
        }
        if (NodeConfig.has('server.plugins.inert')) {
            config.inert = new InertPluginConfig({enabled: NodeConfig.get('server.plugins.inert.enabled')});
        }
        if (NodeConfig.has('server.plugins.lout.enabled')) {
            config.lout = new LoutPluginConfig({ enabled: NodeConfig.get('server.plugins.lout.enabled') });
        }
        if (NodeConfig.has('server.plugins.poop.enabled')) {
            const poopConfig = { enabled: NodeConfig.get('server.plugins.poop.enabled') };
            if (NodeConfig.has('server.plugins.poop.poopFile')) {
                poopConfig.poopFile = Path.join(projectRootDir, NodeConfig.get('server.plugins.poop.poopFile'));
            } else {
                poopConfig.poopFile = Path.join(projectRootDir, 'poop.log');
            }
            config.poop = new PoopPluginConfig();
        }


        if (NodeConfig.has('server.plugins.hapiRouter.enabled')) {
            const hapiRouterConfig = { enabled: NodeConfig.get('server.plugins.hapiRouter.enabled') };
            if (NodeConfig.has('server.plugins.hapiRouter.routes')) {
                hapiRouterConfig.routes = NodeConfig.get('server.plugins.hapiRouter.routes');
            } else {
                hapiRouterConfig.routes = HapiRouter_DefaultRoutes;
            }
        } else {
            const hapiRouterConfig = {
                enabled: true,
                routes: HapiRouter_DefaultRoutes
            }
        }

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