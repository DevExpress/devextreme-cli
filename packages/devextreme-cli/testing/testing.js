const jest = require('jest');
const reactEnv = require('./env.react');
const vueEnv = require('./env.vue');
const angularEnv = require('./env.angular');
const minimist = require('minimist');
const path = require('path');
const fs = require('fs');

const args = minimist(process.argv.slice(), {
    default: {
        envirorment: 'all'
    },
    alias: {
        env: 'envirorment'
    }
});

const envs = [
    reactEnv,
    angularEnv,
    vueEnv
];

let done = 1;

function decrementDone() {
    if(--done === 0) {
        process.exit(0);
    }
}

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
        detectOpenHandles: true,
        runInBand: true
    };

    await jest.runCLI(options, options.projects);
}

(async function testProccess() {
    let filteredEnvs = envs.filter(e => {
        return e.engine === args.env;
    });
    if(!filteredEnvs.length) {
        filteredEnvs = envs;
        done = envs.length;
    }
    filteredEnvs.forEach(async env => {
        if(fs.existsSync(env.appPath)) {
            await runTest(env);
            decrementDone();
        }
    });
})().catch(reject => console.error('\x1b[31m%s\x1b[0m', reject));

exports.runTest = runTest;
