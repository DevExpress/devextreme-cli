const getLayoutInfo = require('../utility/prompts/layout').getLayoutInfo;
const path = require('path');
const moduleWorker = require('../utility/module');
const runCommand = require('../utility/run-command');
const semver = require('semver').SemVer;
const fs = require('fs');
const exec = require('child_process').exec;
const minNgCliVersion = new semver('8.0.0');
const latestVersions = require('../utility/latest-versions');
const schematicsVersion = latestVersions['devextreme-schematics'] || 'latest';
let globalNgCliVersion = '';

async function runSchematicCommand(schematicCommand, options, evaluatingOptions) {
    const collectionName = 'devextreme-schematics';
    let collectionPath = `${collectionName}@${schematicsVersion}`;

    if(options['c']) {
        collectionPath = `${path.join(process.cwd(), options['c'])}`;
        delete options['c'];
    }

    if(!localPackageExists(collectionName)) {
        await runNgCommand(['add', collectionPath, '--skipConfirmation=true'], evaluatingOptions);
    }

    const commandArguments = ['g', `${collectionName}:${schematicCommand}`];
    for(let option in options) {
        commandArguments.push(`--${option}=${options[option]}`);
    }

    runNgCommand(commandArguments, evaluatingOptions);
}

async function runNgCommand(commandArguments, evaluatingOptions) {
    const ngCommandArguments = await hasSutableNgCli() ? [] : ['-p', '@angular/cli'];

    ngCommandArguments.push('ng', ...commandArguments);
    return runCommand('npx', ngCommandArguments, evaluatingOptions);
}

function localPackageExists(packageName) {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if(!fs.existsSync(nodeModulesPath)) {
        return;
    }

    const packageJsonPath = path.join(nodeModulesPath, packageName, 'package.json');
    return fs.existsSync(packageJsonPath);
}

function hasSutableNgCli() {
    return new Promise((resolve, reject) => {
        exec('ng v', (err, stdout, stderr) => {
            const parsingResult = !stderr && parseNgCliVersion(stdout);
            if(parsingResult && parsingResult.compare(minNgCliVersion) < 0) {
                globalNgCliVersion = parsingResult.version;
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

function parseNgCliVersion(stdout) {
    return new semver(/angular.cli:\s*(\S+)/ig.exec(stdout.toString())[1]);
}

const install = (options) => {
    runSchematicCommand('install', { ...options, globalNgCliVersion });
};

const create = (appName, options) => {
    const commandArguments = [
        'new',
        appName,
        '--style=scss',
        '--routing=false',
        '--skip-tests=true',
        '--skip-install=true',
    ];

    getLayoutInfo(options.layout).then(layoutInfo => {
        runNgCommand(commandArguments).then(() => {
            const appPath = path.join(process.cwd(), appName);

            options.resolveConflicts = 'override';
            options.updateBudgets = true;
            options.layout = layoutInfo.layout;
            addTemplate(appName, options, {
                cwd: appPath
            });

            changeMainTs(appPath);
        }).catch((e) => {
            console.log(e);
        });
    });
};

const addTemplate = (appName, options, evaluatingOptions) => {
    const schematicOptions = { ...(appName && { project: appName }), ...options };
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
