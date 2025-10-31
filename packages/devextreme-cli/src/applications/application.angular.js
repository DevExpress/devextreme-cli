const getLayoutInfo = require('../utility/prompts/layout');
const path = require('path');
const moduleWorker = require('../utility/module');
const runCommand = require('../utility/run-command');
const semver = require('semver').SemVer;
const fs = require('fs');
const dasherize = require('../utility/string').dasherize;
const ngVersion = require('../utility/ng-version');
const latestVersions = require('../utility/latest-versions');
const { extractDepsVersionTag, depsVersionTagOptionName } = require('../utility/extract-deps-version-tag');
const { getPackageJsonPath } = require('../utility/package-json-utils');
const modifyJson = require('../utility/modify-json-file');
const schematicsVersion = latestVersions['devextreme-schematics'] || 'latest';

const minNgCliVersion = new semver('17.0.0');
const ngCliWithZoneless = new semver('20.0.0');

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

    const { [depsVersionTagOptionName]: _, ...optionsToArguments } = options; // eslint-disable-line no-unused-vars
    for(let option in optionsToArguments) {
        commandArguments.push(`--${dasherize(option)}=${options[option]}`);
    }

    runNgCommand(commandArguments, options, evaluatingOptions);
}

async function runNgCommand(commandArguments, commandOptions, commandConfig) {
    const hasNg = await hasSutableNgCli();
    const depsVersionTag = extractDepsVersionTag(commandOptions);
    const npmCommandName = hasNg && !depsVersionTag ? 'ng' : 'npx';
    const [minCliLtsVersion] = minNgCliVersion.version.split('.');

    const ngCommandArguments = hasNg && !depsVersionTag
        ? []
        : ['-p', `@angular/cli@${depsVersionTag || `v${minCliLtsVersion}-lts`}`, 'ng'];

    ngCommandArguments.push(...commandArguments);
    return runCommand(npmCommandName, ngCommandArguments, commandConfig);
}

function localPackageExists(packageName) {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if(fs.existsSync(nodeModulesPath)) {
        const packageJsonPath = path.join(nodeModulesPath, packageName, 'package.json');
        if(fs.existsSync(packageJsonPath)) {
            return true;
        }
    }
    return false;
}

function getLocalCollectionPath(packageName) {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules', packageName, 'src', 'collection.json');
    if(fs.existsSync(nodeModulesPath)) {
        return nodeModulesPath;
    }
    return null;
}

function getCollectionPath(packageName) {
    const localPath = getLocalCollectionPath(packageName);
    if(localPath) {
        return localPath;
    }

    try {
        const packageJsonPath = require.resolve(`${packageName}/package.json`);
        const collectionPath = path.join(path.dirname(packageJsonPath), 'src', 'collection.json');
        if(fs.existsSync(collectionPath)) {
            return collectionPath;
        }
    } catch(e) {}

    return null;
}

function schematicsCliExists() {
    try {
        require.resolve('@angular-devkit/schematics-cli/package.json');
        return true;
    } catch(e) {
        return false;
    }
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

const bumpAngular = (appPath, versionTag) => {
    modifyJson(getPackageJsonPath(appPath), ({ dependencies, devDependencies, ...rest }) => {
        const bump = (section) => {
            for(const depName in section) {
                section[depName] = depName.startsWith('@angular') ? versionTag : section[depName];
            }
            return section;
        };

        return {
            dependencies: bump(dependencies),
            devDependencies: bump(devDependencies),
            ...rest,
        };
    });

};

const create = async(appName, options) => {
    const layout = await getLayoutInfo(options.layout);
    const currentNgVersion = ngVersion.getNgCliVersion().version;
    const depsVersionTag = extractDepsVersionTag(options);

    const commandArguments = [
        'new',
        appName,
        '--style=scss',
        '--routing=false',
        '--skip-tests=true',
        '--skip-install=true',
        '--standalone=true',
        '--ssr=false'
    ];

    if(ngCliWithZoneless.compare(currentNgVersion) <= 0) {
        commandArguments.push('--zoneless=false');
    }

    await runNgCommand(commandArguments, options);

    const appPath = path.join(process.cwd(), appName);

    if(depsVersionTag) {
        bumpAngular(appPath, depsVersionTag);
    }

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

const migrateConfigComponents = async(options = {}) => {
    const collectionName = 'devextreme-schematics';
    const collectionPath = getCollectionPath(collectionName);

    if(!collectionPath) {
        const prompts = require('prompts');

        console.log(`\nThe '${collectionName}' package is required to run this command.`);

        const response = await prompts({
            type: 'confirm',
            name: 'install',
            message: `Would you like to install '${collectionName}@${schematicsVersion}' in the npm cache?`,
            initial: true
        });

        if(!response.install) {
            console.log('Migration cancelled. Install devextreme-schematics manually and rerun the command.');
            process.exit(1);
        }
    }

    const schematicOptions = {
        ...options
    };

    const hasSchematicsCli = schematicsCliExists();
    const commandArguments = ['--yes'];

    if(!hasSchematicsCli) {
        commandArguments.push('-p', '@angular-devkit/schematics-cli');
    }

    if(!collectionPath) {
        commandArguments.push('-p', `${collectionName}@${schematicsVersion}`);
    }

    const collectionSpecifier = collectionPath
        ? `${collectionPath.replace(/\\/g, '/')}:migrate-config-components`
        : `${collectionName}:migrate-config-components`;

    commandArguments.push('schematics', collectionSpecifier);

    const { [depsVersionTagOptionName]: _, ...optionsToArguments } = schematicOptions; // eslint-disable-line no-unused-vars
    for(let option in optionsToArguments) {
        const value = optionsToArguments[option];
        if(value !== undefined && value !== null && value !== '') {
            if(Array.isArray(value)) {
                if(value.length > 0) {
                    commandArguments.push(`--${dasherize(option)}=${value.join(',')}`);
                }
            } else {
                commandArguments.push(`--${dasherize(option)}=${value}`);
            }
        }
    }

    // Use runCommand directly with npx to work outside Angular workspace
    return runCommand('npx', commandArguments, { stdio: 'inherit' });
};

const changeMainTs = (appPath) => {
    const filePath = path.join(appPath, 'src', 'main.ts');

    moduleWorker.insertImport(filePath, 'devextreme/ui/themes', 'themes', true);

    const fileContent = fs.readFileSync(filePath).toString();
    const bootstrapPattern = /bootstrapApplication\([^)]+\)/;
    const firstChaptStr = fileContent.match(bootstrapPattern)[0];
    const lastChaptStr = '.catch((err) => console.error(err));';

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
    addView,
    migrateConfigComponents
};
