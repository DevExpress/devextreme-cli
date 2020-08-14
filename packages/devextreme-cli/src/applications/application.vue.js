const path = require('path');
const fs = require('fs');
const getLayoutInfo = require('../layout').getLayoutInfo;
const templateCreator = require('../utility/template-creator');
const packageManager = require('../utility/package-manager');
const packageJsonUtils = require('../utility/package-json-utils');
const runCommand = require('../utility/run-command');
const insertItemToArray = require('../utility/file-content').insertItemToArray;
const moduleUtils = require('../utility/module');
const stringUtils = require('../utility/string');
const latestVersions = require('../utility/latest-versions');
const defaultStyles = [
    'devextreme/dist/css/dx.light.css',
    'devextreme/dist/css/dx.common.css'
];

const preparePackageJsonForTemplate = (appPath, appName) => {
    const dependencies = [
        { name: 'node-sass', version: '^4.11.0' },
        { name: 'vue-router', version: '^3.0.1' },
        { name: 'devextreme-cli', version: latestVersions['devextreme-cli'], dev: true },
        { name: 'sass-loader', version: '^7.1.0', dev: true }
    ];
    const scripts = [
        { name: 'build-themes', value: 'devextreme build' },
        { name: 'postinstall', value: 'npm run build-themes' }
    ];

    packageJsonUtils.addDependencies(appPath, dependencies);
    packageJsonUtils.updateScripts(appPath, scripts);
    packageJsonUtils.updateName(appPath, appName);
};

async function createVueApp(name) {
    return runCommand('npx', ['-p', '@vue/cli', 'vue', 'create', name, '--default']);
}

const create = (appName, options) => {
    getLayoutInfo(options.layout).then((layoutInfo) => {
        createVueApp(appName).then(() => {
            const appPath = path.join(process.cwd(), appName);
            const humanizedName = stringUtils.humanize(appName);
            const templateOptions = Object.assign({}, options, {
                project: humanizedName,
                layout: layoutInfo.layout
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
    const templateSourcePath = path.join(__dirname, '..', 'templates', 'vue', 'application');
    const styles = [
        './themes/generated/theme.additional.css',
        './themes/generated/theme.base.css',
        'devextreme/dist/css/dx.common.css'
    ];

    templateCreator.moveTemplateFilesToProject(templateSourcePath, appPath, templateOptions);
    if(!templateOptions.empty) {
        addSamplePages(appPath);
    }
    preparePackageJsonForTemplate(appPath, appName);
    install({}, appPath, styles);
};

const install = (options, appPath, styles) => {
    appPath = appPath ? appPath : process.cwd();
    const mainModulePath = path.join(appPath, 'src', 'main.js');
    addStylesToApp(mainModulePath, styles || defaultStyles);
    packageJsonUtils.addDevextreme(appPath, options.dxversion, 'vue');

    packageManager.runInstall({ cwd: appPath });
};

const addStylesToApp = (filePath, styles) => {
    styles.forEach(style => {
        moduleUtils.insertImport(filePath, style);
    });
};

const addSamplePages = (appPath) => {
    const templateSourcePath = path.join(__dirname, '..', 'templates', 'vue', 'sample-pages');
    const pagesPath = createPathToPage(appPath);
    templateCreator.moveTemplateFilesToProject(templateSourcePath, pagesPath, {});
};

const getComponentPageName = (viewName) => {
    return `${stringUtils.classify(viewName)}`;
};

const getVueRoute = (viewName, componentName, pagePath) => {
    const components = `\n      {\n        layout: defaultLayout,\n        content: ${componentName}\n      }\n    `;
    return `\n    {\n      path: "/${pagePath}",\n      name: "${stringUtils.dasherize(viewName)}",\n      meta: { requiresAuth: true },\n      components: ${components}}`;
};

const getNavigationData = (viewName, componentName, icon) => {
    const pagePath = stringUtils.dasherize(viewName);
    return {
        route: getVueRoute(viewName, componentName, pagePath),
        navigation: `\n  {\n    text: \'${stringUtils.humanize(viewName)}\',\n    path: \'/${pagePath}\',\n    icon: \'${icon}\'\n  }`
    };
};

const createPathToPage = (appPath) => {
    const pagesPath = path.join(appPath, 'src', 'views');

    if(!fs.existsSync(pagesPath)) {
        fs.mkdirSync(pagesPath);
    }

    return pagesPath;
};

const addView = (pageName, options) => {
    const componentName = getComponentPageName(pageName);
    const pathToPage = createPathToPage(process.cwd());
    const pageTemplatePath = path.join(__dirname, '..', 'templates', 'vue', 'page');
    const routingModulePath = path.join(process.cwd(), 'src', 'router.js');
    const navigationModulePath = path.join(process.cwd(), 'src', 'app-navigation.js');
    const navigationData = getNavigationData(pageName, componentName, options && options.icon || 'folder');

    templateCreator.addPageToApp(pageName, pathToPage, pageTemplatePath);
    moduleUtils.insertImport(routingModulePath, `./views/${pageName}`, componentName, true);
    insertItemToArray(routingModulePath, navigationData.route);
    insertItemToArray(navigationModulePath, navigationData.navigation);
};

module.exports = {
    install,
    create,
    addTemplate,
    addView
};
