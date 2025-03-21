const minimist = require('minimist');
const { toolingVersionOptionName } = require('../src/utility/extract-tooling-version');
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

    const toolingVersion = args[toolingVersionOptionName];
    filteredEnvs.forEach(async env => {
        try {
            await env.createApp(toolingVersion);
        } catch(e) {
            process.exit(1);
        }
    });
})().catch(reject => console.error(reject));
