const runCommand = require('../utility/run-command');
const moveTemplate = require('../utility/move-template-files').moveTemplate;
const packageJsonUtils = require('../utility/package');
const basename = require('path').basename;
const path = require('path');
const fs = require('fs-extra');
const layouts = {
    "side-nav-inner-toolbar": "SideNavInnerToolbar",
    "side-nav-outer-toolbar": "SideNavOuterToolbar"
};

const getAppPath = (appName) => {
    if (appName) {
        return path.join(process.cwd(), appName);
    }

    if (!isProjectFolder()) {
        console.error('Use the command inside the react project');
        process.exit(1);
    }

    return process.cwd();
};

const isProjectFolder = () => {
    return fs.existsSync(path.join(process.cwd(), 'package.json'));
}

const normalizeOptions = (options) => {
    let normalizedOptions = {};
    for(let option in options) {
        const optionName = option.replace(/(-)+/g, (match, separator, chr) => {	
            return chr ? chr.toUpperCase() : '';	
        });
        normalizedOptions[optionName] = options[option];
    }

    return normalizedOptions;
};

const create = (appName, options) => {
    let commandArguments = ['create-react-app', appName],
        normalizedOptions = normalizeOptions(options);

    runCommand('npx', commandArguments).then(() => {
        const templateOptions = Object.assign({
            project: appName,
            resolveConflicts: 'override'
        }, normalizedOptions);

        addTemplate(appName, templateOptions);
    });
};

const preparePackageJson = (appPath, appName) => {
    const depends = [
        { name: 'devextreme', version: '18.2'},
        { name: 'devextreme-react', version: '18.2'},
        { name: 'node-sass', version: '^4.11.0'},
        { name: 'react-router-dom', version: '^4.3.1'}
    ];

    const devDepends = [
        { name: 'devextreme-cli', version: '1.0.3'},
        { name: 'gh-pages', version: '^2.0.1'}
    ];

    packageJsonUtils.addDependencies(appPath, depends);
    packageJsonUtils.addDependencies(appPath, devDepends, 'dev');
    packageJsonUtils.updateScripts(appPath, 'postinstall', 'npm run build-themes');
    packageJsonUtils.updateScripts(appPath, 'build-themes', 'devextreme build');
    packageJsonUtils.updateScripts(appPath, 'deploy', 'gh-pages -d build');
    packageJsonUtils.updateValue(appPath, 'name', appName);
};

const install = (appPath) => {
    const config = path ? { cwd: appPath} : {};
    
    runCommand('npm', ['install'], config);
};

const modifyContent = (templateContent, currentContent, filePath) => {
    if (basename(filePath) === 'index.css') {
        return `${currentContent}\n${templateContent}`;
    }

    return templateContent;
};

const addTemplate = (appName, templateOptions) => {
    const ownPath = path.dirname(require.resolve(path.join(__dirname, '..', 'templates', 'react', 'devextreme.json')));
    const defaultLayout = 'SideNavOuterToolbar';
    let normalizedOptions = normalizeOptions(templateOptions);
    const appPath = getAppPath(appName);

    normalizedOptions.layout = layouts[normalizedOptions.layout] || defaultLayout;
    normalizedOptions.resolveConflicts = normalizedOptions.resolveConflicts || 'createNew';
    normalizedOptions.resolveConflictOptions= 'src\\App.js';

    moveTemplate(ownPath, appPath, normalizedOptions, modifyContent).then(() => {
        preparePackageJson(appPath, appName);
        install(appPath);
    });
};

// const addView = (viewName, options) => {
//     const schematicOptions = Object.assign({
//         name: viewName
//     }, options);
//     schematicOptions.name = viewName;
//     runSchematicCommand('add-view', schematicOptions);
// };

module.exports = {
    install,
    create,
    addTemplate,
    // addView
};
