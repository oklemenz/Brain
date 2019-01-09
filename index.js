'use strict';

const server = require('./server');

process.on('SIGINT', function () {
    server.store();
    console.log(' Bye!');
    process.exit();
});

server.load();
server.start();
