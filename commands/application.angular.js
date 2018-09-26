const path = require('path');
const runNpxCommand = require('../utility/run-npx-command');

function runSchematicCommand(schematicCommand, options, evaluatingOptions) {
    const collectionName = 'devextreme-schematics';
    let collectionPath = collectionName;

    if(options["c"]) {
        collectionPath = `"${path.join(process.cwd(), options["c"])}"`;
        delete options["c"];
    }

    const additionalOptions = [];
    for(let option in options) {
        additionalOptions.push(` --${option}="${options[option]}"`);
    };

    const commandArguments = [
        '-p', '@angular-devkit/schematics-cli@latest',
        '-p', '@schematics/angular@latest',
        '-p', collectionPath,
        '-c', `"schematics ${collectionName}:${schematicCommand}${additionalOptions.join('')} --dry-run=false"`
    ];

    runNpxCommand(commandArguments, evaluatingOptions);
}

const create = (appName, options) => {
    runNpxCommand([
        '-p', '@angular/cli@latest', 'ng', 'new', appName, '--style=scss'
    ]).then(() => {
        addTemplate(appName, options, {
            cwd: path.join(process.cwd(), appName)
        });
    });
};

const addTemplate = (appName, options, evaluatingOptions) => {
    runSchematicCommand(`add-app-template --project=${appName} --overwriteAppComponent`, options, evaluatingOptions);
};

const addView = (viewName, options) => {
    runSchematicCommand(`add-view --name="${viewName}"`, options);
};

module.exports = {
    create,
    addTemplate,
    addView
};
