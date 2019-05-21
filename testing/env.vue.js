const path = require('path');
const rimraf = require('rimraf');

const runCommand = require('../utility/run-command');
const clenupFolder = require('./cleanup-folder');

const sandboxPath = path.join(process.cwd(), './testing/sandbox/vue');
const appName = 'my-app';

exports.engine = 'vue';
exports.port = 8082;
exports.distPath = path.join(sandboxPath, appName, 'dist');

exports.createApp = () => {
    return new Promise((resolve, reject) => {
        clenupFolder(sandboxPath).then(() => {
            runCommand('node', [
                '../../../index.js',
                'new',
                'vue-app',
                '--layout=side-nav-outer-toolbar'
            ], {
                cwd: sandboxPath,
                forceNoCmd: true
            }).then(() => {
                // TODO: make async
                rimraf.sync(path.join(sandboxPath, appName, 'vue.config.js'));
                resolve();
            }, reject);
        }, reject);
    });
};

exports.buildApp = () => {
    return runCommand('npm', [ 'run', 'build' ], {
        cwd: path.join(sandboxPath, appName)
    });
};
