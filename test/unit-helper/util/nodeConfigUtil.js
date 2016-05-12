'use strict';

class NodeConfigUtil {

    static resetConfigDirectory(directory) {
        process.env.NODE_CONFIG_DIR = directory;
    }

}

module.exports = NodeConfigUtil;
