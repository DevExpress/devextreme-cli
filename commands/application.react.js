const runCommand = require('../utility/run-command');
const path = require('path');
const fs = require('fs');
const runPrompts = require('../utility/prompts');
const moveTemplateFilesToProject = require('../utility/move-template-to-project').moveTemplateFilesToProject;
const addPageToProject = require('../utility/move-template-to-project').addPageToProject;
const packageJsonUtils = require('../utility/package');
const routingUtils = require('../utility/routing');
const moduleUtils = require('../utility/module');
const stringUtils = require('../utility/string');
const pathToPagesIndex = path.join(process.cwd(), 'src', 'pages', 'index.js');
const layouts = [
    { fullName: 'side-nav-outer-toolbar', title: 'Side navigation (outer toolbar)', value: 'SideNavOuterToolbar' },
    { fullName: 'side-nav-inner-toolbar', title: 'Side navigation (inner toolbar)', value: 'SideNavInnerToolbar' }
];

const addDevextremeToPackageJson = (appPath) => {
    const depends = [
        { name: 'devextreme', version: '18.2' },
        { name: 'devextreme-react', version: '18.2' }
    ];

    packageJsonUtils.addDependencies(appPath, depends);
};

const preparePackageJsonForTemplate = (appPath, appName) => {
    const depends = [
        { name: 'node-sass', version: '^4.11.0' },
        { name: 'react-router-dom', version: '^4.3.1' }
    ];
    const devDepends = [
        { name: 'devextreme-cli', version: '1.0.3' },
        { name: 'gh-pages', version: '^2.0.1' }
    ];
    const scripts = [
        { name: 'build-themes', value: 'devextreme build' },
        { name: 'postinstall', value: 'npm run build-themes' },
        { name: 'deploy', value: 'gh-pages -d build' }
    ];

    packageJsonUtils.addDependencies(appPath, depends);
    packageJsonUtils.addDependencies(appPath, devDepends, 'dev');
    packageJsonUtils.updateScripts(appPath, scripts);
    packageJsonUtils.updateValue(appPath, 'name', appName);
};

const getLayout = (options) => {
    const currentLayout = layouts.filter((layout) => {
        return layout.fullName === options.layout;
    });

    return currentLayout.length ? [currentLayout[0].value] : undefined;
};

const create = (appName, options) => {
    let commandArguments = ['create-react-app', appName];
    const prompts = [
        {
            type: 'select',
            name: 'layout',
            message: 'What layout do you want to add?',
            choices: layouts
        }
    ];

    runPrompts(options, prompts, getLayout).then((promptsResult) => {
        runCommand('npx', commandArguments).then(() => {
            const templateOptions = Object.assign({}, options, {
                project: appName,
                skipFolder: options.empty ? 'pages' : '',
                layout: promptsResult.layout
            });
    
            addTemplate(appName, templateOptions);
        });
    });
};

const addTemplate = (appName, templateOptions) => {
    const templateSourcePath = path.join(__dirname, '..', 'templates', 'react');
    const appPath = path.join(process.cwd(), appName);

    moveTemplateFilesToProject(templateSourcePath, appPath, templateOptions);
    addDevextremeToPackageJson(appPath);
    preparePackageJsonForTemplate(appPath, appName);
    runCommand('npm', ['install'], { cwd: appPath });
};

const install = () => {
    const appPath = process.cwd();
    const pathToMainComponent = path.join(appPath, 'src', 'App.js');
    moduleUtils.insertImport(pathToMainComponent, 'devextreme/dist/css/dx.common.css');
    moduleUtils.insertImport(pathToMainComponent, 'devextreme/dist/css/dx.light.compact.css');
    addDevextremeToPackageJson(appPath);

    runCommand('npm', ['install'], { cwd: appPath });
};

const getComponentPageName = (viewName) => {
    return `${stringUtils.capitalize(viewName)}Page`;
};

const getNavigationData = (viewName, componentName, icon) => {
    return {
        route: `\n{\n    path: \'/${viewName}\',\n    component: ${componentName}\n  }`,
        navigation: `{\n    text: \'${stringUtils.capitalize(viewName)}\',\n    path: \'/${viewName}\',\n    icon: \'${icon}\'\n  }`
    };
};

const createPathToPage = (pageName) => {
    const pagesPath = path.join(process.cwd(), 'src', 'pages');
    const newPagePath = path.join(pagesPath, pageName);

    if(!fs.existsSync(pagesPath)) {
        fs.mkdirSync(pagesPath);
        createPagesIndex();
    }

    if(fs.existsSync(newPagePath)) {
        console.error('The age already exists');
        process.exit();
    }

    fs.mkdirSync(newPagePath);

    return newPagePath;
};

const createPagesIndex = () => {
    fs.writeFileSync(pathToPagesIndex, '');
};

const addView = (pageName, options) => {
    const componentName = getComponentPageName(pageName);
    const pathToPage = createPathToPage(pageName);
    const templatePagesPath = path.join(__dirname, '..', 'templates', 'pages');
    const routingModulePath = path.join(process.cwd(), 'src', 'app-routes.js');
    const navigationModulePath = path.join(process.cwd(), 'src', 'app-navigation.js');
    const icon = options && options.icon || 'home';
    const navigationData = getNavigationData(pageName, componentName, icon);

    addPageToProject(pageName, pathToPage, templatePagesPath);
    moduleUtils.insertExport(pathToPagesIndex, componentName, `./${pageName}/${pageName}`);
    moduleUtils.insertImport(routingModulePath, './pages', componentName);
    routingUtils.addPageToAppNavigation(routingModulePath, navigationData.route);
    routingUtils.addPageToAppNavigation(navigationModulePath, navigationData.navigation, true);
};

module.exports = {
    install,
    create,
    addTemplate,
    addView
};
