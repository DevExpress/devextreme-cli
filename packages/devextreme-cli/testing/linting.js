const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const ESLint = require('eslint').ESLint;
const envs = require('./constants').envs;
const run = require('./../src/utility/run-command');

const args = minimist(process.argv.slice(), {
    default: {
        envirorment: 'all'
    },
    string: ['envirorment'],
    alias: {
        e: 'envirorment'
    }
});

const isTypeScript = (engine) => engine.includes('-ts');

const projectLint = async(app) => {
    await run('npm run lint', undefined, {
        cwd: path.join(__dirname, 'sandbox', app, 'my-app'),
        forceNoCmd: true
    });
};

const customLint = async(env) => {
    const eslint = new ESLint({
        useEslintrc: false,
        overrideConfigFile: `./testing/lint-config/${env.engine}.eslintrc`,
        ignore: false
    });

    const lintFiles = isTypeScript(env.engine)
        ? [`./testing/sandbox/${env.engine}/my-app/src/**/*.ts`,
            `./testing/sandbox/${env.engine}/my-app/src/**/*.tsx`]
        : [`./testing/sandbox/${env.engine}/my-app/src/**/*.${env.fileExtention}`];

    const report = await eslint.lintFiles(lintFiles);

    report.forEach(el => {
        if(el.errorCount) {
            process.exitCode = 1;
        }
    });
    const formatter = await eslint.loadFormatter('stylish');
    console.log(formatter.format(report));
};

async function lint(env) {

    if(env.engine.startsWith('vue') || env.engine.startsWith('react')) {
        await projectLint(env.engine);
    } else {
        await customLint(env);
    }
};

(async function lintProcess() {
    const filteredEnvs = args.e === 'all'
        ? envs
        : envs.filter(e => e.engine === args.e);
    filteredEnvs.forEach(async env => {
        if(fs.existsSync(env.appPath)) {
            await lint(env);
        }
    });
})().catch(reject => console.error(reject));

exports.lint = lint;
