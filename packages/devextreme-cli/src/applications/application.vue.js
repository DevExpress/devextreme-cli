const path = require('path');
const fs = require('fs');
const getLayoutInfo = require('../utility/prompts/layout').getLayoutInfo;
const getVersionInfo = require('../utility/prompts/vue-version').getVersionInfo;
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
const defaultVueVersion = 'v2';

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

        // NOTE v3 freezed because of 'class' attribute deleted
        dependencies.push({ name: 'vue', version: '3.0.11' });
    }

    const scripts = [
        { name: 'build-themes', value: 'devextreme build' },
        { name: 'postinstall', value: 'npm run build-themes' }
    ];

    packageJsonUtils.addDependencies(appPath, dependencies);
    packageJsonUtils.updateScripts(appPath, scripts);
    packageJsonUtils.updateName(appPath, appName);
};

async function createVueApp(name, version) {
    const argList = ['-p', '@vue/cli', 'vue', 'create', name];

    if(version === defaultVueVersion) {
        argList.push('--default');
    } else {
        argList.push('-p');
        argList.push('__default_vue_3__');
    }

    return runCommand('npx', argList);
}

const create = async(appName, options) => {
    const versionInfo = await getVersionInfo(options.version);
    const layoutInfo = await getLayoutInfo(options.layout);

    await createVueApp(appName, versionInfo.version);

    const appPath = path.join(process.cwd(), appName);
    const humanizedName = stringUtils.humanize(appName);
    const templateOptions = Object.assign({}, options, {
        project: humanizedName,
        layout: layoutInfo.layout
    });
    modifyIndexHtml(appPath, humanizedName);
    addTemplate(appPath, appName, templateOptions, versionInfo.version);
};

const modifyIndexHtml = (appPath, appName) => {
    const indexHtmlPath = path.join(appPath, 'public', 'index.html');
    let htmlContent = fs.readFileSync(indexHtmlPath).toString();

    htmlContent = htmlContent.replace(/<title>(\w+\s*)+<\/title>/, `<title>${appName}<\/title>`);
    htmlContent = htmlContent.replace('<body>', '<body class="dx-viewport">');
    fs.writeFileSync(indexHtmlPath, htmlContent);
};

const addTemplate = (appPath, appName, templateOptions, version) => {
    if(!version) {
        version = getVueVersion();
    }

    const templateSourcePath = path.join(__dirname, '..', 'templates', `vue-${version}`, 'application');
    const styles = [
        './themes/generated/theme.additional.css',
        './themes/generated/theme.base.css',
        'devextreme/dist/css/dx.common.css'
    ];

    templateCreator.moveTemplateFilesToProject(templateSourcePath, appPath, templateOptions);
    if(!templateOptions.empty) {
        addSamplePages(appPath, version);
    }
    preparePackageJsonForTemplate(appPath, appName, version);
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

const addSamplePages = (appPath, version) => {
    if(!version) {
        version = getVueVersion();
    }

    const templateSourcePath = path.join(__dirname, '..', 'templates', `vue-${version}`, 'sample-pages');
    const pagesPath = createPathToPage(appPath);
    templateCreator.moveTemplateFilesToProject(templateSourcePath, pagesPath, {});
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

    const metaPart = version === defaultVueVersion
        ? 'meta: { requiresAuth: true }'
        : 'meta: {\n        requiresAuth: true,\n        layout: defaultLayout\n      }';

    const componentPart = version === defaultVueVersion
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
    const componentName = getComponentPageName(pageName);
    const pathToPage = createPathToPage(process.cwd());
    const pageTemplatePath = path.join(__dirname, '..', 'templates', `vue-${version}`, 'page');
    const routingModulePath = path.join(process.cwd(), 'src', 'router.js');
    const navigationModulePath = path.join(process.cwd(), 'src', 'app-navigation.js');
    const navigationData = getNavigationData(pageName, componentName, options && options.icon || 'folder', version);

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
