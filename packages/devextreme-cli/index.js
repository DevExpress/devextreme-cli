#!/usr/bin/env node
const args = require('minimist')(process.argv.slice(2), {
    alias: { v: 'version' }
});
const commands = args['_'];
delete args['_'];

const printHelp = require('./commands/help').printHelp;
const packageManager = require('./utility/package-manager');
const packageJson = require('./package.json');
const run = require('./commands/run');
const runPrompts = require('./utility/prompts');
const lock = require('./utility/file-lock');

lock.release();

process.on('unhandledRejection', (error) => {
    console.log(error);
    lock.release();
    process.exit(1);
});

if(!commands.length) {
    if(args.version) {
        console.log(packageJson.version);
    } else if(args.packageManager) {
        packageManager.setDefaultPackageManager(args.packageManager);
    } else {
        console.error('The DevExtreme command is not specified.');
        printHelp();
    }
    process.exit();
}

if(args.help) {
    printHelp(commands[0]);
    process.exit();
}

if(packageManager.getPackageManager()) {
    run(commands, args);
} else {
    const prompts = [
        {
            type: 'select',
            name: 'packageManager',
            message: 'What package manager do you prefer?',
            choices: [
                { title: 'npm', value: 'npm' },
                { title: 'yarn', value: 'yarn' }
            ]
        }
    ];

    runPrompts(prompts, args.packageManager).then(promptValue => {
        packageManager.setDefaultPackageManager(promptValue.packageManager);
        run(commands, args);
    });
}
