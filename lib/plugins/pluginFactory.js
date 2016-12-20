'use strict';

const Path = require('path');

// Routing plugins
const HapiRouter = require('hapi-router'); // Routing auto-config - https://github.com/bsiddiqui/hapi-router
const HapiTo = require('hapi-to'); // Convert route id --> URI, e.g., request.to('routeId', params, options) - https://github.com/mtharrison/hapi-to

// Automated Documentation
const Vision = require('vision'); // Templates view rendering - dependency for Lout
const Inert = require('inert'); // Static file delivery - dependency for Lout
const Lout = require('lout'); // Automatic documentation - https://github.com/hapijs/lout



class PluginFactory {

    /**
     * @param {PluginsConfig} pluginsConfig
     * @param {Logger} logger
     * @return {Array.object}
     */
    static createPluginsForAllConnections(pluginsConfig, logger) {
        const plugins = [];
        Internals.addGoodPlugin(pluginsConfig.good, plugins, logger);
        Internals.addPoopPlugin(pluginsConfig.poop, plugins);
        Internals.addBlippPlugin(pluginsConfig.blipp, plugins);

        return plugins;
    }

    /**
     * @param {PluginsConfig} pluginsConfig
     * @return {Array.object}
     */
    static createPluginsForCoreConnection(pluginsConfig) {
        const plugins = [];
        Internals.addVisionPlugin(pluginsConfig.vision, plugins);
        Internals.addInertPlugin(pluginsConfig.inert, plugins); // Required before HapiRouter so the routes can leverage inert
        Internals.addLoutPlugin(pluginsConfig.lout, plugins);
        Internals.addHapiRouterPlugin(pluginsConfig.hapiRouter, plugins);
        Internals.addHapiToPlugin(plugins);

        return plugins;
    }

}

module.exports = PluginFactory;

class Internals {

    /**
     * @param {GoodPluginConfig} config
     * @param {Array} plugins
     * @param {Logger} logger
     */
    static addGoodPlugin(config, plugins, logger) {
        if (config.enabled) {
            const Good = require('good'); // Logging plugin - https://github.com/hapijs/good
            const GoodWinston = require('good-winston');
            const defaultEvents = {
                log: '*',
                request: '*',
                response: '*',
                error: '*',
                ops: '*'
            };
            const events = config.events || defaultEvents;
            const reporters = [new GoodWinston(events, logger.getLogger())];

            plugins.push({
                register: Good, // Logging! Yay!
                options: {
                    reporters: reporters,
                    opsInterval: config.opsInterval || 1000
                }
            });
        }
    }

    /**
     * @param {PoopPluginConfig} config
     * @param {Array} plugins
     */
    static addPoopPlugin(config, plugins) {
        if (config.enabled) {
            const Poop = require('poop'); // Uncaught exceptions plugin - https://github.com/hapijs/poop
            plugins.push({
                register: Poop, // Handles uncaught exceptions by writing the heap to disk and closing the process
                options: {
                    logPath: config.poopFile
                }
            });
        }
    }

    /**
     * @param {BlippPluginConfig} config
     * @param {Array} plugins
     */
    static addBlippPlugin(config, plugins) {
        if (config.enabled) {
            const Blipp = require('blipp'); // Print routes on startup
            plugins.push({
                register: Blipp, // Prints routes to console on app startup
                options: {
                    showStart: config.showStart,
                    showAuth: config.showAuth
                }
            });
        }
    }

    /**
     * @param {HapiRouterPluginConfig} config
     * @param {Array} plugins
     */
    static addHapiRouterPlugin(config, plugins) {
        if (config.enabled) {
            plugins.push({
                register: HapiRouter, // Automatically include routes in specified folder during plugin configuration
                options: {
                    routes: config.routes // Match all files that end in *Routes.js within the routes folder
                }
            });
        }
    }

    /**
     * @param {Array} plugins
     */
    static addHapiToPlugin(plugins) {
        plugins.push({
            register: HapiTo // // Adds request.to(routeId, params, options)
        });
    }

    /**
     * @param {VisionPluginConfig} config
     * @param {Array} plugins
     */
    static addVisionPlugin(config, plugins) {
        if (config.enabled) {
            plugins.push({
                register: Vision // Templates view rendering - dependency for Lout
            });
        }
    }

    /**
     * @param {InertPluginConfig} config
     * @param {Array} plugins
     */
    static addInertPlugin(config, plugins) {
        if (config.enabled) {
            plugins.push({
                register: Inert // Static file delivery - dependency for Lout
            });
        }
    }

    /**
     * @param {LoutPluginConfig} config
     * @param {Array} plugins
     */
    static addLoutPlugin(config, plugins) {
        if (config.enabled) {
            plugins.push(
                {
                    register: Lout // Automatically adds documentation that appears at the /docs route
                }
            );
        }
    }
}

