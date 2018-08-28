#!/usr/bin/env node

const spawn = require('child_process').spawn;
const args = process.argv.slice(2);

if(!args.length) {
    console.log('No command found.');
} else {
    if(args[0] === 'new') {
        if(!args[1]) {
            console.log('No parameters found.');
        } else {
            if(args[1] === 'angular-app') {
                const collectionIndex = args.indexOf('-c') + 1;
                const collectionPath = collectionIndex ? args[collectionIndex] : 'devextreme-schematics';
                const collectionName = collectionPath.replace(/^.*(\\|\/)/, '');
                const appName = args[2] || 'my-app';
                const command = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';
                const commandArguments = [
                    '-p', '@angular-devkit/schematics-cli',
                    '-p', '@schematics/angular',
                    '-p', collectionPath,
                    '-c', `"schematics ${collectionName}:new-angular-app --name=${appName} --dry-run=false"`
                ];

                spawn(command, commandArguments, {
                    stdio: 'inherit',
                    windowsVerbatimArguments: true
                });
            } else {
                console.log(`Application type '${args[1]}' does not exist.` );
            }
        }
    } else {
        console.log(`Command '${args[0]}' does not exist.` );
    }
}
