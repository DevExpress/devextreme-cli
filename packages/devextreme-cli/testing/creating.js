const reactEnv = require('./env.react');
const vueEnv = require('./env.vue');
const angularEnv = require('./env.angular');
const minimist = require('minimist');

const args = minimist(process.argv.slice(), {
    default: {
        template: 'all'
    },
    alias: {
        t: 'template'
    }
});

const envs = {
    'react': reactEnv,
    'angular': angularEnv,
    'vue': vueEnv
};

(async function createApp() {
    if(!(args.t in envs)) {
        console.log(args.t);
        Object.keys(envs).forEach(async env => {
            await envs[env].createApp();
        });
    } else {
        console.log(args.t);
        envs[args.t].createApp();
    }
})();
