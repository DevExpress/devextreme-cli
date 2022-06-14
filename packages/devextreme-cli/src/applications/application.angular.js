const getLayoutInfo = require('../utility/prompts/layout');
const path = require('path');
const moduleWorker = require('../utility/module');
const runCommand = require('../utility/run-command');
const semver = require('semver').SemVer;
const fs = require('fs');
const exec = require('child_process').exec;
const latestVersions = require('../utility/latest-versions');
const schematicsVersion = latestVersions['devextreme-schematics'] || 'latest';

const minNgCliVersion = new semver('8.0.0');
let globalNgCliVersion = '';

const kebabize = (str) =>
    str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());

const getNgCliVersion = async() => new Promise((resolve, reject) => {
    exec('ng v', (err, stdout, stderr) => {
        if(!!err) {
            resolve('');
            return;
        }

        const parsingResult = parseNgCliVersion(stdout);
        if(!parsingResult) {
            resolve('');
        }

        resolve(parsingResult.version);
    });
});

async function runSchematicCommand(schematicCommand, options, evaluatingOptions) {
    globalNgCliVersion = await getNgCliVersion();

    const collectionName = 'devextreme-schematics';
    let collectionPath = `${collectionName}@${schematicsVersion}`;

    if(options['c']) {
        collectionPath = `${path.join(process.cwd(), options['c'])}`;
        delete options['c'];
    }

    if(!localPackageExists(collectionName)) {
        await runNgCommand(['add', collectionPath, '--skip-confirmation=true'], evaluatingOptions);
    }

    const commandArguments = ['g', `${collectionName}:${schematicCommand}`];
    for(let option in options) {
        commandArguments.push(`--${kebabize(option)}=${options[option]}`);
    }

    runNgCommand(commandArguments, evaluatingOptions);
}

async function runNgCommand(commandArguments, evaluatingOptions) {
    const hasNg = await hasSutableNgCli();
    const npmCommandName = hasNg ? 'ng' : 'npx';
    const ngCommandArguments = hasNg
        ? []
        : ['-p', '@angular/cli', 'ng'];

    ngCommandArguments.push(...commandArguments);
    return runCommand(npmCommandName, ngCommandArguments, evaluatingOptions);
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
    const cliVersion = await getNgCliVersion();
    if(globalNgCliVersion === '' || cliVersion === '') {
        return false;
    }

    const isSupportVersion = (new semver(cliVersion)).compare(minNgCliVersion);
    if(isSupportVersion) {
        globalNgCliVersion = cliVersion;
        return true;
    } else {
        return false;
    }
};

function parseNgCliVersion(stdout) {
    return new semver(/angular.cli:\s*(\S+)/ig.exec(stdout.toString())[1]);
}

const install = (options) => {
    runSchematicCommand('install', {
        ...options,
        globalNgCliVersion: globalNgCliVersion
    });
};

const create = async(appName, options) => {
    const layout = await getLayoutInfo(options.layout);

    const commandArguments = [
        'new',
        appName,
        '--style=scss',
        '--routing=false',
        '--skip-tests=true',
        '--skip-install=true',
    ];

    await runNgCommand(commandArguments);

    const appPath = path.join(process.cwd(), appName);

    options.resolveConflicts = 'override';
    options.updateBudgets = true;
    options.layout = layout;
    addTemplate(appName, options, {
        cwd: appPath
    });

    changeMainTs(appPath);
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
