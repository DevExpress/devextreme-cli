#!/usr/bin/env node

const spawn = require('child_process').spawn;
const args = process.argv.slice(2);

if(!args.length) {
    console.log('No command found.');
    process.exit();
}

const run = arguments => {
    const executable = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';
    spawn(executable, arguments, {
        stdio: 'inherit',
        windowsVerbatimArguments: true
    });
};

const command = args[0];

if(command === 'new') {
    if(!args[1]) {
        console.log('No parameters found.');
    } else {
        if(args[1] === 'angular-app') {
            const collectionIndex = args.indexOf('-c') + 1;
            const collectionPath = collectionIndex ? args[collectionIndex] : 'devextreme-schematics';
            const collectionName = collectionPath.replace(/^.*(\\|\/)/, '');
            const appName = args[2] || 'my-app';
            
            const commandArguments = [
                '-p', '@angular-devkit/schematics-cli',
                '-p', '@schematics/angular',
                '-p', collectionPath,
                '-c', `"schematics ${collectionName}:new-angular-app --name=${appName} --dry-run=false"`
            ];

            run(commandArguments);
        } else {
            console.log(`Application type '${args[1]}' does not exist.` );
        }
    }
} else if(command === 'build-theme' || command === 'build-theme-vars') {
    args.unshift('devextreme-themebuilder');
    run(args);
} else {
    console.log(`Command '${command}' does not exist.` );
}

