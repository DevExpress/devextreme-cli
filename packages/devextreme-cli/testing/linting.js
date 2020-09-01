const reactEnv = require('./env.react');
const vueEnv = require('./env.vue');
const angularEnv = require('./env.angular');
const minimist = require('minimist');
const fs = require('fs');
const ESLint = require('eslint').ESLint;

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

async function lint(env) {
    console.log('START LINT: ' + env.engine);
    let eslint = new ESLint({
        useEslintrc: false,
        overrideConfigFile: `./testing/lint-config/${env.engine}.eslintrc`,
        ignore: false
    });
    let report = await eslint.lintFiles([
        `./testing/sandbox/${env.engine}/my-app/src/**/*.${env.engine === 'angular' ? 'ts' : 'js'}`
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
    if(!(args.t in envs)) {
        Object.keys(envs).forEach(async env => {
            if(fs.existsSync(envs[env].appPath)) {
                await lint(envs[env]);
            } else {
                console.log(`!!!!!!! ${envs[env].appPath} IS NOT EXIST!!!!!!!`);
            }
        });
    } else {
        if(fs.existsSync(envs[args.t].appPath)) {
            await lint(envs[args.t]);
        } else {
            console.log(`!!!!!!! ${envs[args.t].appPath} IS NOT EXIST!!!!!!!`);
        }
    }
})();

exports.lint = lint;
