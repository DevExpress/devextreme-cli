const reactEnv = require('./env.react');
const vueEnv = require('./env.vue');
const angularEnv = require('./env.angular');
const minimist = require('minimist');

const args = minimist(process.argv.slice(), {
    default: {
        env: 'all'
    },
    alias: {
        env: 'envirorment'
    }
});

const envs = [reactEnv, angularEnv, vueEnv];

(async function createApp() {
    let filteredEnvs = envs.filter(e => {
        return e.engine === args.env;
    });
    if(!filteredEnvs.length) {
        filteredEnvs = envs;
    }
    filteredEnvs.forEach(async env => {
        await env.createApp();
    });
})().catch(reject => console.error('\x1b[31m%s\x1b[0m', reject));
