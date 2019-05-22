const fs = require('fs');
const path = require('path');

const rimraf = require('./rimraf-async');
const runCommand = require('../utility/run-command');

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/react');

exports.engine = 'react';
exports.port = 8082;
exports.distPath = path.join(sandboxPath, appName, 'build');

exports.createApp = async() => {
    await rimraf(sandboxPath);
    fs.mkdirSync(sandboxPath, { recursive: true });

    await runCommand('node', [
        '../../../index.js',
        'new',
        'react-app',
        '--layout=side-nav-outer-toolbar'
    ], {
        cwd: sandboxPath,
        forceNoCmd: true
    });

    fs.writeFileSync(path.join(sandboxPath, appName, '.env'), 'SKIP_PREFLIGHT_CHECK=true');
};

exports.buildApp = async() => {
    await runCommand('npm', [ 'run', 'build' ], {
        cwd: path.join(sandboxPath, appName)
    });
};
