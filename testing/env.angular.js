const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

const runCommand = require('../utility/run-command');
const clenupFolder = require('./cleanup-folder');

const sandboxPath = path.join(process.cwd(), './testing/sandbox/angular');
const schematicsDirectory = 'devextreme-schematics';
const schematicsPath = path.join(sandboxPath, schematicsDirectory);
const appName = 'my-app';

function prepareSchematics() {
    return new Promise((resolve, reject) => {
        const git = simpleGit(sandboxPath);

        console.log('Cloning schematics repo...');
        git.clone('https://github.com/DevExpress/devextreme-schematics/', (err) => {
            if(err) {
                reject(err);
                return;
            }

            runCommand('npm', [ 'i' ], {
                cwd: schematicsPath
            }).then(() => {
                runCommand('npm', [ 'run', 'build' ], {
                    cwd: schematicsPath
                }).then(() => {
                    resolve();
                }, reject);
            }, reject);
        });
    });
}

exports.engine = 'angular';
exports.port = 8080;
exports.distPath = path.join(sandboxPath, appName, 'dist', appName);

exports.createApp = () => {
    return new Promise((resolve, reject) => {
        clenupFolder(sandboxPath).then(() => {
            prepareSchematics().then(() => {
                runCommand('node', [
                    '../../../index.js',
                    'new',
                    'angular-app',
                    '--layout=side-nav-outer-toolbar',
                    `--c=${schematicsDirectory}`
                ], {
                    cwd: sandboxPath,
                    forceNoCmd: true
                }).then(() => {
                    const routingFilePath = path.join(sandboxPath, appName, 'src/app/app-routing.module.ts');
                    fs.readFile(routingFilePath, 'utf8', (err, data) => {
                        if(err) {
                            reject(err);
                            return;
                        }

                        const result = data.replace('RouterModule.forRoot(routes)', 'RouterModule.forRoot(routes, {useHash: true})');

                        fs.writeFile(routingFilePath, result, 'utf8', (err) => {
                            if(err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                }, reject);
            }, reject);
        }, reject);
    });
};

exports.buildApp = () => {
    return runCommand('ng', [ 'build', '--baseHref', '"./"' ], {
        cwd: path.join(sandboxPath, appName)
    });
};
