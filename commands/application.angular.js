const path = require('path');
const runCommand = require('../utility/run-command');
const semver = require('semver').SemVer;
const fs = require('fs');
const exec = require('child_process').exec;
const minVersion = new semver('6.0.0');

function runSchematicCommand(schematicCommand, options, evaluatingOptions) {
    const collectionName = 'devextreme-schematics';
    let collectionPath = collectionName;

    if(options['c']) {
        collectionPath = `"${path.join(process.cwd(), options['c'])}"`;
        delete options['c'];
    }

    const additionalOptions = [];
    for(let option in options) {
        // NOTE: Removing boolean values is a workaround for the @angular/cli issue [angular/angular-cli#12150](https://github.com/angular/angular-cli/issues/12150)
        const schematicOption = `--${option}${options[option] === true ? '' : `=${options[option]}`}`;
        additionalOptions.push(schematicOption);
    };


    let commandArguments = [
        'ng', 'g', `${collectionName}:${schematicCommand}`
    ].concat(additionalOptions);

    getAdditionalCommandArguments().then((additionalArguments) => {
        if(additionalArguments) {
            commandArguments = additionalArguments.concat(commandArguments);
        }

        if(!checkLocalPackage(collectionName)) {
            runCommand('npm', ['install', collectionName]).then(() => {
                runCommand('npx', commandArguments, evaluatingOptions);
            });
        } else {
            runCommand('npx', commandArguments, evaluatingOptions);
        }
    });
}

function checkLocalPackage(packageName) {
    if(!fs.existsSync('node_modules')) {
        return;
    }

    const packageJsonPath = path.join(process.cwd(), `node_modules/${packageName}/package.json`);

    return fs.existsSync(packageJsonPath);
}

function getAdditionalCommandArguments() {
    return new Promise((resolve, reject) => {
        exec('ng v', (err, stdout, stderr) => {
            const commandArguments = ['-p', '@angular/cli'];
            if(stderr) {
                resolve(commandArguments);
            }
            if(stdout) {
                const commandResult = stdout.toString();
                const version = new semver(commandResult.match(/(?<=angular.cli:.)([0-9]+.[0-9]+.[0-9]+(-(beta|rc|alpha).[0-9]+)*)/ig)[0]);

                if(version.compare(minVersion) < 0) {
                    resolve(commandArguments);
                }
            }
            resolve();
        });
    });
}

const install = (options) => {
    runSchematicCommand('install', options);
};

const create = (appName, options) => {
    let commandArguments = ['ng', 'new', appName, '--style=scss', '--routing=false', '--skip-install=true'];
    getAdditionalCommandArguments().then((additionalArguments) => {
        if(additionalArguments) {
            commandArguments = additionalArguments.concat(commandArguments);
        }
        runCommand('npx', commandArguments).then(() => {
            options.resolveConflicts = 'override';
            addTemplate(appName, options, {
                cwd: path.join(process.cwd(), appName)
            });
        });
    });
};

const addTemplate = (appName, options, evaluatingOptions) => {
    const schematicOptions = {...(appName && {project: appName}), ...options};
    runSchematicCommand('add-app-template', schematicOptions, evaluatingOptions);
};

const addView = (viewName, options) => {
    const schematicOptions = Object.assign({
        name: viewName
    }, options);
    schematicOptions.name = viewName;
    runSchematicCommand('add-view', schematicOptions);
};

module.exports = {
    install,
    create,
    addTemplate,
    addView
};
