const fs = require('fs');
const path = require('path');

const runCommand = require('../utility/run-command');
const clenupFolder = require('./cleanup-folder');

const sandboxPath = path.join(process.cwd(), './testing/sandbox/react');
const appName = 'my-app';

exports.engine = 'react';
exports.port = 8081;
exports.distPath = path.join(sandboxPath, appName, 'build');

exports.createApp = () => {
    return new Promise((resolve, reject) => {
        clenupFolder(sandboxPath).then(() => {
            runCommand('node', [
                '../../../index.js',
                'new',
                'react-app',
                '--layout=side-nav-outer-toolbar'
            ], {
                cwd: sandboxPath,
                forceNoCmd: true
            }).then(() => {
                fs.writeFile(path.join(sandboxPath, appName, '.env'), 'SKIP_PREFLIGHT_CHECK=true', (err) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }, reject);
        }, reject);
    });
};

exports.buildApp = () => {
    return runCommand('npm', [ 'run', 'build' ], {
        cwd: path.join(sandboxPath, appName)
    });
};
