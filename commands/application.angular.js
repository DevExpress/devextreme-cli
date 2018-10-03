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
        // NOTE: Removing boolean values is a workaround for the @angular/cli issue [angular/angular-cli#12150](https://github.com/angular/angular-cli/issues/12150)
        additionalOptions.push(` --${option}${options[option] === true ? '' : `="${options[option]}"`}`);
    };

    const commandArguments = [
        '-p', '@angular-devkit/schematics-cli@latest',
        '-p', collectionPath,
        '-c', `"schematics ${collectionName}:${schematicCommand}${additionalOptions.join('')} --dry-run=false"`
    ];

    return runNpxCommand(commandArguments, evaluatingOptions);
}

const install = (options) => {
    runSchematicCommand(`install`, options);
};

const create = (appName, options) => {
    runNpxCommand([
        '-p', '@angular/cli@latest', 'ng', 'new', appName, '--style=scss --skip-install=true'
    ]).then(() => {
        addTemplate(appName, options, {
            cwd: path.join(process.cwd(), appName)
        });
    });
};

const addTemplate = (appName, options, evaluatingOptions) => {
    runSchematicCommand(`add-app-template --project=${appName} --overrideAppComponent`, options, evaluatingOptions).then(() => {
        runNpxCommand(['devextreme build'], {
            cwd: path.join(process.cwd(), appName)
        });
    });
};

const addView = (viewName, options) => {
    runSchematicCommand(`add-view --name="${viewName}"`, options);
};

module.exports = {
    install,
    create,
    addTemplate,
    addView
};
