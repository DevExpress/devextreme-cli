const runCommand = require('../utility/run-command');
const path = require('path');
const fs = require('fs');
const getLayoutInfo = require('../utility/prompts/layout');
const getTemplateTypeInfo = require('../utility/prompts/typescript');
const templateCreator = require('../utility/template-creator');
const packageManager = require('../utility/package-manager');
const packageJsonUtils = require('../utility/package-json-utils');
const modifyJson = require('../utility/modify-json-file');
const insertItemToArray = require('../utility/file-content').insertItemToArray;
const moduleUtils = require('../utility/module');
const stringUtils = require('../utility/string');
const typescriptUtils = require('../utility/typescript-extension');
const removeFile = require('../utility/file-operations').remove;
const latestVersions = require('../utility/latest-versions');
const defaultStyles = [
    'devextreme/dist/css/dx.light.css',
    'devextreme/dist/css/dx.common.css'
];

const pathToPagesIndex = (isTypeScript) => {
    const pageIndexPath = path.join(process.cwd(), 'src', 'pages', 'index.js');
    return typescriptUtils.setFileExtension(pageIndexPath, isTypeScript);
};

const preparePackageJsonForTemplate = (appPath, appName, isTypeScript) => {
    const dependencies = [
        { name: 'sass', version: '^1.34.1' },
        { name: 'devextreme-cli', version: latestVersions['devextreme-cli'], dev: true },
        { name: 'react-router-dom', version: '^5.0.0' },
    ];
    const scripts = [
        { name: 'build-themes', value: 'devextreme build' },
        { name: 'postinstall', value: 'npm run build-themes' }
    ];

    if(isTypeScript) {
        dependencies.push({ name: '@testing-library/react', version: '^11.1.0' });
        dependencies.push({ name: '@types/react-router-dom', version: '^5.1.5' });
        dependencies.push({ name: '@types/react-dom', version: '^17.0.11' });
    }

    packageJsonUtils.addDependencies(appPath, dependencies);
    packageJsonUtils.updateScripts(appPath, scripts);
    packageJsonUtils.updateName(appPath, appName);
};

const updateJsonPropName = (path, name) => {
    modifyJson(path, content => {
        content.name = name;

        return content;
    });
};

const create = async(appName, options) => {
    const templateType = await getTemplateTypeInfo(options.template);
    const layoutType = await getLayoutInfo(options.layout);

    const templateOptions = Object.assign({}, options, {
        project: stringUtils.humanize(appName),
        layout: stringUtils.classify(layoutType),
        isTypeScript: typescriptUtils.isTypeScript(templateType)
    });

    const commandArguments = ['-p=create-react-app', 'create-react-app', appName];
    if(templateOptions.isTypeScript) {
        commandArguments.push('--template typescript');
    }

    await runCommand('npx', commandArguments);

    const appPath = path.join(process.cwd(), appName);

    modifyIndexHtml(appPath, templateOptions.project);
    addTemplate(appPath, appName, templateOptions);
};

const modifyIndexHtml = (appPath, appName) => {
    const indexHtmlPath = path.join(appPath, 'public', 'index.html');

    let htmlContent = fs.readFileSync(indexHtmlPath).toString();
    htmlContent = htmlContent.replace(/<title>(\w+\s*)+<\/title>/, `<title>${appName}<\/title>`);
    htmlContent = htmlContent.replace('<body>', '<body class="dx-viewport">');

    fs.writeFileSync(indexHtmlPath, htmlContent);
};

const addTemplate = (appPath, appName, templateOptions) => {
    const applicationTemplatePath = path.join(
        templateCreator.getTempaltePath('react', templateOptions.isTypeScript),
        'application'
    );

    const manifestPath = path.join(appPath, 'public', 'manifest.json');
    const indexPath = typescriptUtils.setFileExtension(
        path.join(appPath, 'src', 'index.js'),
        templateOptions.isTypeScript
    );
    const styles = [
        './themes/generated/theme.additional.css',
        './themes/generated/theme.base.css',
        'devextreme/dist/css/dx.common.css'
    ];

    templateCreator.moveTemplateFilesToProject(applicationTemplatePath, appPath, templateOptions);
    removeFile(path.join(appPath, 'src', 'App.css'));
    if(!templateOptions.empty) {
        addSamplePages(appPath, templateOptions);
    }

    preparePackageJsonForTemplate(appPath, appName, templateOptions.isTypeScript);
    updateJsonPropName(manifestPath, appName);
    addPolyfills(packageJsonUtils.getPackageJsonPath(), indexPath);
    install({}, appPath, styles);
};

const install = (options, appPath, styles) => {
    const isTypeScript = typescriptUtils.isTypeScript(typescriptUtils.getTemplateType('react'));

    appPath = appPath ? appPath : process.cwd();
    const pathToMainComponent = typescriptUtils.setFileExtension(
        path.join(appPath, 'src', 'App.js'),
        isTypeScript
    );
    addStylesToApp(pathToMainComponent, styles || defaultStyles);
    packageJsonUtils.addDevextreme(appPath, options.dxversion, 'react');

    packageManager.runInstall({ cwd: appPath });
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
        route: `\n  {\n    path: \'/${pagePath}\',\n    component: ${componentName}\n  }`,
        navigation: `\n  {\n    text: \'${stringUtils.humanize(viewName)}\',\n    path: \'/${pagePath}\',\n    icon: \'${icon}\'\n  }`
    };
};

const createPathToPage = (pageName, isTypeScript) => {
    const pagesPath = path.join(process.cwd(), 'src', 'pages');
    const newPagePath = path.join(pagesPath, pageName);

    if(!fs.existsSync(pagesPath)) {
        fs.mkdirSync(pagesPath);
        createPagesIndex(isTypeScript);
    }

    if(!fs.existsSync(newPagePath)) {
        fs.mkdirSync(newPagePath);
    }

    return newPagePath;
};

const createPagesIndex = (isTypeScript) => {
    fs.writeFileSync(pathToPagesIndex(isTypeScript), '');
};

const addSamplePages = (appPath, templateOptions) => {
    const samplePageTemplatePath = path.join(
        templateCreator.getTempaltePath('react', templateOptions.isTypeScript),
        'sample-pages'
    );

    const pagesPath = path.join(appPath, 'src', 'pages');
    fs.mkdirSync(pagesPath);
    templateCreator.moveTemplateFilesToProject(samplePageTemplatePath, pagesPath, {});
};

const addView = (pageName, options) => {
    const isTypeScript = typescriptUtils.isTypeScript(typescriptUtils.getTemplateType('react'));

    const pageTemplatePath = path.join(
        templateCreator.getTempaltePath('react', isTypeScript),
        'page'
    );

    const componentName = getComponentPageName(pageName);
    const pathToPage = createPathToPage(pageName, isTypeScript);
    const routingModulePath = typescriptUtils.setFileExtension(
        path.join(process.cwd(), 'src', 'app-routes.js'),
        isTypeScript
    );
    const navigationModulePath = typescriptUtils.setFileExtension(
        path.join(process.cwd(), 'src', 'app-navigation.js'),
        isTypeScript
    );
    const navigationData = getNavigationData(pageName, componentName, options && options.icon || 'folder');

    templateCreator.addPageToApp(pageName, pathToPage, pageTemplatePath);
    moduleUtils.insertExport(pathToPagesIndex(isTypeScript), componentName, `./${pageName}/${pageName}`);
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
