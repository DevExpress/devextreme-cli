const modifyJson = require('./modify-json-file');
const path = require('path');
const latestVersions = require('./latest-versions');
let packageJsonPath = '';

const getPackageJsonPath = (appPath) => {
    if(!packageJsonPath) {
        packageJsonPath = path.join(appPath, 'package.json');
    }

    return packageJsonPath;
};

const addDependencies = (appPath, packages, type) => {
    const propName = type === 'dev' ? 'devDependencies' : 'dependencies';

    modifyJson(getPackageJsonPath(appPath), content => {
        if(!content[propName]) {
            content[propName] = {};
        }

        packages.forEach(item => {
            content[propName][item.name] = item.version;
        });

        return content;
    });
};

const addDevextreme = (appPath, dxversion, engine) => {
    const dxWrapperPackage = `devextreme-${engine}`;
    const depends = [
        { name: 'devextreme', version: dxversion || latestVersions['devextreme'] },
        { name: dxWrapperPackage, version: dxversion || latestVersions[dxWrapperPackage] }
    ];

    addDependencies(getPackageJsonPath(appPath), depends);
};

const updateName = (appPath, name) => {
    modifyJson(getPackageJsonPath(appPath), content => {
        content.name = name;

        return content;
    });
};

const updateScripts = (appPath, scripts) => {
    modifyJson(getPackageJsonPath(appPath), content => {
        let packageJsonScripts = content.scripts;
        scripts.forEach((script) => {
            const name = script.name;
            const value = script.value;
            const currentValue = packageJsonScripts[name];

            if(!currentValue) {
                packageJsonScripts[name] = value;
                return content;
            }

            const alterName = `origin-${name}`;
            const safeValue = `npm run ${alterName} && ${value}`;

            if(currentValue === value || currentValue === safeValue) {
                return;
            }

            packageJsonScripts[alterName] = currentValue;
            packageJsonScripts[name] = safeValue;
        });

        return content;
    });
};

module.exports = {
    addDependencies,
    getPackageJsonPath,
    updateScripts,
    updateName,
    addDevextreme
};
