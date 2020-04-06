const configUtils = require('./config-utils');
const runCommand = require('./run-command');

const getPackageManager = () => {
    return configUtils.getValue('defaultPackageManager');
};

const setDefaultPackageManager = (value) => {
    configUtils.setValue('defaultPackageManager', value);
};

const isYarn = () => {
    return getPackageManager() === 'yarn';
};

const installPackage = (packageName, evaluatingOptions, installOptions) => {
    const commandArguments = isYarn() ? ['add'] : ['install'];

    if(installOptions && installOptions.noSave && !isYarn()) {
        commandArguments.push('--no-save');
    }
    commandArguments.push(packageName);

    return runCommand(getPackageManager(), commandArguments, evaluatingOptions);
};

const installDependencies = (evaluatingOptions) => {
    return runCommand(getPackageManager(), ['install'], evaluatingOptions);
};

const run = (commandArguments, evaluatingOptions) => {
    const command = isYarn() ? 'yarn' : 'npx';

    return runCommand(command, commandArguments, evaluatingOptions);
};

module.exports = {
    setDefaultPackageManager,
    getPackageManager,
    isYarn,
    installPackage,
    installDependencies,
    run
};
