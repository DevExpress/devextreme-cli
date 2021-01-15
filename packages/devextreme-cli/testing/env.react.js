const fs = require('fs');
const { EOL } = require('os');
const path = require('path');

const rimraf = require('./utils/rimraf-async');
const runCommand = require('../src/utility/run-command');
const classify = require('../src/utility/string').classify;

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/react');
const appPath = path.join(sandboxPath, appName);
const appLayoutPath = path.join(sandboxPath, appName, 'src/Content.js');

exports.engine = 'react';
exports.port = 3000;
exports.appPath = appPath;
exports.npmArgs = ['start'];
exports.fileExtention = 'js';

exports.createApp = async() => {
    await rimraf(sandboxPath);
    fs.mkdirSync(sandboxPath, { recursive: true });

    await runCommand('node', [
        path.join(process.cwd(), './index.js'),
        'new',
        'react-app',
        '--layout=side-nav-outer-toolbar'
    ], {
        cwd: sandboxPath,
        forceNoCmd: true,
        silent: false
    });

    await runCommand('node', [
        path.join(process.cwd(), './index.js'),
        'add',
        'view',
        'new-page'
    ], {
        cwd: appPath,
        forceNoCmd: true,
        silent: false
    });

    fs.writeFileSync(path.join(appPath, '.env'), 'SKIP_PREFLIGHT_CHECK=true' + EOL + 'BROWSER=none');
};

exports.setLayout = (layoutName) => {
    const regexToFind = /SideNav\w+Toolbar as SideNavBarLayout/g;
    const newSubStr = `${classify(layoutName)} as SideNavBarLayout`;
    const data = fs.readFileSync(appLayoutPath, 'utf8');
    const result = data.replace(regexToFind, newSubStr);
    fs.writeFileSync(appLayoutPath, result, 'utf8');
};
