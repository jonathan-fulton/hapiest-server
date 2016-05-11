'use strict';

const VO = require('hapiest-vo');
const Logger = require('hapiest-logger');

class ServerDependencies extends VO {

    constructor(serverDependencies) {
        super();

        if (!serverDependencies.logger || !(serverDependencies.logger instanceof Logger)) {
            throw new Error('Invalid parameter logger passed to ServerDependencies constructor.  Must be instance of hapiest-logger (Logger)');
        }

        this._addProperties(serverDependencies);
    }

    /**
     * @returns {string}
     */
    get projectRootDir() {return this.get('projectRootDir');}

    /**
     * @returns {Logger}
     */
    get logger() {return this.get('logger');}

}

module.exports = ServerDependencies;
