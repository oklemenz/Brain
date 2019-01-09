'use strict';

const server = require('./controller/server');

process.on('SIGINT', function () {
    server.store();
    console.log(' Bye!');
    process.exit();
});

server.load();
server.start();
