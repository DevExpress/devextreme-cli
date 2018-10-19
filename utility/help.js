const commands = [{
        name: 'new',
        descripttion: 'Create a new DevExtreme application',
        usage: 'devexterme new <application> <name> [options]',
        parameters: [{
            name: 'angular-app',
            descripttion: '',
            options: [{
                name: '--layout',
                descripttion: 'Specifies the type of a DevExtreme layout to add (default: side-nav-outer-toolbar)'
            }, {
                name: '--empty',
                descripttion: 'Specifies whether to skip sample views generation (default: false)'
            }]
        }],
        arguments: [{
            name: 'name',
            descripttion: 'Application name'
        }],
    }, {
        name: 'add',
        descripttion: 'Add the DevExtreme layout template or view to an Angular application or DevExtreme to an Angular application',
        usage: 'devexterme add <parameter> [options]',
        parameters: [{
            name: 'angular-template',
            descripttion: 'Add the DevExtreme layout template to an Angular application',
            options: [{
                name: '--layout',
                descripttion: 'Specifies the type of a DevExtreme layout to add (default: side-nav-outer-toolbar)'
            }, {
                name: '--empty',
                descripttion: 'Specifies whether to skip sample views generation (default: false)'
            }, {
                name: '--resolve-conflicts',
                descripttion: 'Specifies whether to override the existing app component or create a component with another name. (default: safe)'
            }]
        }, {
            name: 'view',
            descripttion: 'Add a view to an Angular application with the DevExtreme layout template',
            options: [{
                name: '--icon',
                descripttion: 'Specifies the view\'s icon name (default: folder)'
            }]
        }, {
            name: 'devextreme-angular',
            descripttion: 'Add DevExtreme to an Angular application'
        }],
    }, {
        name: 'build-theme',
        descripttion: 'Build a custom color scheme',
        usage: 'devexterme build-theme [options]',
        options: [{
            name: '--base-theme',
            descripttion: 'Specifies a base theme’s name (the default value is generic.light)'
        }, {
            name: '--input-file',
            descripttion: 'Specifies the name of the file that contains input data (a .json file with metadata or a .less/.scss file with Bootstrap variables)'
        }, {
            name: '--make-swatch',
            descripttion: 'If present, adds a CSS scope to each CSS rule (.dx-swatch-xxx), where xxx is the value from the --output-color-scheme parameter'
        }, {
            name: '--output-file',
            descripttion: 'Specifies the output file name'
        }, {
            name: '--output-color-scheme',
            descripttion: 'Specifies the custom color scheme name (the default value is custom-scheme)'
        }]
    }, {
        name: 'export-theme-vars',
        descripttion: 'Export theme variables as a less/scss file',
        usage: 'devexterme export-theme-vars [options]',
        options: [{
            name: '--base-theme',
            descripttion: 'Specifies a base theme’s name (the default value is generic.light)'
        }, {
            name: '--input-file',
            descripttion: 'Specifies the name of the file that contains input data (a .json file with metadata or a .less/.scss file with Bootstrap variables)'
        }, {
            name: '--output-format',
            descripttion: 'Specifies the format of the output variables (less or scss) (the default value is less or the extension extracted from the --output-file value (if it contains any))'
        }, {
            name: '--output-file',
            descripttion: 'Specifies the output file name'
        }, {
            name: '--base',
            descripttion: 'Exports only base variables which are used to produce the derived variables'
        }]
    }, {
        name: 'export-theme-meta',
        descripttion: 'Export theme variables as a json metadata file',
        usage: 'devexterme export-theme-meta [options]',
        options: [{
            name: '--base-theme',
            descripttion: 'Specifies a base theme’s name (the default value is generic.light)'
        }, {
            name: '--input-file',
            descripttion: 'Specifies the name of the file that contains input data (a .json file with metadata or a .less/.scss file with Bootstrap variables)'
        }, {
            name: '--output-file',
            descripttion: 'Specifies the output file name'
        }, {
            name: '--base',
            descripttion: 'Exports only base variables which are used to produce the derived variables'
        }]
}];

const textColor = ['\x1b[36m', '\x1b[0m'];

const findCommand = (commandName) => {
    return commands.filter((command) => {
        return command.name === commandName;
    });
};

const logInfo = (value) => {
    console.info(`${textColor[0]}%s${textColor[1]}`, `  ${value.name}`, ` ${value.descripttion}`);
}

const printOptions = (command) => {
    console.info('    Options:');
    command.options.forEach((option) => {
        console.info(`${textColor[0]}%s${textColor[1]}`, `    ${option.name}`, ` ${option.descripttion}`);
    });
}

const printHelp = (commandName) => {
    if (!commandName) {
        console.info('Available commands:');
        commands.forEach((command) => {
            logInfo(command);
        });
        console.log('\nFor more detailed help run "devextreme [command name] --help"');
    }

    if (commandName) {
        const command = findCommand(commandName)[0];

        if(!command) {
            console.log('Command not found');
            return;
        }

        logInfo(command);
        console.info('Usage: ', command.usage);

        if (command.arguments) {
            console.info('Arguments:');
            command.arguments.forEach((argument) => {
                logInfo(argument);
            });
        }

        if (command.options) {
            printOptions(command);
        }

        if(command.parameters) {
            console.info('Parameters:');
            command.parameters.forEach((parameter) => {
                logInfo(parameter);
                if (parameter.options) {
                    printOptions(parameter);
                }
            });
        }
    }
};

module.exports = {
    printHelp
};