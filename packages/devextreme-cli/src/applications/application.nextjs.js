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
const { extractDepsVersionTag } = require('../utility/extract-deps-version-tag');
const defaultStyles = [
    'devextreme/dist/css/dx.light.css'
];

const getExtension = (appPath) => {
    return fs.existsSync(path.join(appPath, 'src/app', 'page.tsx')) ? '.tsx' : '.jsx';
};

const pathToPagesIndex = () => {
    const extension = getExtension(process.cwd());
    return path.join(process.cwd(), 'src', 'views', `index${extension}`);
};

const preparePackageJsonForTemplate = (appPath, appName) => {
    const dependencies = [
        { name: 'devextreme-cli', version: latestVersions['devextreme-cli'], dev: true },
    ];
    const scripts = [
        { name: 'build-themes', value: 'devextreme build' },
        { name: 'postinstall', value: 'npm run build-themes' }
    ];

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

const bumpReact = (appPath, versionTag) => {
    const dependencies = [
        { name: 'react', version: versionTag },
        { name: 'react-dom', version: versionTag },
        { name: '@types/react', version: versionTag, dev: true },
        { name: '@types/react-dom', version: versionTag, dev: true },
    ];

    packageJsonUtils.addDependencies(appPath, dependencies);
};

const create = async(appName, options) => {
    const templateType = await getTemplateTypeInfo(options.template);
    const layoutType = await getLayoutInfo(options.layout);

    const templateOptions = Object.assign({}, options, {
        project: stringUtils.humanize(appName),
        layout: stringUtils.classify(layoutType),
        isTypeScript: typescriptUtils.isTypeScript(templateType)
    });
    const depsVersionTag = extractDepsVersionTag(options);

    const commandArguments = [`-p=create-next-app@${depsVersionTag || latestVersions['create-next-app']}`, 'create-next-app', appName];

    commandArguments.push(`${templateOptions.isTypeScript ? '--typescript' : '--javascript'}`);
    commandArguments.push('--no-eslint');
    commandArguments.push('--no-tailwind');
    commandArguments.push('--src-dir');
    commandArguments.push('--app');
    commandArguments.push('--no-turbopack');
    commandArguments.push('--import-alias "@/*"');

    await runCommand('npx', commandArguments);

    const appPath = path.join(process.cwd(), appName);

    modifyIndexHtml(appPath, templateOptions.project);

    if(depsVersionTag) {
        bumpReact(appPath, depsVersionTag);
    }

    addTemplate(appPath, appName, templateOptions);
};

const modifyIndexHtml = (appPath, appName) => {
    const indexHtmlPath = path.join(appPath, 'index.html');

    let htmlContent = fs.readFileSync(indexHtmlPath).toString();
    htmlContent = htmlContent.replace(/<title>[^<]+<\/title>/, `<title>${appName}<\/title>`);
    htmlContent = htmlContent.replace('<body>', '<body class="dx-viewport">');

    fs.writeFileSync(indexHtmlPath, htmlContent);
};

const getCorrectPath = (extension, pathToApp, isTypeScript) => {
    return extension === '.ts' || extension === '.tsx' ? typescriptUtils.setFileExtension(pathToApp, isTypeScript) : pathToApp;
};

const addTemplate = (appPath, appName, templateOptions) => {
    const applicationTemplatePath = path.join(
        templateCreator.getTempaltePath('nextjs'),
        'application'
    );

    const manifestPath = path.join(appPath, 'public', 'manifest.json');

    const styles = [
        '../dx-styles.scss',
        '../themes/generated/theme.additional.css',
        '../themes/generated/theme.additional.dark.css',
        '../themes/generated/theme.base.css',
        '../themes/generated/theme.base.dark.css',
        'devextreme/dist/css/dx.common.css'
    ];

    templateCreator.moveTemplateFilesToProject(applicationTemplatePath, appPath, templateOptions, getCorrectPath);

    !templateOptions.isTypeScript && removeFile(path.join(appPath, 'src', 'types.jsx'));
    removeFile(path.join(appPath, 'src/app', 'page.js'));
    removeFile(path.join(appPath, 'src/app', 'layout.js'));
    removeFile(path.join(appPath, 'src/app', 'globals.scss'));

    if(!templateOptions.empty) {
        addSamplePages(appPath, templateOptions);
    }

    preparePackageJsonForTemplate(appPath, appName, templateOptions.isTypeScript);
    updateJsonPropName(manifestPath, appName);
    install({ isTypeScript: templateOptions.isTypeScript }, appPath, styles);
};

const install = (options, appPath, styles) => {
    appPath = appPath ? appPath : process.cwd();

    const pathToMainComponent = path.join(appPath, 'src/app', `layout.${options.isTypeScript ? 'tsx' : 'jsx'}`);
    addStylesToApp(pathToMainComponent, styles || defaultStyles);
    packageJsonUtils.addDevextreme(appPath, options.dxversion, 'react');

    packageManager.runInstall({ cwd: appPath });
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
        route: `\n  {\n    path: \'/${pagePath}\',\n    element: ${componentName}\n  }`,
        navigation: `\n  {\n    text: \'${stringUtils.humanize(viewName)}\',\n    path: \'/${pagePath}\',\n    icon: \'${icon}\'\n  }`
    };
};

const createPathToPage = (pageName) => {
    const pagesPath = path.join(process.cwd(), 'src', 'views');
    const newPagePath = path.join(pagesPath, pageName);

    if(!fs.existsSync(pagesPath)) {
        fs.mkdirSync(pagesPath);
        fs.writeFileSync(pathToPagesIndex(), '');
    }

    if(!fs.existsSync(newPagePath)) {
        fs.mkdirSync(newPagePath);
    }

    return newPagePath;
};

const addSamplePages = (appPath, templateOptions) => {
    const samplePageTemplatePath = path.join(
        templateCreator.getTempaltePath('nextjs'),
        'sample-pages'
    );

    const pagesPath = path.join(appPath, 'src', 'app');
    // fs.mkdirSync(pagesPath);
    templateCreator.moveTemplateFilesToProject(samplePageTemplatePath, pagesPath, {
        isTypeScript: templateOptions.isTypeScript
    }, getCorrectPath);
};

const addView = (pageName, options) => {
    const pageTemplatePath = path.join(
        templateCreator.getTempaltePath('nextjs'),
        'page'
    );
    const extension = getExtension(process.cwd());

    const componentName = getComponentPageName(pageName);
    const pathToPage = createPathToPage(pageName);
    const routingModulePath = path.join(process.cwd(), 'src', `app-routes${extension}`);
    const navigationModulePath = path.join(process.cwd(), 'src', `app-navigation${extension}`);
    const navigationData = getNavigationData(pageName, componentName, options && options.icon || 'folder');

    const getCorrectExtension = (fileExtension) => {
        return fileExtension === '.tsx' ? extension : fileExtension;
    };
    templateCreator.addPageToApp(pageName, pathToPage, pageTemplatePath, getCorrectExtension);
    moduleUtils.insertExport(pathToPagesIndex(), componentName, `./${pageName}/${pageName}`);
    moduleUtils.insertImport(routingModulePath, './views', componentName);
    insertItemToArray(routingModulePath, navigationData.route);
    insertItemToArray(navigationModulePath, navigationData.navigation);
};

module.exports = {
    install,
    create,
    addTemplate,
    addView
};
