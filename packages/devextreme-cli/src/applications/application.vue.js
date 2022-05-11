const path = require('path');
const fs = require('fs');
const getLayoutInfo = require('../utility/prompts/layout');
const getVersionInfo = require('../utility/prompts/vue-version');
const getTemplateTypeInfo = require('../utility/prompts/typescript');
const templateCreator = require('../utility/template-creator');
const packageManager = require('../utility/package-manager');
const packageJsonUtils = require('../utility/package-json-utils');
const runCommand = require('../utility/run-command');
const insertItemToArray = require('../utility/file-content').insertItemToArray;
const moduleUtils = require('../utility/module');
const stringUtils = require('../utility/string');
const typescriptUtils = require('../utility/typescript-extension');
const latestVersions = require('../utility/latest-versions');
const defaultStyles = [
    'devextreme/dist/css/dx.light.css',
    'devextreme/dist/css/dx.common.css'
];
const defaultVueVersion = 'v3';

const getVueVersion = () => {
    const devextremeConfig = require('../utility/devextreme-config').read();

    return devextremeConfig.vue
        ? `v${devextremeConfig.vue.version}`
        : defaultVueVersion;
};

const preparePackageJsonForTemplate = (appPath, appName, version) => {
    if(!version) {
        version = getVueVersion();
    }

    const dependencies = [
        { name: 'sass', version: '^1.34.1' },
        { name: 'vue-router', version: '^3.0.1' },
        { name: 'devextreme-cli', version: latestVersions['devextreme-cli'], dev: true },
        { name: 'sass-loader', version: '^10', dev: true }
    ];

    if(version === 'v3') {
        const nameDepends = dependencies.map(d => d.name);
        const indexVueRouter = nameDepends.indexOf('vue-router');

        dependencies[indexVueRouter].version = '^4.0.1';
    }

    const scripts = [
        { name: 'build-themes', value: 'devextreme build' },
        { name: 'postinstall', value: 'npm run build-themes' }
    ];

    packageJsonUtils.addDependencies(appPath, dependencies);
    packageJsonUtils.updateScripts(appPath, scripts);
    packageJsonUtils.updateName(appPath, appName);
};

async function createVueApp(name, templateOptions) {
    const { version, isTypeScript } = templateOptions;
    const argList = ['-p', '@vue/cli', 'vue', 'create', name];

    if(isTypeScript) {
        const presetPath = path.join(__dirname, '..', 'templates-ts', `vue-${version}`);

        argList.push(`-p "${presetPath}"`);
    } else {
        if(version === 'v2') {
            argList.push('-p "Default (Vue 2)"');
        } else {
            argList.push('-p "Default (Vue 3)"');
        }
    }

    return runCommand('npx', argList);
}

const create = async(appName, options) => {
    const version = await getVersionInfo(options.version);
    const templateType = await getTemplateTypeInfo(options.template);
    const layout = await getLayoutInfo(options.layout);

    const templateOptions = {
        project: stringUtils.humanize(appName),
        layout: layout,
        version: version,
        isTypeScript: typescriptUtils.isTypeScript(templateType)
    };

    await createVueApp(appName, templateOptions);

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

const getCorrectPath = (extension, pathToApp) => {
    return pathToApp;
};

const addTemplate = (appPath, appName, templateOptions) => {
    const { version, isTypeScript } = templateOptions;

    if(!version) {
        version = getVueVersion();
    }

    const applicationTemplatePath = path.join(
        templateCreator.getTempaltePath(`vue-${version}`, isTypeScript),
        'application'
    );
    const styles = [
        './themes/generated/theme.additional.css',
        './themes/generated/theme.base.css',
        'devextreme/dist/css/dx.common.css'
    ];

    templateCreator.moveTemplateFilesToProject(applicationTemplatePath, appPath, templateOptions, getCorrectPath);
    if(!templateOptions.empty) {
        addSamplePages(appPath, templateOptions);
    }
    preparePackageJsonForTemplate(appPath, appName, version);
    install({}, appPath, styles);
};

const install = (options, appPath, styles) => {
    appPath = appPath ? appPath : process.cwd();
    addStylesToApp(appPath, styles || defaultStyles);
    packageJsonUtils.addDevextreme(appPath, options.dxversion, 'vue');

    packageManager.runInstall({ cwd: appPath });
};

const addStylesToApp = (appPath, styles) => {
    const isTypeScript = typescriptUtils.isTypeScript(typescriptUtils.getTemplateType('vue'));

    const mainModulePath = typescriptUtils.setFileExtension(
        path.join(appPath, 'src', 'main.js'),
        isTypeScript
    );

    styles.forEach(style => {
        moduleUtils.insertImport(mainModulePath, style);
    });
};

const addSamplePages = (appPath, templateOptions) => {
    const { version, isTypeScript } = templateOptions;

    if(!version) {
        version = getVueVersion();
    }

    const samplePageTemplatePath = path.join(
        templateCreator.getTempaltePath(`vue-${version}`, isTypeScript),
        'sample-pages'
    );
    const pagesPath = createPathToPage(appPath);
    templateCreator.moveTemplateFilesToProject(samplePageTemplatePath, pagesPath, {}, getCorrectPath);
};

const getComponentPageName = (viewName) => {
    return `${stringUtils.classify(viewName)}`;
};

const getVueRoute = (viewName, componentName, pagePath, version) => {
    if(!version) {
        version = getVueVersion();
    }

    const path = `path: "/${pagePath}"`;
    const name = `name: "${stringUtils.dasherize(viewName)}"`;

    const metaPart = version === 'v2'
        ? 'meta: { requiresAuth: true }'
        : 'meta: {\n        requiresAuth: true,\n        layout: defaultLayout\n      }';

    const componentPart = version === 'v2'
        ? `components:\n      {\n        layout: defaultLayout,\n        content: ${componentName}\n      }`
        : `component: ${componentName}`;

    const commonPart = `\n    {\n      ${path},\n      ${name},\n      ${metaPart},\n      ${componentPart}\n    }`;

    return commonPart;
};

const getNavigationData = (viewName, componentName, icon, version) => {
    if(!version) {
        version = getVueVersion();
    }

    const pagePath = stringUtils.dasherize(viewName);
    return {
        route: getVueRoute(viewName, componentName, pagePath, version),
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
    const version = getVueVersion();
    const isTypeScript = typescriptUtils.isTypeScript(typescriptUtils.getTemplateType('vue'));

    const pageTemplatePath = path.join(
        templateCreator.getTempaltePath(`vue-${version}`, isTypeScript),
        'page'
    );

    const componentName = getComponentPageName(pageName);
    const pathToPage = createPathToPage(process.cwd());
    const routingModulePath = typescriptUtils.setFileExtension(
        path.join(process.cwd(), 'src', 'router.js'),
        isTypeScript
    );
    const navigationModulePath = typescriptUtils.setFileExtension(
        path.join(process.cwd(), 'src', 'app-navigation.js'),
        isTypeScript
    );
    const navigationData = getNavigationData(pageName, componentName, options && options.icon || 'folder', version);
    const getCorrectExtension = (fileExtension) => fileExtension;
    templateCreator.addPageToApp(pageName, pathToPage, pageTemplatePath, getCorrectExtension);
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
