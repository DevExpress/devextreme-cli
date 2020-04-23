const fs = require('fs');
const path = require('path');

const rimraf = require('./utils/rimraf-async');
const runCommand = require('../src/utility/run-command');

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/vue');
const routerFilePath = path.join(sandboxPath, appName, 'src/router.js');

exports.engine = 'vue';
exports.port = 8080;
exports.appPath = path.join(sandboxPath, appName);
exports.npmArgs = ['run', 'serve'];

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
        forceNoCmd: true,
        silent: true
    });

    await rimraf(path.join(sandboxPath, appName, 'vue.config.js'));
};

exports.setLayout = (layoutName) => {
    const regexToFind = /import defaultLayout from "\.\/layouts\/side-nav-\w+-toolbar/g;
    const newSubStr = `import defaultLayout from "./layouts/${layoutName}`;
    const data = fs.readFileSync(routerFilePath, 'utf8');
    const result = data.replace(regexToFind, newSubStr);
    fs.writeFileSync(routerFilePath, result, 'utf8');
};
