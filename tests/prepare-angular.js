const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const simpleGit = require('simple-git');

const runCommand = require('../utility/run-command');

const sandboxDirectory = './tests/sandbox';
const schematicsDirectory = 'devextreme-schematics';
const sandboxPath = path.join(process.cwd(), sandboxDirectory);
const schematicsPath = path.join(sandboxPath, schematicsDirectory);
const appName = 'my-app';

module.exports = () => {
    return new Promise((resolve, reject) => {
        if(fs.existsSync(sandboxPath)) {
            rimraf.sync(sandboxPath);
        }

        fs.mkdirSync(sandboxPath, { recursive: true });

        const git = simpleGit(sandboxPath);

        console.log('Cloning schematics repo...');
        git.clone('https://github.com/DevExpress/devextreme-schematics/', (err) => {
            if(err) {
                reject(err);
            }

            runCommand('npm', [ 'i' ], {
                cwd: schematicsPath
            }).then(() => {
                runCommand('npm', [ 'run', 'build' ], {
                    cwd: schematicsPath
                }).then(() => {
                    runCommand('node', [
                        '../../index.js',
                        'new',
                        'angular-app',
                        '--layout=side-nav-outer-toolbar',
                        `--c=${schematicsDirectory}`
                    ], {
                        cwd: sandboxPath,
                        forceNoCmd: true
                    }).then(() => {
                        runCommand('ng', [ 'build', '--baseHref', '"./"' ], {
                            cwd: path.join(process.cwd(), sandboxDirectory, appName)
                        }).then(() => {
                            runCommand('npx', [ 'http-server' ], {
                                cwd: path.join(process.cwd(), sandboxDirectory, appName, 'dist/my-app/'),
                                silent: true
                            });
                            setTimeout(() => {
                                const pagePath = 'http://127.0.0.1:8080/';
                                resolve(pagePath);
                                // runCommand('npx', [ 'jest' ]);
                            }, 0);
                        });
                    });
                });
            });
        });
    });
};
