const runCommand = require('../utility/run-command');
const path = require('path');
const fs = require('fs');
const runPrompts = require('../utility/prompts');
const moveTemplateFilesToProject = require('../utility/move-template-to-project').moveTemplateFilesToProject;
const addPageToProject = require('../utility/move-template-to-project').addPageToProject;
const packageJsonUtils = require('../utility/modify-package-json');
const modifyJson = require('../utility/modify-json-file');
const routingUtils = require('../utility/routing');
const moduleUtils = require('../utility/module');
const stringUtils = require('../utility/string');
const pathToPagesIndex = path.join(process.cwd(), 'src', 'pages', 'index.js');
const layouts = [
    { fullName: 'side-nav-outer-toolbar', title: 'Side navigation (outer toolbar)', value: 'SideNavOuterToolbar' },
    { fullName: 'side-nav-inner-toolbar', title: 'Side navigation (inner toolbar)', value: 'SideNavInnerToolbar' }
];

const addDevextremeToPackageJson = (appPath) => {
    const packagePath = path.join(appPath, 'package.json');
    const depends = [
        { name: 'devextreme', version: '18.2' },
        { name: 'devextreme-react', version: '18.2' }
    ];

    packageJsonUtils.addDependencies(packagePath, depends);
};

const preparePackageJsonForTemplate = (packagePath, appName) => {
    const depends = [
        { name: 'node-sass', version: '^4.11.0' },
        { name: 'react-router-dom', version: '^5.0.0' }
    ];
    const devDepends = [
        { name: 'devextreme-cli', version: 'latest' },
        { name: 'gh-pages', version: '^2.0.1' }
    ];
    const scripts = [
        { name: 'build-themes', value: 'devextreme build' },
        { name: 'postinstall', value: 'npm run build-themes' },
        { name: 'deploy', value: 'gh-pages -d build' }
    ];

    packageJsonUtils.addDependencies(packagePath, depends);
    packageJsonUtils.addDependencies(packagePath, devDepends, 'dev');
    packageJsonUtils.updateScripts(packagePath, scripts);
    updateJsonName(packagePath, appName);
};

const updateJsonName = (path, name) => {
    modifyJson(path, content => {
        content.name = name;

        return content;
    });
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
            const appPath = path.join(process.cwd(), appName);
            const humanizedName = stringUtils.humanize(appName);
            const templateOptions = Object.assign({}, options, {
                project: humanizedName,
                skipFolder: options.empty ? 'pages' : '',
                layout: promptsResult.layout
            });
            changeHTMLTitleName(appPath, humanizedName);
            addTemplate(appPath, appName, templateOptions);
        });
    });
};

const changeHTMLTitleName = (appPath, appName) => {
    const indexHtmlPath = path.join(appPath, 'public', 'index.html');
    let htmlCotent = fs.readFileSync(indexHtmlPath).toString();

    htmlCotent = htmlCotent.replace(/<title>(\w+\s*)+<\/title>/, `<title>${appName}<\/title>`);
    fs.writeFileSync(indexHtmlPath, htmlCotent);
};

const addTemplate = (appPath, appName, templateOptions) => {
    const templateSourcePath = path.join(__dirname, '..', 'templates', 'react');
    const packagePath = path.join(appPath, 'package.json');
    const manifestPath = path.join(appPath, 'public', 'manifest.json');

    moveTemplateFilesToProject(templateSourcePath, appPath, templateOptions);
    addDevextremeToPackageJson(appPath);
    preparePackageJsonForTemplate(packagePath, appName);
    updateJsonName(manifestPath, appName);
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
    return `${stringUtils.classify(viewName)}Page`;
};

const getNavigationData = (viewName, componentName, icon) => {
    const pagePath = stringUtils.dasherize(viewName);
    return {
        route: `\n{\n    path: \'/${pagePath}\',\n    component: ${componentName}\n  }`,
        navigation: `{\n    text: \'${stringUtils.humanize(viewName)}\',\n    path: \'/${pagePath}\',\n    icon: \'${icon}\'\n  }`
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
    routingUtils.addPageToAppNavigation(navigationModulePath, navigationData.navigation);
};

module.exports = {
    install,
    create,
    addTemplate,
    addView
};
