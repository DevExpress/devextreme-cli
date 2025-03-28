const minimist = require('minimist');
const { depsVersionTagOptionName } = require('../src/utility/extract-deps-version-tag');
const envs = require('./constants').envs;

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
    const filteredEnvs = args.e === 'all'
        ? envs
        : envs.filter(e => e.engine === args.e);

    const depsVersionTag = args[depsVersionTagOptionName];
    filteredEnvs.forEach(async env => {
        try {
            await env.createApp(depsVersionTag);
        } catch(e) {
            process.exit(1);
        }
    });
})().catch(reject => console.error(reject));
