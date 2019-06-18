const path = require('path');
const runCommand = require('../utility/run-command');
const semver = require('semver').SemVer;
const fs = require('fs');
const exec = require('child_process').exec;
const minNgCliVersion = new semver('8.0.0');

function runSchematicCommand(schematicCommand, options, evaluatingOptions) {
    const collectionName = 'devextreme-schematics';
    let collectionPath = collectionName;

    if(options['c']) {
        collectionPath = `"${path.join(process.cwd(), options['c'])}"`;
        delete options['c'];
    }

    const additionalOptions = [];
    for(let option in options) {
        const schematicOption = `--${option}=${options[option]}`;
        additionalOptions.push(schematicOption);
    };


    let commandArguments = [
        'ng', 'g', `${collectionName}:${schematicCommand}`
    ].concat(additionalOptions);

    optimizeNgCommandArguments(commandArguments).then((optimizedArguments) => {
        if(!localPackageExists(collectionPath)) {
            runCommand('npm', ['install', collectionPath], evaluatingOptions).then(() => {
                runCommand('npx', optimizedArguments, evaluatingOptions);
            });
        } else {
            runCommand('npx', optimizedArguments, evaluatingOptions);
        }
    });
}

function localPackageExists(packageName) {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if(!fs.existsSync(nodeModulesPath)) {
        return;
    }

    const packageJsonPath = path.join(nodeModulesPath, packageName, 'package.json');
    return fs.existsSync(packageJsonPath);
}

function optimizeNgCommandArguments(args) {
    return new Promise((resolve, reject) => {
        hasSutableNgCli().then(() => resolve(args), () => resolve(['-p', '@angular/cli', ...args]));
    });
}

function hasSutableNgCli() {
    return new Promise((resolve, reject) => {
        exec('ng v', (err, stdout, stderr) => {
            stderr || parseNgCliVersion(stdout).compare(minNgCliVersion) < 0
                ? reject()
                : resolve();
        });
    });
}

function parseNgCliVersion(stdout) {
    return new semver(/angular.cli:\s*(\S+)/ig.exec(stdout.toString())[1]);
}

const install = (options) => {
    runSchematicCommand('install', options);
};

const create = (appName, options) => {
    let commandArguments = ['ng', 'new', appName, '--style=scss', '--routing=false', '--skip-install=true', '--skip-tests=true'];
    optimizeNgCommandArguments(commandArguments).then((optimizedArguments) => {
        runCommand('npx', optimizedArguments).then(() => {
            options.resolveConflicts = 'override';
            options.updateBudgets = true;
            addTemplate(appName, options, {
                cwd: path.join(process.cwd(), appName)
            });
        });
    });
};

const addTemplate = (appName, options, evaluatingOptions) => {
    const schematicOptions = { ...(appName && { project: appName }), ...options };
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
