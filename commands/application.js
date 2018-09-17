const angularApplication = require('./application.angular');

// TODO: get by devextreme.json
const appEngine = 'angular';

isApplicationCommand = (command) => {
    return [ 'new', 'add' ].indexOf(command) > -1;
};

run = (commands, options) => {
    if(!commands[1]) {
        console.log('No parameters found.');
        return;
    }

    if(commands[0] === 'new') {
        if(commands[1] === 'angular-app') {
            angularApplication.create(commands[2] || 'my-app', options);
        } else {
            console.log(`Application type '${commands[1]}' does not exist.` );
        }
    } else {
        if(commands[0] === 'add') {
            if(appEngine === 'angular') {
                if(commands[1] === 'devextreme') {
                    angularApplication.addDevextreme(commands[2], options);
                } else if(commands[1] === 'view') {
                    angularApplication.addView(commands[2], options);
                } else {
                    console.log('Command is not correct');
                }
            } else {
                console.log('DevExtreme application was not found');
            }
        }
    }
};

module.exports = {
    isApplicationCommand,
    run
}
