'use strict';

const server = require('./controller/server');

process.on('SIGINT', function () {
    server.store();
    process.exit();
});

server.load();
server.start();
