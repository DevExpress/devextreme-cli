const runCommand = require('../utility/run-command');
const path = require('path');
const fs = require('fs');
const runPrompts = require('../utility/prompts');
const templateCreator = require('../utility/template-creator');
const packageJsonUtils = require('../utility/package-json-utils');
const modifyJson = require('../utility/modify-json-file');
const insertItemToArray = require('../utility/file-content').insertItemToArray;
const moduleUtils = require('../utility/module');
const stringUtils = require('../utility/string');
const pathToPagesIndex = path.join(process.cwd(), 'src', 'pages', 'index.js');
const latestVersions = require('../utility/latest-versions');
const defaultStyles = [
    'devextreme/dist/css/dx.light.css',
    'devextreme/dist/css/dx.common.css'
];
const layouts = [
    { fullName: 'side-nav-outer-toolbar', title: 'Side navigation (outer toolbar)', value: 'SideNavOuterToolbar' },
    { fullName: 'side-nav-inner-toolbar', title: 'Side navigation (inner toolbar)', value: 'SideNavInnerToolbar' }
];

const preparePackageJsonForTemplate = (appPath, appName) => {
    const depends = [
        { name: 'node-sass', version: '^4.11.0' },
        { name: 'react-router-dom', version: '^5.0.0' }
    ];
    const devDepends = [
        { name: 'devextreme-cli', version: latestVersions['devextreme-cli'] }
    ];
    const scripts = [
        { name: 'build-themes', value: 'devextreme build' },
        { name: 'postinstall', value: 'npm run build-themes' }
    ];

    packageJsonUtils.addDependencies(appPath, depends);
    packageJsonUtils.addDependencies(appPath, devDepends, 'dev');
    packageJsonUtils.updateScripts(appPath, scripts);
    packageJsonUtils.updateName(appPath, appName);
};

const updateJsonPropName = (path, name) => {
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
    const commandArguments = ['create-react-app', appName];
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
                layout: promptsResult.layout
            });
            modifyIndexHtml(appPath, humanizedName);
            addTemplate(appPath, appName, templateOptions);
        });
    });
};

const modifyIndexHtml = (appPath, appName) => {
    const indexHtmlPath = path.join(appPath, 'public', 'index.html');
    let htmlContent = fs.readFileSync(indexHtmlPath).toString();

    htmlContent = htmlContent.replace(/<title>(\w+\s*)+<\/title>/, `<title>${appName}<\/title>`);
    htmlContent = htmlContent.replace('<body>', '<body class="dx-viewport">');
    fs.writeFileSync(indexHtmlPath, htmlContent);
};

const addTemplate = (appPath, appName, templateOptions) => {
    const templateSourcePath = path.join(__dirname, '..', 'templates', 'react', 'application');
    const manifestPath = path.join(appPath, 'public', 'manifest.json');
    const indexPath = path.join(appPath, 'src', 'index.js');
    const styles = [
        'devextreme/dist/css/dx.common.css',
        './themes/generated/theme.additional.css',
        './themes/generated/theme.base.css'];

    templateCreator.moveTemplateFilesToProject(templateSourcePath, appPath, templateOptions);
    if(!templateOptions.empty) {
        addSamplePages(appPath);
    }
    preparePackageJsonForTemplate(appPath, appName);
    updateJsonPropName(manifestPath, appName);
    addPolyfills(packageJsonUtils.getPackageJsonPath(), indexPath);
    install({}, appPath, styles);
};

const install = (options, appPath, styles) => {
    appPath = appPath ? appPath : process.cwd();
    const pathToMainComponent = path.join(appPath, 'src', 'App.js');
    addStylesToApp(pathToMainComponent, styles || defaultStyles);
    packageJsonUtils.addDevextreme(appPath, options.dxversion, 'react');

    runCommand('npm', ['install'], { cwd: appPath });
};

const addPolyfills = (packagePath, indexPath) => {
    const packages = [
        { name: 'react-app-polyfill', version: '^1.0.0' }
    ];

    packageJsonUtils.addDependencies(packagePath, packages);
    moduleUtils.insertImport(indexPath, './polyfills');
};

const addStylesToApp = (filePath, styles) => {
    styles.forEach(style => {
        moduleUtils.insertImport(filePath, style);
    });
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

    if(!fs.existsSync(newPagePath)) {
        fs.mkdirSync(newPagePath);
    }

    return newPagePath;
};

const createPagesIndex = () => {
    fs.writeFileSync(pathToPagesIndex, '');
};

const addSamplePages = (appPath) => {
    const templateSourcePath = path.join(__dirname, '..', 'templates', 'react', 'sample-pages');
    const pagesPath = path.join(appPath, 'src', 'pages');
    fs.mkdirSync(pagesPath);
    templateCreator.moveTemplateFilesToProject(templateSourcePath, pagesPath, {});
};

const addView = (pageName, options) => {
    const componentName = getComponentPageName(pageName);
    const pathToPage = createPathToPage(pageName);
    const pageTemplatePath = path.join(__dirname, '..', 'templates', 'react', 'page');
    const routingModulePath = path.join(process.cwd(), 'src', 'app-routes.js');
    const navigationModulePath = path.join(process.cwd(), 'src', 'app-navigation.js');
    const navigationData = getNavigationData(pageName, componentName, options && options.icon || 'home');

    templateCreator.addPageToApp(pageName, pathToPage, pageTemplatePath);
    moduleUtils.insertExport(pathToPagesIndex, componentName, `./${pageName}/${pageName}`);
    moduleUtils.insertImport(routingModulePath, './pages', componentName);
    insertItemToArray(routingModulePath, navigationData.route);
    insertItemToArray(navigationModulePath, navigationData.navigation);
};

module.exports = {
    install,
    create,
    addTemplate,
    addView
};
