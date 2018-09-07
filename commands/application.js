const spawn = require('child_process').spawn;

const createApplication = (commands, args) => {
    if(!commands[1]) {
        console.log('No parameters found.');
    } else {
        if(commands[1] === 'angular-app') {
            const collectionPath = args["c"] ? args["c"] : 'devextreme-schematics';
            const collectionName = collectionPath.replace(/^.*(\\|\/)/, '');
            const appName = commands[2] || 'my-app';
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
            console.log(`Application type '${commands[1]}' does not exist.` );
        }
    }
};

module.exports = {
    create: createApplication
}
