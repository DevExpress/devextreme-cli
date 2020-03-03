const commands = require('./commands.json').commands;
const textColor = '\x1b[36m%s\x1b[0m';

const findCommand = (commandName) => {
    return commands.filter(command => command.name === commandName);
};

const logInfo = (value) => {
    console.info(textColor, `  ${value.name}`, ` ${value.description}`);
};

const printOptions = (command) => {
    console.info('    Options:');
    command.options.forEach((option) => {
        console.info(textColor, `    ${option.name}`, ` ${option.description}`);
    });
};

const printHelp = (commandName) => {
    if(!commandName) {
        console.info('Available commands:');
        commands.forEach(logInfo);
        console.log('\nRun devextreme [command name] --help for information on a certain command.');
        return;
    }

    const command = findCommand(commandName)[0];

    if(!command) {
        console.log('Command not found');
        return;
    }

    logInfo(command);
    console.info('Usage: ', command.usage);

    if(command.options) {
        printOptions(command);
    }

    if(command.arguments) {
        console.info('Arguments:');
        command.arguments.forEach((argument) => {
            logInfo(argument);
            if(argument.options) {
                printOptions(argument);
            }
        });
    }
};

module.exports = {
    printHelp
};
