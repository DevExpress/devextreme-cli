const minimist = require('minimist');

const envs = [
    require('./env.react'),
    require('./env.vue'),
    require('./env.angular')
];

const args = minimist(process.argv.slice(2), {
    default: {
        envirorment: 'all'
    },
    string: ['envirorment'],
    alias: {
        e: 'envirorment'
    }
});

(async function createApp() {
    let filteredEnvs = envs.filter(e => e.engine === args.e);
    if(filteredEnvs.length !== 1 && filteredEnvs.length !== envs.length) {
        filteredEnvs = envs;
    }
    filteredEnvs.forEach(async env => {
        await env.createApp();
    });
})().catch(reject => console.error('\x1b[31m%s\x1b[0m', reject));
