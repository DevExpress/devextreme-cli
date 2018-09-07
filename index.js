#!/usr/bin/env node

const args = require("minimist")(process.argv.slice(2));
const commands = args["_"];
const themeBuilder = require("./commands/themebuider");
const application = require("./commands/application");

if(!commands.length) {
    console.log('No command found.');
    process.exit();
}

if(commands[0] === 'new') {
    application.create(commands, args);
} else if(themeBuilder.isThemeBuilderCommand(commands[0])) {
    args.command = commands[0];
    themeBuilder.run(args);
} else {
    console.log(`Command '${commands[0]}' does not exist.` );
}

