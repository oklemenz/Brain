'use strict';

const http = require('http');

const options = require('../env.json');
const endpoint = `${options.host}:${options.port}/${options.path}`;

module.exports = options;
module.exports.endpoint = endpoint;

function traverse(data, callback) {
    callback(data, null);
    traverseSub(data, data, callback);
}

function traverseSub(data, parent, callback) {
    if (data !== null && typeof data == 'object') {
        Object.entries(data).forEach(([key, value]) => {
            traverseSub(value, callback(value, parent) || parent, callback);
        });
    }
}

function enrichData(model, data) {
    traverse(data, (object, parent) => {
        if (object && object._type) {
            const type = global.model.Types[object._type];
            if (type) {
                Object.setPrototypeOf(object, type.prototype);
                object[global.model.Symbols.Root] = model;
                object[global.model.Symbols.Parent] = parent;
                return object;
            }
        }
        return parent;
    });
    return data;
}

function standardDeviation(data) {
    const avg = average(data);
    const squareDiffs = data.map((value) => {
        var diff = value - avg;
        return diff * diff;
    });
    const avgSquareDiff = average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

function average(data) {
    const sum = data.reduce((sum, value) => {
        return sum + value;
    }, 0);
    return sum / data.length;
}

function httpPost(cmd, data) {
    data = data || '';
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

Object.assign(module.exports, {
    traverse,
    enrichData,
    standardDeviation,
    average,
    httpPost,
    httpGet
});
