const fs = require('fs');
const path = require('path');
const runCommand = require('./run-command');
const yarnLockfile = require('@yarnpkg/lockfile');
const defaultPackageManager = 'npm';
let packageManager = '';

const packageManagerConfig = {
    npm: {
        installCommand: 'install',
        lockFileName: 'package-lock.json',
        getLockFile: getPackageLock,
        getDependencies: (obj) => obj.dependencies
    },
    yarn: {
        installCommand: 'add',
        lockFileName: 'yarn.lock',
        getLockFile: getYarnLock,
        getDependencies: (obj) => obj.object
    }
};

const getPackageManager = (cwd) => {
    if(!packageManager) {
        for(let prop in packageManagerConfig) {
            const lockFileName = packageManagerConfig[prop].lockFileName;
            const lockPath = path.join(cwd, lockFileName);
            if(fs.existsSync(lockPath)) {
                packageManager = prop;
                break;
            }
        }
    }

    return packageManager || defaultPackageManager;
};

const getDependencies = (cwd) => {
    const packageManager = packageManagerConfig[getPackageManager(cwd)];
    const lockFile = packageManager.getLockFile(cwd);

    return packageManager.getDependencies(lockFile);
};

function getPackageLock(cwd) {
    return require(path.join(cwd, 'package-lock.json'));
};

function getYarnLock(cwd) {
    return yarnLockfile.parse(fs.readFileSync(path.join(cwd, 'yarn.lock'), 'utf8'));
};

const installPackage = (packageName, evaluatingOptions, options) => {
    const cwd = evaluatingOptions && evaluatingOptions.cwd;
    const packageManager = getPackageManager(cwd);
    const instalationOptions = options && options[packageManager];
    const commandArguments = [packageManagerConfig[packageManager].installCommand];

    if(instalationOptions) {
        commandArguments.concat(instalationOptions);
    }

    commandArguments.push(packageName);

    return runCommand(packageManager, commandArguments, evaluatingOptions);
};

const run = (commands, evaluatingOptions) => {
    const cwd = evaluatingOptions && evaluatingOptions.cwd;
    return runCommand(getPackageManager(cwd), commands, evaluatingOptions);
};

const runInstall = (evaluatingOptions) => {
    const cwd = evaluatingOptions && evaluatingOptions.cwd;
    return runCommand(getPackageManager(cwd), ['install'], evaluatingOptions);
};

module.exports = {
    getDependencies,
    installPackage,
    run,
    runInstall
};
