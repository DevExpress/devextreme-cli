const jest = require('jest');
const reactEnv = require('./env.react');
const vueEnv = require('./env.vue');
const angularEnv = require('./env.angular');
const minimist = require('minimist');
const path = require('path');
const fs = require('fs');
const Emmiter = require('events');

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

let killerEvent = new Emmiter();
let done = Object.keys(envs).length;
killerEvent.on('kill', function() {
    if(--done === 0) {
        process.exit(0);
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
        detectOpenHandles: true,
        runInBand: true
    };

    await jest
        .runCLI(options, options.projects).then(
            resolve => {},
            reject => {}
        );
}

(async function testProccess() {
    if(!(args.t in envs)) {
        Object.keys(envs).forEach(async(env) => {
            if(fs.existsSync(envs[env].appPath)) {
                await runTest(envs[env]);
                killerEvent.emit('kill');
            } else {
                console.log(`!!!!!!! ${envs[env].appPath} IS NOT EXIST!!!!!!!`);
                killerEvent.emit('kill');
            }
        });
    } else {
        if(fs.existsSync(envs[args.t].appPath)) {
            await runTest(envs[args.t]);
            console.log(`END TESTING: ${envs[args.t].engine}`);
            process.exit(0);
        } else {
            console.log(`!!!!!!! ${envs[args.t].appPath} IS NOT EXIST!!!!!!!`);
        }
    }
})().then();

exports.runTest = runTest;
