const themeBuilder = require('./themebuider');
const application = require('./application');
const devextremeConfig = require('../utility/devextreme-config');

const run = (commands, options) => {
    if(application.isApplicationCommand(commands[0])) {
        application.run(commands, options, devextremeConfig.read());
    } else if(themeBuilder.isThemeBuilderCommand(commands[0])) {
        options.command = commands[0];
        themeBuilder.run(options);
    } else {
        console.error(`Command '${commands[0]}' does not exist.`);
    }
};

module.exports = (commands, args) => {
    if(commands[0] === 'build') {
        const config = devextremeConfig.read();
        if(config.build && config.build.commands) {
            console.log('The DevExtreme build started');
            config.build.commands.forEach(commandConfig => {
                run([commandConfig.command], commandConfig.options);
            });
        }
    } else {
        run(commands, args);
    }
};
