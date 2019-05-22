const fs = require('fs');
const path = require('path');

const rimraf = require('./helpers/rimraf-async');
const runCommand = require('../utility/run-command');

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/vue');

exports.engine = 'vue';
exports.port = 8083;
exports.distPath = path.join(sandboxPath, appName, 'dist');

exports.createApp = async() => {
    await rimraf(sandboxPath);
    fs.mkdirSync(sandboxPath, { recursive: true });

    await runCommand('node', [
        '../../../index.js',
        'new',
        'vue-app',
        '--layout=side-nav-outer-toolbar'
    ], {
        cwd: sandboxPath,
        forceNoCmd: true
    });

    await rimraf(path.join(sandboxPath, appName, 'vue.config.js'));
};

exports.buildApp = async() => {
    await runCommand('npm', [ 'run', 'build' ], {
        cwd: path.join(sandboxPath, appName)
    });
};
