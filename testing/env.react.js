const fs = require('fs');
const path = require('path');

const rimraf = require('./helpers/rimraf-async');
const runCommand = require('../utility/run-command');
const classify = require('../utility/string').classify;

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/react');
const appPath = path.join(sandboxPath, appName, 'src/App.js');

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

exports.setLayout = (layoutName) => {
    const regexToFind = /SideNav\w+Toolbar as SideNavBarLayout/g;
    const newSubStr = `${classify(layoutName)} as SideNavBarLayout`;
    const data = fs.readFileSync(appPath, 'utf8');
    const result = data.replace(regexToFind, newSubStr);
    fs.writeFileSync(appPath, result, 'utf8');
};
