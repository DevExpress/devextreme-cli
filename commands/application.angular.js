const path = require('path');
const fs = require('fs');
const runCommand = require('../utility/run-command');

function runSchematicCommand(schematicCommand, options, evaluatingOptions) {
    const collectionName = 'devextreme-schematics';
    const packageJsonPath = path.join(process.cwd(), `node_modules/${collectionName}/package.json`)
    let collectionPath = collectionName;

    if(!fs.existsSync(packageJsonPath)) {
        runCommand('npm', ['install', collectionName]);
    }

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

    const commandArguments = [
        '-p', collectionPath,
        '-p', '@angular/cli@latest',
        'ng', 'g', `${collectionName}:${schematicCommand}`
    ].concat(additionalOptions);

    runCommand('npx', commandArguments, evaluatingOptions);
}

const install = (options) => {
    runSchematicCommand('install', options);
};

const create = (appName, options) => {
    runCommand([
        '-p', '@angular/cli@latest', 'ng', 'new', appName, '--style=scss', '--routing=false', '--skip-install=true'
    ]).then(() => {
        options.resolveConflicts = 'override';
        addTemplate(appName, options, {
            cwd: path.join(process.cwd(), appName)
        });
    });
};

const addTemplate = (appName, options, evaluatingOptions) => {
    const schematicOptions = Object.assign({
        project: appName
    }, options);
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
