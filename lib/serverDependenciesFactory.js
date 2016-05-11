'use strict';

const ServerDependencies = require('./serverDependencies');

class ServerDependenciesFactory {

    /**
     * @param {string} projectRootDir
     * @param {Logger} logger
     */
    static createDependencies(projectRootDir, logger) {
        return new ServerDependencies({
            projectRootDir: projectRootDir,
            logger: logger
        });
    }

}

module.exports = ServerDependenciesFactory;