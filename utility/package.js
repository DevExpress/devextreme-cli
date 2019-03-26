const fs = require('fs');
const path = require('path');

const readJSONFile = (appPath) => {
    const packageJsonPath = path.join(appPath, 'package.json');
    return JSON.parse(fs.readFileSync(packageJsonPath));
};

const writeJSONFile = (appPath, content) => {
    const packageJsonPath = path.join(appPath, 'package.json');
    fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, 2));
};

const updateValue = (appPath, key, value) => {
    let packageJson = readJSONFile(appPath);
    packageJson[key] = value;

    writeJSONFile(appPath, packageJson);
};

const addDependencies = (appPath, packages, type) => {
    let packageJson = readJSONFile(appPath);
    type = type === 'dev' ? 'devDependencies' : 'dependencies';

    if(!packageJson[type]) {
        packageJson[type] = {};
    }

    packages.forEach(item => {
        packageJson[type][item.name] = item.version;
    });

    writeJSONFile(appPath, packageJson);
};

const updateScripts = (appPath, scripts) => {
    let packageJson = readJSONFile(appPath);

    scripts.forEach((script) => {
        packageJson.scripts[script.key] = script.value;
    });

    writeJSONFile(appPath, packageJson);
};

module.exports = {
    updateValue,
    updateScripts,
    addDependencies
};
