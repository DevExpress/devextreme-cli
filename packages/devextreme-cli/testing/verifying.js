const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const envs = require('./constants').envs;

const installScriptNames = [
    'preinstall', 'install', 'postinstall', 'prepare', 'prepublish'
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

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const verifyNoInstallScripts = (env) => {
    const scripts = readJson(path.join(env.appPath, 'package.json')).scripts || {};
    const found = installScriptNames.filter(name => name in scripts);

    return found.map(name => `${env.engine}: package.json has the '${name}' script: '${scripts[name]}'`);
};

const verifyThemesAreBuilt = (env) => {
    const config = readJson(path.join(env.appPath, 'devextreme.json'));
    const commands = config.build && config.build.commands || [];
    const missing = commands
        .map(commandConfig => commandConfig.options.outputFile)
        .filter(outputFile => !fs.existsSync(path.join(env.appPath, outputFile)));

    return missing.map(outputFile => `${env.engine}: '${outputFile}' was not generated on the application creation`);
};

const verify = (env) => [
    ...verifyNoInstallScripts(env),
    ...verifyThemesAreBuilt(env)
];

(function verifyProcess() {
    const filteredEnvs = args.e === 'all'
        ? envs
        : envs.filter(e => e.engine === args.e);

    const problems = filteredEnvs
        .filter(env => fs.existsSync(env.appPath))
        .reduce((result, env) => [...result, ...verify(env)], []);

    problems.forEach(problem => console.error(problem));

    if(problems.length) {
        process.exit(1);
    }

    console.log('The generated applications need no install scripts.');
})();
