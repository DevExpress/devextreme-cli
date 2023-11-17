const getLayoutInfo = require('../utility/prompts/layout');
const path = require('path');
const moduleWorker = require('../utility/module');
const runCommand = require('../utility/run-command');
const semver = require('semver').SemVer;
const fs = require('fs');
const dasherize = require('../utility/string').dasherize;
const ngVersion = require('../utility/ng-version');
const latestVersions = require('../utility/latest-versions');
const { extractToolingVersion, toolingVersionOptionName } = require('../utility/extract-tooling-version');
const schematicsVersion = latestVersions['devextreme-schematics'] || 'latest';

const minNgCliVersion = new semver('12.0.0');
const ngCliWithStandalone = new semver('17.0.0');

async function runSchematicCommand(schematicCommand, options, evaluatingOptions) {
    const collectionName = 'devextreme-schematics';
    let collectionPath = `${collectionName}@${schematicsVersion}`;

    if(options['c']) {
        collectionPath = `${path.join(process.cwd(), options['c'])}`;
        delete options['c'];
    }

    if(!localPackageExists(collectionName)) {
        await runNgCommand(['add', collectionPath, '--skip-confirmation=true'], options, evaluatingOptions);
    }

    const commandArguments = ['g', `${collectionName}:${schematicCommand}`];

    const { [toolingVersionOptionName]: _, ...optionsToArguments } = options; // eslint-disable-line no-unused-vars
    for(let option in optionsToArguments) {
        commandArguments.push(`--${dasherize(option)}=${options[option]}`);
    }

    runNgCommand(commandArguments, options, evaluatingOptions);
}

async function runNgCommand(commandArguments, commandOptions, commandConfig) {
    const hasNg = await hasSutableNgCli();
    const toolingVersion = extractToolingVersion(commandOptions);
    const npmCommandName = hasNg && !toolingVersion ? 'ng' : 'npx';
    const ngCommandArguments = hasNg && !toolingVersion
        ? []
        : ['-p', '@angular/cli@v15-lts', 'ng'];

    ngCommandArguments.push(...commandArguments);
    return runCommand(npmCommandName, ngCommandArguments, commandConfig);
}

function localPackageExists(packageName) {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if(!fs.existsSync(nodeModulesPath)) {
        return;
    }

    const packageJsonPath = path.join(nodeModulesPath, packageName, 'package.json');
    return fs.existsSync(packageJsonPath);
}

const hasSutableNgCli = async() => {
    const localVersion = ngVersion.getLocalNgVersion();
    if(!localVersion) {
        return false;
    }

    const isSupportVersion = localVersion.compare(minNgCliVersion) >= 0;
    return isSupportVersion;
};

const install = async(options) => {
    runSchematicCommand('install', {
        ...options
    });
};

const create = async(appName, options) => {
    const layout = await getLayoutInfo(options.layout);
    const currentNgVersion = ngVersion.getNgCliVersion().version;

    const commandArguments = [
        'new',
        appName,
        '--style=scss',
        '--routing=false',
        '--skip-tests=true',
        '--skip-install=true'
    ];

    if(ngCliWithStandalone.compare(currentNgVersion) <= 0) {
        commandArguments.push('--standalone=false');
    }

    await runNgCommand(commandArguments, options);

    const appPath = path.join(process.cwd(), appName);

    options.resolveConflicts = 'override';
    options.updateBudgets = true;
    options.layout = layout;
    addTemplate(appName, options, {
        cwd: appPath
    });

    changeMainTs(appPath);
};

const addTemplate = async(appName, options, evaluatingOptions) => {
    const schematicOptions = {
        ...(appName && { project: appName }),
        ...options,
        globalNgCliVersion: ngVersion.getNgCliVersion().version
    };
    runSchematicCommand('add-app-template', schematicOptions, evaluatingOptions);
};

const addView = (viewName, options) => {
    const schematicOptions = Object.assign({
        name: viewName
    }, options);
    schematicOptions.name = viewName;
    runSchematicCommand('add-view', schematicOptions);
};

const changeMainTs = (appPath) => {
    const filePath = path.join(appPath, 'src', 'main.ts');

    moduleWorker.insertImport(filePath, 'devextreme/ui/themes', 'themes', true);

    const fileContent = fs.readFileSync(filePath).toString();
    const firstChaptStr = 'platformBrowserDynamic().bootstrapModule(AppModule)';
    const lastChaptStr = '.catch(err => console.error(err));';

    fs.writeFileSync(
        filePath,
        fileContent
            .replace(firstChaptStr, `themes.initialized(() => {\n  ${firstChaptStr}`)
            .replace(lastChaptStr, `  ${lastChaptStr}\n});`)
    );
};

module.exports = {
    install,
    create,
    addTemplate,
    addView
};
