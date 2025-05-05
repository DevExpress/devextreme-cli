const angularApplication = require('./applications/application.angular');
const reactApplication = require('./applications/application.react');
const nextjsApplication = require('./applications/application.nextjs');
const vueApplication = require('./applications/application.vue');
const getReactAppType = require('./utility/prompts/app-type');
const printHelp = require('./help').printHelp;

const isApplicationCommand = (command) => {
    return [ 'new', 'add' ].includes(command);
};

const run = async(commands, options, devextremeConfig) => {
    if(!commands[1]) {
        console.error('Command is incomplete. Please specify parameters.');
        printHelp(commands[0]);
        return;
    }

    if(commands[0] === 'new') {
        const app = commands[1];
        const appName = commands[2] || 'my-app';

        const handleWrongAppType = (input) => {
            console.error(`The '${input}' application type is not valid`);
            printHelp(commands[0]);
        };

        switch(app) {
            case 'angular-app':
                await angularApplication.create(appName, options);
                return;
            case 'react-app':
                const appType = await getReactAppType(options['app-type']);

                switch(appType) {
                    case 'vite':
                        await reactApplication.create(appName, options);
                        return;
                    case 'nextjs':
                        await nextjsApplication.create(appName, options);
                        return;
                    default:
                        handleWrongAppType(appType);
                }

                return;
            case 'vue-app':
                await vueApplication.create(appName, options);
                return;
            default:
                handleWrongAppType(app);
        }

    } else {
        if(commands[0] === 'add') {
            if(commands[1] === 'devextreme-angular') {
                await angularApplication.install(options);
                return;
            }

            if(commands[1] === 'devextreme-react') {
                if(nextjsApplication.isNextJsApp()) {
                    nextjsApplication.install(options);
                } else {
                    reactApplication.install(options);
                }

                return;
            }

            if(commands[1] === 'devextreme-vue') {
                vueApplication.install(options);
                return;
            }

            if(commands[1] === 'angular-template') {
                await angularApplication.addTemplate(commands[2], options);
                return;
            }

            const app = {
                'angular': angularApplication,
                'react': reactApplication,
                'nextjs': nextjsApplication,
                'vue': vueApplication,
            }[devextremeConfig.applicationEngine];

            if(app) {
                if(commands[1] === 'view') {
                    app.addView(commands[2], options);
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
