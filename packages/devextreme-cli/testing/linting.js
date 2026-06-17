const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const ESLint = require('eslint').ESLint;
const { FlatCompat } = require('@eslint/eslintrc');
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
    const compat = new FlatCompat({
        baseDirectory: path.resolve(__dirname, '..'),
        resolvePluginsRelativeTo: path.resolve(__dirname, '..'),
    });
    const legacyConfig = JSON.parse(
        fs.readFileSync(path.join(__dirname, `lint-config/${env.engine}.eslintrc`), 'utf8')
    );
    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: compat.config(legacyConfig),
    });

    const lintFiles = isTypeScript(env.engine)
        ? [`./testing/sandbox/${env.engine}/my-app/src/**/*.ts`,
            `./testing/sandbox/${env.engine}/my-app/src/**/*.tsx`]
        : [`./testing/sandbox/${env.engine}/my-app/src/**/*.${env.fileExtension}`];

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
    if(env.engine.startsWith('angular')) {
        await customLint(env);
    } else {
        await projectLint(env.engine);
    }
}

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
