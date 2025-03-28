const fs = require('fs');
const path = require('path');

const rimraf = require('./utils/rimraf-async');
const runCommand = require('../src/utility/run-command');
const { toolingVersionOptionName } = require('../src/utility/extract-tooling-version');

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/vue-v3');
const appPath = path.join(sandboxPath, appName);
const routerFilePath = path.join(sandboxPath, appName, 'src/router.js');

exports.engine = 'vue-v3';
exports.appPath = path.join(sandboxPath, appName);
exports.deployPath = path.join(appPath, 'dist');
exports.npmArgs = ['run', 'build'];
exports.fileExtension = 'js';

exports.createApp = async(toolingVersion) => {
    await rimraf(sandboxPath);
    fs.mkdirSync(sandboxPath, { recursive: true });

    const additionalArguments = toolingVersion && [`--${toolingVersionOptionName} ${toolingVersion}`] || [];
    await runCommand('node', [
        path.join(process.cwd(), './index.js'),
        'new',
        'vue-app',
        '--layout=side-nav-outer-toolbar',
        ...additionalArguments
    ], {
        cwd: sandboxPath,
        forceNoCmd: true
    });

    await runCommand('node', [
        path.join(process.cwd(), './index.js'),
        'add',
        'view',
        'new-page'
    ], {
        cwd: appPath,
        forceNoCmd: true
    });

    await rimraf(path.join(appPath, 'vue.config.js'));
};

exports.setLayout = (layoutName) => {
    const regexToFind = /import defaultLayout from "\.\/layouts\/side-nav-\w+-toolbar/g;
    const newSubStr = `import defaultLayout from "./layouts/${layoutName}`;
    const data = fs.readFileSync(routerFilePath, 'utf8');
    const result = data.replace(regexToFind, newSubStr);
    fs.writeFileSync(routerFilePath, result, 'utf8');
};
