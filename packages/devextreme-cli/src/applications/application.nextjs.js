const runCommand = require('../utility/run-command');
const path = require('path');
const fs = require('fs');
const getLayoutInfo = require('../utility/prompts/layout');
const getTemplateTypeInfo = require('../utility/prompts/typescript');
const templateCreator = require('../utility/template-creator');
const packageManager = require('../utility/package-manager');
const packageJsonUtils = require('../utility/package-json-utils');
const insertItemToArray = require('../utility/file-content').insertItemToArray;
const stringUtils = require('../utility/string');
const typescriptUtils = require('../utility/typescript-extension');
const removeFile = require('../utility/file-operations').remove;
const latestVersions = require('../utility/latest-versions');
const { extractDepsVersionTag } = require('../utility/extract-deps-version-tag');
const {
    updateJsonPropName,
    bumpReact,
    getCorrectPath,
    addStylesToApp,
    getComponentPageName,
} = require('./application.react');

const defaultStyles = [
    'devextreme/dist/css/dx.light.css'
];

const isNextJsApp = () => {
    const appPath = process.cwd();

    return fs.existsSync(path.join(appPath, 'next.config.ts')) || fs.existsSync(path.join(appPath, 'next.config.mjs'));
};

const isTsApp = (appPath) => {
    return fs.existsSync(path.join(appPath, 'next.config.ts'));
};

const getExtension = (appPath) => {
    return fs.existsSync(path.join(appPath, 'src/app', 'layout.tsx')) ? '.tsx' : '.jsx';
};

const pathToPagesIndex = () => {
    const extension = getExtension(process.cwd());
    return path.join(process.cwd(), 'src', 'views', `index${extension}`);
};

const preparePackageJsonForTemplate = (appPath, appName) => {
    const dependencies = [
        { name: 'devextreme-cli', version: latestVersions['devextreme-cli'], dev: true },
        { name: 'jose', version: latestVersions['jose'] },
    ];
    const scripts = [
        { name: 'build-themes', value: 'devextreme build' },
        { name: 'postinstall', value: 'npm run build-themes' }
    ];

    packageJsonUtils.addDependencies(appPath, dependencies);
    packageJsonUtils.updateScripts(appPath, scripts);
    packageJsonUtils.updateName(appPath, appName);
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

    let commandArguments = [`-p=create-next-app@${depsVersionTag || latestVersions['create-next-app']}`, 'create-next-app', appName];

    commandArguments = [
        ...commandArguments,
        `${templateOptions.isTypeScript ? '--typescript' : '--javascript'}`,
        '--eslint',
        '--no-tailwind',
        '--src-dir',
        '--app',
        '--no-turbopack',
        '--import-alias "@/*"',
    ];

    await runCommand('npx', commandArguments);

    const appPath = path.join(process.cwd(), appName);

    if(depsVersionTag) {
        bumpReact(appPath, depsVersionTag, templateOptions.isTypeScript);
    }

    addTemplate(appPath, appName, templateOptions);
    modifyAppFiles(appPath, templateOptions);
};

const modifyAppFiles = (appPath, { project, isTypeScript }) => {
    const entryFilePath = path.join(appPath, `src/app/layout.${isTypeScript ? 'tsx' : 'jsx'}`);

    let content = fs.readFileSync(entryFilePath).toString();
    content = content.replace(/<title>[^<]+<\/title>/, `<title>${project}<\/title>`);

    fs.writeFileSync(entryFilePath, content);
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

const getEntryFilePath = (options, appPath) => {
    const extension = options.isTypeScript || isTsApp(appPath) ? 'ts' : 'js';
    const srcFolder = fs.existsSync(path.join(appPath, 'src')) ? 'src' : '';
    const isAppRouterApp = fs.existsSync(path.join(appPath, srcFolder, 'app')) && fs.lstatSync(appPath).isDirectory();

    const entryFilePath = isAppRouterApp
        ? path.join('app', `layout.${extension}`)
        : path.join('pages', `_app.${extension}`);

    const jsx = fs.existsSync(path.join(appPath, srcFolder, entryFilePath + 'x')) ? 'x' : '';

    return path.join(srcFolder, entryFilePath + jsx);
};

const install = (options, appPath, styles) => {
    appPath = appPath ? appPath : process.cwd();

    const pathToMainComponent = path.join(appPath, getEntryFilePath(options, appPath));

    addStylesToApp(pathToMainComponent, styles || defaultStyles);
    packageJsonUtils.addDevextreme(appPath, options.dxversion, 'react');

    packageManager.runInstall({ cwd: appPath });
};

const getNavigationData = (viewName, componentName, icon) => {
    const pagePath = stringUtils.dasherize(viewName);
    return {
        navigation: `\n  {\n    text: \'${stringUtils.humanize(viewName)}\',\n    path: \'/pages/${pagePath}\',\n    icon: \'${icon}\'\n  }`
    };
};

const createPathToPage = (pageName) => {
    const pagesPath = path.join(process.cwd(), 'src', 'app/pages');
    const newPageFolderPath = path.join(pagesPath, pageName);

    if(!fs.existsSync(pagesPath)) {
        fs.mkdirSync(pagesPath);
        fs.writeFileSync(pathToPagesIndex(), '');
    }

    if(!fs.existsSync(newPageFolderPath)) {
        fs.mkdirSync(newPageFolderPath);
    }

    return newPageFolderPath;
};

const addSamplePages = (appPath, templateOptions) => {
    const samplePageTemplatePath = path.join(
        templateCreator.getTempaltePath('nextjs'),
        'sample-pages'
    );

    const pagesPath = path.join(appPath, 'src', 'app/pages');

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
    const navigationModulePath = path.join(process.cwd(), 'src', `app-navigation${extension}`);
    const navigationData = getNavigationData(pageName, componentName, options && options.icon || 'folder');

    const getCorrectExtension = (fileExtension) => {
        return fileExtension === '.tsx' ? extension : fileExtension;
    };

    const getPageFileName = (pageName, pageItem) => {
        return pageItem === 'page.tsx' ? 'page' : pageName;
    };

    templateCreator.addPageToApp(pageName, pathToPage, pageTemplatePath, getCorrectExtension, { getPageFileName });

    insertItemToArray(navigationModulePath, navigationData.navigation);
};

module.exports = {
    isNextJsApp,
    install,
    create,
    addTemplate,
    addView
};
