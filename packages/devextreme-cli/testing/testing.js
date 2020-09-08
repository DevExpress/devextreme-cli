const jest = require('jest');
const path = require('path');
const fs = require('fs');
const envs = [
    require('./env.react'),
    require('./env.vue'),
    require('./env.angular')
];
const minimist = require('minimist');

const args = minimist(process.argv.slice(), {
    default: {
        envirorment: 'all'
    },
    alias: {
        env: 'envirorment'
    }
});

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

    jest.runCLI(options, options.projects).then(() => {
        decrementDone();
    });
}

(async function testProccess() {
    let filteredEnvs = envs.filter(e => e.engine === args.env);
    if(!filteredEnvs.length) {
        filteredEnvs = envs;
        done = envs.length;
    }
    filteredEnvs.forEach(async env => {
        if(fs.existsSync(env.appPath)) {
            await runTest(env);
        }
    });
})().catch(reject => console.error('\x1b[31m%s\x1b[0m', reject));

exports.runTest = runTest;
