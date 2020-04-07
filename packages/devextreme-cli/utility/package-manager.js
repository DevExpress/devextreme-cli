const fs = require('fs');
const path = require('path');
const runCommand = require('./run-command');

const getPackageManager = (cwd) => {
    return isYarn(cwd) ? 'yarn' : 'npm';
};

const installPackage = (packageName, evaluatingOptions, options) => {
    const cwd = evaluatingOptions && evaluatingOptions.cwd;
    const instalationOptions = options && options[getPackageManager()];
    const commandArguments = isYarn(cwd) ? ['add'] : ['install'];

    if(instalationOptions) {
        commandArguments.concat(instalationOptions);
    }

    commandArguments.push(packageName);

    return runCommand(getPackageManager(cwd), commandArguments, evaluatingOptions);
};

const isYarn = (cwd) => {
    const lockFile = 'yarn.lock';
    return cwd ? fs.existsSync(path.join(cwd, lockFile)) : fs.existsSync(lockFile);
};

const run = (commands, evaluatingOptions) => {
    return runCommand(getPackageManager(), commands, evaluatingOptions);
};

const runInstall = (evaluatingOptions) => {
    const cwd = evaluatingOptions && evaluatingOptions.cwd;
    return runCommand(getPackageManager(cwd), ['install'], evaluatingOptions);
};

module.exports = {
    installPackage,
    isYarn,
    run,
    runInstall
};
