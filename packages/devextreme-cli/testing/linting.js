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
    alias: {
        env: 'envirorment'
    }
});

async function lint(env) {
    console.log(`START LINT: ${env.engine}`);
    let eslint = new ESLint({
        useEslintrc: false,
        overrideConfigFile: `./testing/lint-config/${env.engine}.eslintrc`,
        ignore: false
    });
    let report = await eslint.lintFiles([
        `./testing/sandbox/${env.engine}/my-app/src/**/*.${env.fileExtention}`
    ]);
    report.forEach(el=>{
        if(el.messages.length) {
            console.log(`ERROR IN: ${el.filePath}`);
            console.log(el.messages);
        }
    });
    console.log(`END LINT: ${env.engine}`);
};

(async function lintProcess() {
    let filteredEnvs = envs.filter(e => e.engine === args.env);
    if(!filteredEnvs.length) {
        filteredEnvs = envs;
    }
    filteredEnvs.forEach(async env => {
        if(fs.existsSync(env.appPath)) {
            await lint(env);
        }
    });
})().catch(reject => console.error('\x1b[31m%s\x1b[0m', reject));

exports.lint = lint;
