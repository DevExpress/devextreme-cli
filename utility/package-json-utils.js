const modifyJson = require('./modify-json-file');

const addDependencies = (path, packages, type) => {
    const propName = type === 'dev' ? 'devDependencies' : 'dependencies';

    modifyJson(path, content => {
        if(!content[propName]) {
            content[propName] = {};
        }

        packages.forEach(item => {
            content[propName][item.name] = item.version;
        });

        return content;
    });
};

const updateScripts = (path, scripts) => {
    modifyJson(path, content => {
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
    updateScripts
};
