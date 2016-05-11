'use strict';

module.exports = [
    {
        method: 'GET',
        path: '/healthcheck',
        handler: function (request, reply) {
            reply('Ok!');
        }
    }
];