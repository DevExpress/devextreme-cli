const fs = require('fs');
const path = require('path');
const runCommand = require('./run-command');
const yarnLockfile = require('@yarnpkg/lockfile');

const getLockFileName = (cwd) => {
    return isYarn(cwd) ? 'yarn.lock' : 'package-lock.json';
};

const getPackageManager = (cwd) => {
    return isYarn(cwd) ? 'yarn' : 'npm';
};

const getLockFile = (cwd) => {
    const lockFilePath = path.join(cwd, getLockFileName(cwd));
    if(!fs.existsSync(lockFilePath)) {
        return;
    }

    return isYarn(cwd) ? getYarnLock(lockFilePath) : getPackageLock(lockFilePath);
};

const getPackageLock = (packageLockPath) => {
    return require(packageLockPath);
};

const getYarnLock = (yarnLockPath) => {
    return yarnLockfile.parse(fs.readFileSync(yarnLockPath, 'utf8'));
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
    getLockFile,
    installPackage,
    isYarn,
    run,
    runInstall
};
