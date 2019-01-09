'use strict';

const http = require('http');

const options = require('../env.json');

global.model = global.model || {};
global.model.Types = global.model.Types || {};
global.model.registerType = registerType;

const endpoint = `${options.host}:${options.port}/${options.path}`;

module.exports = options;
module.exports.endpoint = endpoint;

function traverse(data, callback) {
    callback(data);
    if (data !== null && typeof data == 'object') {
        Object.entries(data).forEach(([key, value]) => {
            traverse(value, callback);
        });
    }
}

function registerType(name, type) {
    global.model.Types[name] = type;
}

function fetchType(name) {
    return global.model && global.model.Types && global.model.Types[name];
}

function assignTypes(data) {
    traverse(data, (object) => {
        if (object && object._type) {
            const type = fetchType(object._type);
            if (type) {
                Object.setPrototypeOf(object, type.prototype);
            }
        }
    });
    return data;
}

function httpPost(data, cmd) {
    return new Promise((resolve, reject) => {
        const call = {
            host: options.host,
            port: options.port,
            path: `/${options.path}/${cmd}`,
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        const req = http.request(call, (res) => {
            res.setEncoding('utf8');
            let result = '';
            res.on('data', (chunk) => {
                result += chunk;
            });
            res.on('end', () => {
                resolve(result);
            });
        });
        req.on('error', (err) => {
            reject(err);
        });
        req.write(data);
        req.end();
    });
}

function httpGet(cmd) {
    return new Promise((resolve, reject) => {
        const call = {
            host: options.host,
            port: options.port,
            path: `/${options.path}/${cmd}`,
            method: 'GET'
        };
        const req = http.request(call, (res) => {
            res.setEncoding('utf8');
            let result = '';
            res.on('data', (chunk) => {
                result += chunk;
            });
            res.on('end', () => {
                resolve(result);
            });
        });
        req.on('error', (err) => {
            reject(err);
        });
        req.end();
    });
}

module.exports.traverse = traverse;
module.exports.assignTypes = assignTypes;
module.exports.httpPost = httpPost;
module.exports.httpGet = httpGet;
