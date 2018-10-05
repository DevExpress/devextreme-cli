const angularApplication = require('./application.angular');

const isApplicationCommand = (command) => {
    return [ 'new', 'add' ].indexOf(command) > -1;
};

const run = (commands, options, devextremeConfig) => {
    if(!commands[1]) {
        console.log('No parameters found.');
        return;
    }

    if(commands[0] === 'new') {
        if(commands[1] === 'angular-app') {
            angularApplication.create(commands[2] || 'my-app', options);
        } else {
            console.log(`The '${commands[1]}' application type is not valid`);
        }
    } else {
        if(commands[0] === 'add') {
            if(commands[1] === 'devextreme-angular') {
                angularApplication.install(options);
                return;
            }

            if(commands[1] === 'angular-template') {
                angularApplication.addTemplate(commands[2], options);
                return;
            }

            if(devextremeConfig.applicationEngine === 'angular') {
                if(commands[1] === 'view') {
                    angularApplication.addView(commands[2], options);
                } else {
                    console.log('Invalid command');
                }
            } else {
                console.log('The DevExtreme application cannot be found');
            }
        }
    }
};

module.exports = {
    isApplicationCommand,
    run
};
