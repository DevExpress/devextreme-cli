const jest = require('jest');
const path = require('path');
const fs = require('fs');
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

async function runTest(env) {
    const options = {
        testPathIgnorePatterns: [
            './testing/sandbox/'
        ],
        projects: [
            './testing/__tests__'
        ],
        testPathPattern: [
            `./testing/__tests__/${env.engine}.test.js`
        ],
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
    return jest.runCLI(options, options.projects);
}

(async function testProccess() {
    let filteredEnvs = envs.filter(e => e.engine === args.env);
    if(!filteredEnvs.length) {
        filteredEnvs = envs;
    }
    filteredEnvs.reduce(async(promise, env, index) => {
        if(fs.existsSync(env.appPath)) {
            await promise;
            await runTest(env);
            if(index === filteredEnvs.length - 1) {
                process.exit(0);
            }
        }
    }, Promise.resolve());
})().catch(reject => console.error('\x1b[31m%s\x1b[0m', reject));

exports.runTest = runTest;
