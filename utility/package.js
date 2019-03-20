const fs = require('fs-extra');
const path = require('path');

const updateValue = (appPath, key, value) => {
    const packageJsonPath = path.join(appPath, 'package.json');
    let packageJson = fs.readJSONSync(packageJsonPath);
    packageJson[key] = value;

    fs.writeJSONSync(packageJsonPath, packageJson, { spaces: 2 });
};

const addDependencies = (appPath, packages, type) => {
    const packageJsonPath = path.join(appPath, 'package.json');
    type = type === 'dev' ? 'devDependencies' : 'dependencies';
    let packageJson = fs.readJSONSync(packageJsonPath);

    if (!packageJson[type]) {
        packageJson[type] = {};
    }

    packages.forEach(package => {
        packageJson[type][package.name] = package.version;
    });

    fs.writeJSONSync(packageJsonPath, packageJson, { spaces: 2 });
};

const updateScripts = (appPath, key, value) => {
    const packageJsonPath = path.join(appPath, 'package.json');
    let packageJson = fs.readJSONSync(packageJsonPath);

    packageJson.scripts[key] = value;
    fs.writeJSONSync(packageJsonPath, packageJson, { spaces: 2 });
};

module.exports = {
    updateValue,
    updateScripts,
    addDependencies
};