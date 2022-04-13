#!/usr/bin/env node
const args = require('minimist')(process.argv.slice(2), {
    alias: { v: 'version' }
});

const commands = args['_'];
delete args['_'];
const themeBuilder = require('./src/themebuider');
const application = require('./src/application');
const devextremeConfig = require('./src/utility/devextreme-config');
const printHelp = require('./src/help').printHelp;
const packageJson = require('./package.json');
const lock = require('./src/utility/file-lock');

lock.release();

process.on('unhandledRejection', (error) => {
    console.log(error);
    lock.release();
    process.exit(1);
});

if(!commands.length) {
    if(args.version) {
        console.log(packageJson.version);
    } else {
        console.error('DevExtreme command was not specified.');
        printHelp();
    }
    process.exit();
}

if(args.help) {
    printHelp(commands[0]);
    process.exit();
}


const run = async(commands, options) => {
    if(application.isApplicationCommand(commands[0])) {
        await application.run(commands, options, devextremeConfig.read());
    } else if(themeBuilder.isThemeBuilderCommand(commands[0])) {
        options.command = commands[0];
        themeBuilder.run(options);
    } else {
        console.error(`Command '${commands[0]}' does not exist.`);
    }
};

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
