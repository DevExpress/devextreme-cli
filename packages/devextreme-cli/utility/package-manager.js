const configUtils = require('./config-utils');
const runCommand = require('./run-command');

const setPackageManager = (value) => {
    packageManager = value;
};

const getPackageManager = () => {
    return configUtils.getValue('defaultPackageManager');
};

const setDefaultPackageManager = (value) => {
    configUtils.setValue('defaultPackageManager', value);
};

const isYarn = () => {
    return getPackageManager() === 'yarn';
};

const installPackage = (package, evaluatingOptions) => {
    const command = isYarn() ? ['add'] : ['install'];
    return runCommand(getPackageManager(), command.concat(package), evaluatingOptions);
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
    setPackageManager,
    getPackageManager,
    isYarn,
    installPackage,
    installDependencies,
    run
}
