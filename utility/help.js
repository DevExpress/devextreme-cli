const commands = require('./help-command.json').commands;

const textColor = ['\x1b[36m', '\x1b[0m'];

const findCommand = (commandName) => {
    return commands.filter((command) => {
        return command.name === commandName;
    });
};

const logInfo = (value) => {
    console.info(`${textColor[0]}%s${textColor[1]}`, `  ${value.name}`, ` ${value.descripttion}`);
};

const printOptions = (command) => {
    console.info('    Options:');
    command.options.forEach((option) => {
        console.info(`${textColor[0]}%s${textColor[1]}`, `    ${option.name}`, ` ${option.descripttion}`);
    });
};

const printHelp = (commandName) => {
    if(!commandName) {
        console.info('Available commands:');
        commands.forEach((command) => {
            logInfo(command);
        });
        console.log('\nFor more detailed help run "devextreme [command name] --help"');
    }

    if(commandName) {
        const command = findCommand(commandName)[0];

        if(!command) {
            console.log('Command not found');
            return;
        }

        logInfo(command);
        console.info('Usage: ', command.usage);

        if(command.arguments) {
            console.info('Arguments:');
            command.arguments.forEach((argument) => {
                logInfo(argument);
            });
        }

        if(command.options) {
            printOptions(command);
        }

        if(command.parameters) {
            console.info('Parameters:');
            command.parameters.forEach((parameter) => {
                logInfo(parameter);
                if(parameter.options) {
                    printOptions(parameter);
                }
            });
        }
    }
};

module.exports = {
    printHelp
};
