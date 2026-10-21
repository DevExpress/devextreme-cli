const minimist = require('minimist');
const envs = require('./constants').envs;

const args = minimist(process.argv.slice(), {
    default: {
        envirorment: 'all'
    },
    string: ['envirorment'],
    alias: {
        e: 'envirorment'
    }
});

async function runTest(envirorments) {
    try {
        const { startVitest } = await import('vitest/node');
        await startVitest('test', envirorments.map(env => `testing/__tests__/${env.engine}.test.js`), { run: true });
    } catch(e) {
        console.error(e);
        process.exitCode = 1;
    }
    process.exit();
}

(async function testProccess() {
    const filteredEnvs = args.e === 'all'
        ? envs
        : envs.filter(e => e.engine === args.e);
    filteredEnvs.length && runTest(filteredEnvs);
})().catch(reject => console.error(reject));

exports.runTest = runTest;
