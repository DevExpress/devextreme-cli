const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

const rimraf = require('./helpers/rimraf-async');
const runCommand = require('../utility/run-command');

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/angular');
const schematicsDirectory = 'devextreme-schematics';
const schematicsPath = path.join(sandboxPath, schematicsDirectory);
const routingFilePath = path.join(sandboxPath, appName, 'src/app/app-routing.module.ts');

async function prepareSchematics() {
    // TODO: Move devextreme-schematics to this repo
    const git = simpleGit(sandboxPath);

    console.log('Cloning schematics repo...');
    await new Promise((resolve, reject) => {
        git.clone('https://github.com/DevExpress/devextreme-schematics/', (err) => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    await runCommand('npm', [ 'i' ], {
        cwd: schematicsPath
    });

    await runCommand('npm', [ 'run', 'build' ], {
        cwd: schematicsPath
    });
}

exports.engine = 'angular';
exports.port = 8081;
exports.distPath = path.join(sandboxPath, appName, 'dist', appName);

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
        forceNoCmd: true
    });

    const data = fs.readFileSync(routingFilePath, 'utf8');
    const result = data.replace('RouterModule.forRoot(routes)', 'RouterModule.forRoot(routes, {useHash: true})');
    fs.writeFileSync(routingFilePath, result, 'utf8');
};

exports.buildApp = async() => {
    await runCommand('ng', [ 'build', '--baseHref', '"./"' ], {
        cwd: path.join(sandboxPath, appName)
    });
};
