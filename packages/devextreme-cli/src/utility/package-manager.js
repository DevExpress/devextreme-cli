const fs = require('fs');
const path = require('path');
const runCommand = require('./run-command');
const yarnLockfile = require('@yarnpkg/lockfile');
const defaultPackageManager = 'npm';
let currentPackageManager;

const packageManagers = {
    npm: {
        installCommand: 'install',
        lockFileName: 'package-lock.json',
        getLockFile: (cwd) => require(path.join(cwd, 'package-lock.json')),
        getDependencies: (obj) => obj.dependencies
    },
    yarn: {
        installCommand: 'add',
        lockFileName: 'yarn.lock',
        getLockFile: (cwd) => yarnLockfile.parse(fs.readFileSync(path.join(cwd, 'yarn.lock'), 'utf8')),
        getDependencies: (obj) => obj.object
    }
};

const getPackageManager = (cwd) => {
    if(!currentPackageManager) {
        currentPackageManager = Object.keys(packageManagers).find((packageManager) => {
            const lockFileName = packageManagers[packageManager].lockFileName;
            const lockPath = path.join(cwd, lockFileName);
            return fs.existsSync(lockPath);
        });
    }

    return currentPackageManager || defaultPackageManager;
};

const getDependencies = (evaluatingOptions = {}) => {
    const cwd = evaluatingOptions.cwd;
    const packageManager = packageManagers[getPackageManager(cwd)];
    if(!fs.existsSync(path.join(cwd, packageManager.lockFileName))) {
        return;
    }

    const lockFile = packageManager.getLockFile(cwd);
    return packageManager.getDependencies(lockFile);
};

const installPackage = (packageName, evaluatingOptions = {}, options = {}) => {
    const packageManager = getPackageManager(evaluatingOptions.cwd);
    const instalationOptions = options[packageManager];
    const commandArguments = [packageManagers[packageManager].installCommand];

    if(instalationOptions) {
        commandArguments.push(...instalationOptions);
    }

    commandArguments.push(packageName);

    return runCommand(packageManager, commandArguments, evaluatingOptions);
};

const run = (commands, evaluatingOptions = {}) => runCommand(getPackageManager(evaluatingOptions.cwd), commands, evaluatingOptions);

const runInstall = (evaluatingOptions = {}) => run(['install'], evaluatingOptions);

module.exports = {
    getDependencies,
    installPackage,
    run,
    runInstall
};
