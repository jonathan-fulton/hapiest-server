'use strict';

const Should = require('should');
const NodeConfig = require('config-uncached');
const NodeConfigUtil = require('../unit-helper/util/nodeConfigUtil');
const Path = require('path');
const PluginConfigFactory = require('../../lib/plugins/pluginsConfigFactory');

describe('PluginConfigFactory', function() {
    
    describe('createFromNodeConfig', function() {
        it('Should return plugins defined in config-1/test.json', function() {

            const projectRootDir = Path.resolve(__dirname, '../unit-helper/pluginConfigFactory/projectRoot-nodeConfig');
            const nodeConfigDir = Path.resolve(projectRootDir, 'config-1');
            NodeConfigUtil.resetConfigDirectory(nodeConfigDir);
            const nodeConfig = NodeConfig(true);

            const pluginConfig = PluginConfigFactory.createFromNodeConfig(nodeConfig, projectRootDir);
            
            Should.exist(pluginConfig);
            pluginConfig.blipp.enabled.should.be.false;
            pluginConfig.good.enabled.should.be.true;
            Should.not.exist(pluginConfig.good.events);
            pluginConfig.good.opsInterval.should.eql(5000);
            pluginConfig.vision.enabled.should.be.false;
            pluginConfig.inert.enabled.should.be.false;
            pluginConfig.lout.enabled.should.be.false;
            pluginConfig.poop.enabled.should.be.false;
            pluginConfig.hapiRouter.enabled.should.be.true;
            pluginConfig.hapiRouter.routes.should.eql('app/server/routes/**/*Routes.js');
        });

        it('Should return plugins defined in config-2/test.json', function() {

            const projectRootDir = Path.resolve(__dirname, '../unit-helper/pluginConfigFactory/projectRoot-nodeConfig');
            const nodeConfigDir = Path.resolve(projectRootDir, 'config-2');
            NodeConfigUtil.resetConfigDirectory(nodeConfigDir);
            const nodeConfig = NodeConfig(true);

            const pluginConfig = PluginConfigFactory.createFromNodeConfig(nodeConfig, projectRootDir);

            Should.exist(pluginConfig);
            pluginConfig.blipp.enabled.should.be.false;
            pluginConfig.good.enabled.should.be.true;
            pluginConfig.good.events.should.deepEqual({
                log: '*',
                request: '*'
            });
            pluginConfig.good.opsInterval.should.eql(2000);
            pluginConfig.vision.enabled.should.be.true;
            pluginConfig.inert.enabled.should.be.true;
            pluginConfig.lout.enabled.should.be.false;
            pluginConfig.poop.enabled.should.be.true;
            pluginConfig.hapiRouter.enabled.should.be.true;
            pluginConfig.hapiRouter.routes.should.eql('app/server/modules/**/*Routes.js');
        });
    });
    
});