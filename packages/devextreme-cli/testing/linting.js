const minimist = require('minimist');
const fs = require('fs');
const ESLint = require('eslint').ESLint;

const envs = [
    require('./env.react'),
    require('./env.vue'),
    require('./env.angular')
];

const args = minimist(process.argv.slice(), {
    default: {
        envirorment: 'all'
    },
    string: ['envirorment'],
    alias: {
        e: 'envirorment'
    }
});

async function lint(env) {
    console.log(`START LINT: ${env.engine}`);
    const eslint = new ESLint({
        useEslintrc: false,
        overrideConfigFile: `./testing/lint-config/${env.engine}.eslintrc`,
        ignore: false
    });
    const report = await eslint.lintFiles([
        `./testing/sandbox/${env.engine}/my-app/src/**/*.${env.fileExtention}`
    ]);
    let fail = false;
    report.forEach(el => {
        if(el.messages.length) {
            console.log(el.messages);
            console.log(`ERROR IN: ${el.filePath}`);
            fail = true;
        }
    });
    if(fail) {
        process.exit(1);
    }
    console.log(`END LINT: ${env.engine}`);
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
})().catch(reject => console.error(`\x1b[31m${reject}\x1b[0m`));

exports.lint = lint;
