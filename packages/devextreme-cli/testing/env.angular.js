const fs = require('fs');
const path = require('path');

const packageManager = require('../src/utility/package-manager');
const rimraf = require('./utils/rimraf-async');
const runCommand = require('../src/utility/run-command');

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/angular');
const appPath = path.join(sandboxPath, appName);
const schematicsDirectory = '../../../../devextreme-schematics';
const schematicsPath = path.join(sandboxPath, schematicsDirectory);
const routingFilePath = path.join(appPath, 'src/app/app-routing.module.ts');
const appComponentPath = path.join(appPath, 'src/app/app.component.html');

async function prepareSchematics() {
    await packageManager.runInstall({
        cwd: schematicsPath,
        silent: false
    });

    await packageManager.run([ 'run', 'build' ], {
        cwd: schematicsPath,
        silent: false
    });
}

exports.engine = 'angular';
exports.port = 4200;
exports.appPath = appPath;
exports.npmArgs = ['start', '--', '--host', '0.0.0.0'];
exports.fileExtention = 'ts';

exports.createApp = async() => {
    await rimraf(sandboxPath);
    fs.mkdirSync(sandboxPath, { recursive: true });

    await prepareSchematics();
    await runCommand('node', [
        path.join(process.cwd(), './index.js'),
        'new',
        'angular-app',
        '--layout=side-nav-outer-toolbar',
        `--c=${schematicsDirectory}`
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

    const data = fs.readFileSync(routingFilePath, 'utf8');
    const result = data.replace('RouterModule.forRoot(routes)', 'RouterModule.forRoot(routes, {useHash: true})');
    fs.writeFileSync(routingFilePath, result, 'utf8');
};

exports.setLayout = (layoutName) => {
    const regexToFind = /app-side-nav-\w+-toolbar/g;
    const newSubStr = `app-${layoutName}`;
    const data = fs.readFileSync(appComponentPath, 'utf8');
    const result = data.replace(regexToFind, newSubStr);
    fs.writeFileSync(appComponentPath, result, 'utf8');
};
