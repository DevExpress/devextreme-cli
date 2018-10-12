const path = require('path');
const runNpxCommand = require('../utility/run-npx-command');

function runSchematicCommand(schematicCommand, options, evaluatingOptions) {
    const collectionName = 'devextreme-schematics';
    let collectionPath = collectionName;

    if(options['c']) {
        collectionPath = `"${path.join(process.cwd(), options['c'])}"`;
        delete options['c'];
    }

    const additionalOptions = [];
    for(let option in options) {
        additionalOptions.push(`--${option}${options[option] === true ? '' : `="${options[option]}"`}`);
    };

    const commandArguments = [
        '-p', '@angular-devkit/schematics-cli@latest',
        '-p', collectionPath,
        'schematics', `${collectionName}:${schematicCommand}`, '--dry-run=false'
    ].concat(additionalOptions);

    runNpxCommand(commandArguments, evaluatingOptions);
}

const install = (options) => {
    runSchematicCommand('install', options);
};

const create = (appName, options) => {
    runNpxCommand([
        '-p', '@angular/cli@latest', 'ng', 'new', appName, '--style=scss', '--skip-install=true'
    ]).then(() => {
        addTemplate(appName, options, {
            cwd: path.join(process.cwd(), appName)
        });
    });
};

const addTemplate = (appName, options, evaluatingOptions) => {
    const schematicOptions = Object.assign({
        project: appName,
        overrideAppComponent: true
    }, options);
    runSchematicCommand('add-app-template', schematicOptions, evaluatingOptions);
};

const addView = (viewName, options) => {
    const schematicOptions = Object.assign({
        name: viewName
    }, options);
    schematicOptions.name = viewName;
    runSchematicCommand('add-view', schematicsOptions);
};

module.exports = {
    install,
    create,
    addTemplate,
    addView
};
