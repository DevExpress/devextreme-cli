const fs = require('fs');
const path = require('path');

const rimraf = require('./utils/rimraf-async');
const runCommand = require('../utility/run-command');
const packageJsonUtils = require('../utility/package-json-utils');

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/angular');
const schematicsDirectory = '../../../../devextreme-schematics';
const schematicsPath = path.join(sandboxPath, schematicsDirectory);
const routingFilePath = path.join(sandboxPath, appName, 'src/app/app-routing.module.ts');
const appComponentPath = path.join(sandboxPath, appName, 'src/app/app.component.html');

async function prepareSchematics() {
    await runCommand('npm', [ 'i' ], {
        cwd: schematicsPath,
        silent: true
    });

    await runCommand('npm', [ 'run', 'build' ], {
        cwd: schematicsPath,
        silent: true
    });
}

exports.engine = 'angular';
exports.port = 4200;
exports.appPath = path.join(sandboxPath, appName);
exports.npmArgs = ['start', '--', '--host', '0.0.0.0'];

exports.createApp = async() => {
    await rimraf(sandboxPath);
    fs.mkdirSync(sandboxPath, { recursive: true });

    await prepareSchematics();
    await runCommand('node', [
        '../../../index.js',
        'new',
        'angular-app',
        '--layout=side-nav-outer-toolbar',
        `--c=${schematicsDirectory}`
    ], {
        cwd: sandboxPath,
        forceNoCmd: true,
        silent: true
    });

    const scripts = [
        { name: 'prestart', value: 'ngcc --properties es2015 --async false' }
    ];
    // https://github.com/angular/angular/issues/36278
    packageJsonUtils.updateScripts(path.join(sandboxPath, appName), scripts);

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
