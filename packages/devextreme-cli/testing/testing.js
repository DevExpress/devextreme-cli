const jest = require('jest');
const path = require('path');
const minimist = require('minimist');
const envs = [
    require('./env.react'),
    require('./env.vue'),
    require('./env.angular')
];

const args = minimist(process.argv.slice(), {
    default: {
        envirorment: 'all'
    },
    alias: {
        env: 'envirorment'
    }
});

async function runTest(envirorments) {
    const options = {
        testPathIgnorePatterns: [
            './testing/sandbox/'
        ],
        projects: [
            './testing/__tests__'
        ],
        testPathPattern: envirorments.map(env => `./testing/__tests__/${env.engine}.test.js`),
        setupFiles: [
            path.join(process.cwd(), 'jest.config.js')
        ],
        setupFilesAfterEnv: [
            path.join(process.cwd(), 'testing/jest-setup.js')
        ],
        silent: false,
        forceExit: true,
        showConfig: false,
        runInBand: true
    };
    await jest.runCLI(options, options.projects).then(()=>{
        process.exit(0);
    });
}

(async function testProccess() {
    let filteredEnvs = envs.filter(e => e.engine === args.env);
    if(!filteredEnvs.length) {
        filteredEnvs = envs;
    }
    runTest(filteredEnvs);
})().catch(reject => console.error('\x1b[31m%s\x1b[0m', reject));

exports.runTest = runTest;
