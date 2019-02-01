'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const Path = require('path');

const {endpoint, port, path} = require('../common/util');
const {Model} = require('../model');

const trainingDir = './training';
const modelData = './data.json';

const model = new Model();

const app = express();
app.use(bodyParser.text());

var router = express.Router();
router.post(`/in`, function (req, res) {
    const data = req.body;
    if (model.input(data)) {
        respond(res, model.output());
    } else {
        respond(res, 'zzzZZZ');
    }
});

router.get(`/out`, function (req, res) {
    respond(res, model.output());
});

router.post(`/sleep`, function (req, res) {
    model.sleep();
    respond(res, 'zzzZZZ');
});

router.post(`/wake`, function (req, res) {
    model.wake();
    respond(res, 'Yes...');
});

router.post(`/wait`, function (req, res) {
    model.wait();
    respond(res, '...?');
});

router.post(`/train`, function (req, res) {
    const fileList = [];
    walkSync(Path.resolve(trainingDir), fileList);
    fileList.forEach(((file) => {
        const trainData = require(file);
        trainData.forEach((trainLine) => {
            model.wait();
            trainLine.dialog.forEach((dialog) => {
                model.input(dialog.text);
            });
        });
    }));
    respond(res, 'Puh!');
});

router.post(`/store`, function (req, res) {
    store();
    respond(res, 'Yep!');
});

router.post(`/reset`, function (req, res) {
    model.reset();
    store();
    respond(res, 'Free!');
});

app.use(`/${path}`, router);

function respond(res, text) {
    res.send(text);
    console.log(text);
}

function load() {
    if (fs.existsSync(modelData)) {
        console.log('Hang on...');
        model.load(fs.readFileSync(modelData));
        console.log('Hi!');
    }
}

function store() {
    fs.writeFileSync(modelData, model.store());
}

function start() {
    app.listen(port, function () {
        console.log(`Brain running on ${endpoint}`);
    });
}

function walkSync(dir, fileList) {
    const files = fs.readdirSync(dir);
    fileList = fileList || [];
    files.forEach(function (file) {
        if (fs.statSync(Path.join(dir, file)).isDirectory()) {
            fileList = walkSync(Path.join(dir, file), fileList);
        } else {
            fileList.push(Path.join(dir, file));
        }
    });
    return fileList;
}

module.exports = {
    load,
    store,
    start
};
