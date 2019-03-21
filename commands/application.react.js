const runCommand = require('../utility/run-command');
const moveTemplateToProject = require('../utility/move-template-to-project').moveTemplateToProject;
const addPageToProject = require('../utility/move-template-to-project').addPageToProject;
const packageJsonUtils = require('../utility/package');
const modify = require('../utility/modify-file');
const stringUtils = require('../utility/string');
const path = require('path');
const layouts = {
    'side-nav-inner-toolbar': 'SideNavInnerToolbar',
    'side-nav-outer-toolbar': 'SideNavOuterToolbar'
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
    const scripts = [
        { key: 'build-themes', value: 'devextreme build' },
        { key: 'postinstall', value: 'npm run build-themes' },
        { key: 'deploy', value: 'gh-pages -d build' }
    ];

    packageJsonUtils.addDependencies(appPath, depends);
    packageJsonUtils.addDependencies(appPath, devDepends, 'dev');
    packageJsonUtils.updateScripts(appPath, scripts);
    packageJsonUtils.updateValue(appPath, 'name', appName);
};

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

const install = (appPath) => {
    const config = path ? { cwd: appPath} : {};
    
    runCommand('npm', ['install'], config);
};

const getLayout = (layout) => {
    const layoutName = layouts[layout];
    if (!layout || !layoutName) {
        return 'SideNavOuterToolbar';
    }
    
    return layoutName;
};

const addTemplate = (appName, options) => {
    const templateSourcePath = path.join(__dirname, '..', 'templates', 'react');
    const appPath = path.join(process.cwd(), appName);

    const templateOptions = Object.assign({
        skipFolder: options.empty ? 'pages' : '',
        layout: getLayout(options.layout),

    }, options);

    moveTemplateToProject(templateSourcePath, appPath, templateOptions).then(() => {
        preparePackageJson(appPath, appName);
        install(appPath);
    });
};

const getComponentPageName = (viewName) => {
    return `${stringUtils.capitalize(viewName)}Page`;
};

const createRoute = (viewName, componentName) => {
    return `\n{\n    path: \'/${viewName}\',\n    component: ${componentName}\n  },`;
};
const createNavigation = (viewName, componentName) => {
    return `, {\n    text: \'${stringUtils.capitalize(viewName)}\',\n    path: \'/${viewName}\',\n    icon: \'home\'\n  }`;
};

const addView = (viewName, options) => {
    const componentName = getComponentPageName(viewName);
    const pathToApp = path.join(process.cwd(), 'src', 'pages');
    const pathToPageIndex = path.join(process.cwd(), 'src', 'pages', 'index.js');

    addPageToProject(viewName, pathToApp, { isReact: true, pageName: viewName });

    modify.insertExport(pathToPageIndex, componentName, `./${viewName}/${viewName}`, true);
    modify.addPageToRouting('src\\app-routes.js', createRoute(viewName, componentName));
    modify.addNavigation('src\\app-navigation.js', createNavigation(viewName, componentName));
    modify.insertImport('src\\app-routes.js', componentName, './pages');
};

module.exports = {
    install,
    create,
    addTemplate,
    addView
};
