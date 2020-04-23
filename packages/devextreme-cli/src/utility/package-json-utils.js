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

const addDependencies = (appPath, dependencies) => {
    modifyJson(getPackageJsonPath(appPath), packageConfig => {
        dependencies.forEach(dependency => {
            const sectionName = dependency.dev ? 'devDependencies' : 'dependencies';
            const section = packageConfig[sectionName] = packageConfig[sectionName] || {};
            section[dependency.name] = dependency.version;
        });

        return packageConfig;
    });
};

const addDevextreme = (appPath, dxversion, engine) => {
    const dxWrapperPackage = `devextreme-${engine}`;
    const dependencies = [
        {
            name: 'devextreme',
            version: dxversion || latestVersions['devextreme']
        },
        {
            name: 'devextreme-themebuilder',
            version: dxversion || latestVersions['devextreme'],
            dev: true
        },
        {
            name: dxWrapperPackage,
            version: dxversion || latestVersions[dxWrapperPackage]
        }
    ];

    addDependencies(getPackageJsonPath(appPath), dependencies);
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
