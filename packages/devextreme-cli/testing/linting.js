const minimist = require('minimist');
const fs = require('fs');
const ESLint = require('eslint').ESLint;

const envs = [
    require('./env.angular'),
    require('./env.react'),
    require('./env.vue-v2'),
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
    const eslint = new ESLint({
        useEslintrc: false,
        overrideConfigFile: `./testing/lint-config/${env.engine}.eslintrc`,
        ignore: false
    });
    const report = await eslint.lintFiles([
        `./testing/sandbox/${env.engine}/my-app/src/**/*.${env.fileExtention}`
    ]);
    report.forEach(el => {
        if(el.errorCount) {
            process.exitCode = 1;
        }
    });
    const formatter = await eslint.loadFormatter('stylish');
    console.log(formatter.format(report));
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
