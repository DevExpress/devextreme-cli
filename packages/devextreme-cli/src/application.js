const angularApplication = require('./applications/application.angular');
const reactApplication = require('./applications/application.react');
const vueApplication = require('./applications/application.vue');
const printHelp = require('./help').printHelp;

const isApplicationCommand = (command) => {
    return [ 'new', 'add' ].indexOf(command) > -1;
};

const run = (commands, options, devextremeConfig) => {
    if(!commands[1]) {
        console.error('Command is incomplete. Please specify parameters.');
        printHelp(commands[0]);
        return;
    }

    if(commands[0] === 'new') {
        if(commands[1] === 'angular-app') {
            angularApplication.create(commands[2] || 'my-app', options);
            return;
        }

        if(commands[1] === 'react-app') {
            reactApplication.create(commands[2] || 'my-app', options);
            return;
        }

        if(commands[1] === 'vue-app') {
            vueApplication.create(commands[2] || 'my-app', options);
            return;
        }

        console.error(`The '${commands[1]}' application type is not valid`);
        printHelp(commands[0]);
    } else {
        if(commands[0] === 'add') {
            if(commands[1] === 'devextreme-angular') {
                angularApplication.install(options);
                return;
            }

            if(commands[1] === 'devextreme-react') {
                reactApplication.install(options);
                return;
            }

            if(commands[1] === 'devextreme-vue') {
                vueApplication.install(options);
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
                    console.error('Invalid command');
                    printHelp(commands[0]);
                }
            } else if(devextremeConfig.applicationEngine === 'react') {
                if(commands[1] === 'view') {
                    reactApplication.addView(commands[2], options);
                } else {
                    console.error('Invalid command');
                    printHelp(commands[0]);
                }
            } else if(devextremeConfig.applicationEngine === 'vue') {
                if(commands[1] === 'view') {
                    vueApplication.addView(commands[2], options);
                } else {
                    console.error('Invalid command');
                    printHelp(commands[0]);
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
