const path = require('path');
const packageManager = require('../utility/package-manager');
const runCommand = require('../utility/run-command');
const semver = require('semver').SemVer;
const fs = require('fs');
const exec = require('child_process').exec;
const minNgCliVersion = new semver('8.0.0');

function runSchematicCommand(schematicCommand, options, evaluatingOptions) {
    const collectionName = 'devextreme-schematics';
    let collectionPath = collectionName;
    options.packageManager = packageManager.getPackageManager();

    if(options['c']) {
        collectionPath = `${path.join(process.cwd(), options['c'])}`;
        delete options['c'];
    }

    const additionalOptions = [];
    for(let option in options) {
        const schematicOption = `--${option}=${options[option]}`;
        additionalOptions.push(schematicOption);
    };

    let commandArguments = [
        'g', `${collectionName}:${schematicCommand}`
    ].concat(additionalOptions);

    hasSutableNgCli().then(() => {
        if(!localPackageExists(collectionPath)) {
            packageManager.installPackage(collectionPath, evaluatingOptions).then(() => {
                runAngularCliCommand(commandArguments, evaluatingOptions);
            });
        } else {
            runAngularCliCommand(commandArguments, evaluatingOptions);
        }
    },
    () => {
        executeLatestAngularCli(commandArguments, evaluatingOptions);
    });
}

function runAngularCliCommand(commandArguments, evaluatingOptions) {
    return runCommand('ng', commandArguments, evaluatingOptions);
}

function localPackageExists(packageName) {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if(!fs.existsSync(nodeModulesPath)) {
        return;
    }

    const packageJsonPath = path.join(nodeModulesPath, packageName, 'package.json');
    return fs.existsSync(packageJsonPath);
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

function executeLatestAngularCli(commandArguments, evaluatingOptions) {
    if(packageManager.isYarn()) {
        console.error('Angular CLI is not found on your computer.');
        process.exit();
    }
    return packageManager.executeCommand(['-p', '@angular/cli', 'ng'].concat(commandArguments), evaluatingOptions);
}

const install = (options) => {
    runSchematicCommand('install', options);
};

const create = (appName, options) => {
    const commandArguments = ['new', appName, '--style=scss', '--routing=false', '--skip-install=true', '--skip-tests=true'];
    const evaluatingOptions = { cwd: path.join(process.cwd(), appName) };
    options.resolveConflicts = 'override';
    options.updateBudgets = true;

    hasSutableNgCli().then(() => {
        runAngularCliCommand(commandArguments).then(() => {
            addTemplate(appName, options, evaluatingOptions);
        });
    },
    () => {
        executeLatestAngularCli(commandArguments, evaluatingOptions).then(() => addTemplate(appName, options, evaluatingOptions));
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
