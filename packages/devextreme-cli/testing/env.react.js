const fs = require('fs');
const { EOL } = require('os');
const path = require('path');

const rimraf = require('./utils/rimraf-async');
const runCommand = require('../utility/run-command');
const classify = require('../utility/string').classify;

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/react');
const appPath = path.join(sandboxPath, appName, 'src/AuthenticatedApp.js');

exports.engine = 'react';
exports.port = 3000;
exports.appPath = path.join(sandboxPath, appName);
exports.npmArgs = ['start'];

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
        forceNoCmd: true,
        silent: true
    });

    fs.writeFileSync(path.join(sandboxPath, appName, '.env'), 'SKIP_PREFLIGHT_CHECK=true' + EOL + 'BROWSER=none');
};

exports.setLayout = (layoutName) => {
    const regexToFind = /SideNav\w+Toolbar as SideNavBarLayout/g;
    const newSubStr = `${classify(layoutName)} as SideNavBarLayout`;
    const data = fs.readFileSync(appPath, 'utf8');
    const result = data.replace(regexToFind, newSubStr);
    fs.writeFileSync(appPath, result, 'utf8');
};
