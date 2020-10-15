const fs = require('fs');
const path = require('path');
const packageManager = require('./utility/package-manager');
const semver = require('semver');
const lock = require('./utility/file-lock');

const commands = {
    BUILD_THEME: 'build-theme',
    BUILD_VARS: 'export-theme-vars',
    BUILD_META: 'export-theme-meta'
};

const themeBuilderPackagePath = path.join(__dirname, '..', 'node_modules', 'devextreme-themebuilder');

const scssCompiler = {
    render: (scss) => {
        return new Promise((resolve, reject) => {
            require('dart-sass').render({
                data: scss
            }, (error, result) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(result.css.toString());
                }
            });
        });
    }
};

const createPath = filePath => {
    const directoryName = path.dirname(filePath);

    directoryName
        .split(/\\|\//)
        .reduce((currentPath, folder) => {
            currentPath += folder + path.sep;
            if(!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            }
            return currentPath;
        }, '');
};

const readFile = fileName => new Promise((resolve, reject) => {
    fs.readFile(require.resolve(fileName), 'utf8', (error, data) => {
        error ? reject(error) : resolve(data);
    });
});

const camelCase = str => str.replace(/[-](\w|$)/g, (_, letter) => {
    return letter.toUpperCase();
});

const camelize = (object) => {
    let result = {};
    for(let key in object) {
        if(object.hasOwnProperty(key)) {
            const newKey = camelCase(key);
            result[newKey] = object[key];
        }
    }
    return result;
};

const readInput = options => new Promise(resolve => {
    const fileName = options.inputFile;
    if(!fileName) resolve(options);

    fs.readFile(fileName, (error, data) => {
        if(error) {
            console.error(`Unable to read the ${fileName} file.`);
        } else {
            const extension = path.extname(fileName);
            if(extension !== '.json') {
                options.data = data;
            } else {
                const inputObject = JSON.parse(data);
                options = Object.assign({}, inputObject, options);
            }
        }
        resolve(options);
    });
});

const getMeta = (fullMeta, base, filter, baseParametersList) => {
    let result = {};

    for(const key in fullMeta) {
        let universalKey = key.replace('$', '@');
        if(base && baseParametersList.indexOf(universalKey) === -1) continue;
        if(filter && filter.length > 0 && filter.indexOf(universalKey) === -1) continue;
        result[universalKey] = fullMeta[key];
    }

    return result;
};

const installThemeBuilder = async version => {
    const packageJsonPath = path.join(themeBuilderPackagePath, 'package.json');
    const cwd = path.join(__dirname, '..');
    const npmrc = './.npmrc';
    const installationNpmrc = path.join(cwd, '.npmrc');
    let removeNpmrc = false;

    if(fs.existsSync(packageJsonPath) && require(packageJsonPath).version === version) {
        return;
    }

    if(fs.existsSync(npmrc)) {
        removeNpmrc = true;
        fs.copyFileSync(npmrc, installationNpmrc);
    }

    await packageManager.installPackage(`devextreme-themebuilder@${version}`, {
        cwd,
        stdio: 'ignore'
    }, {
        npm: ['--no-save']
    });

    if(removeNpmrc) {
        fs.unlinkSync(installationNpmrc);
    }
};

const getDevExtremeInfo = (dependencies) => {
    const keyValue = Object.keys(dependencies).find((key) => /devextreme@/.test(key));

    return dependencies[keyValue];
};

const getDevExtremeVersion = () => {
    const cwd = process.cwd();
    const dependencies = packageManager.getDependencies({ cwd });
    const installedDevExtremePackageJson = path.join(cwd, 'node_modules', 'devextreme', 'package.json');

    if(dependencies) {
        const devextremeInfo = dependencies.devextreme || getDevExtremeInfo(dependencies);
        if(devextremeInfo) {
            return devextremeInfo.version;
        }
    } else if(fs.existsSync(installedDevExtremePackageJson)) {
        return require(installedDevExtremePackageJson).version;
    }

    return;
};

const setWidgetsOption = (options, version) => {
    const widgets = options.widgets;
    const widgetsArgumentMinVersion = '19.2.3';
    const widgetsOptionAvailable = version === 'latest' || semver.gte(version, widgetsArgumentMinVersion);
    if(widgets && !widgetsOptionAvailable) {
        console.log(`The "--widgets" argument is supported only starting with v${widgetsArgumentMinVersion} and will be ignored.`);
    }
    if(typeof widgets === 'string') {
        options.widgets = widgets.split(',');
    }
};

const getVarsFilter = (options) => {
    const vars = options.vars || [];
    return (vars instanceof Array) ? vars : vars.split(',');
};

const runThemeBuilder = async rawOptions => {
    const options = await readInput(camelize(rawOptions));
    options.reader = readFile;
    options.sassCompiler = scssCompiler;
    options.lessCompiler = require('less/lib/less-node');

    options.lessCompiler.options = options.lessCompiler.options || {};
    options.lessCompiler.options['math'] = 'always';
    options.lessCompiler.options['paths'] = [ path.join(themeBuilderPackagePath, 'data', 'less', 'bundles') ];

    if(options.assetsBasePath) {
        options.lessCompiler.options['rootpath'] = options.assetsBasePath;
    }

    const version = options.version || getDevExtremeVersion() || 'latest';

    await lock.acquire();

    try {
        console.log(`Using version ${version}.`);
        await installThemeBuilder(version);
    } catch(e) {
        console.log(`The devextreme-themebuilder npm package of v${version} was not installed. Please verify you are using v18.2.5 or higher and examine the installation error log to further troubleshoot the issue.`);
        return;
    }

    const themeBuilder = require('devextreme-themebuilder/modules/builder');
    const baseParameters = require('devextreme-themebuilder/modules/base-parameters');

    lock.release();

    setWidgetsOption(options, version);

    let content = '';

    const result = await themeBuilder.buildTheme(options);
    const filter = getVarsFilter(options);

    createPath(options.out);

    if(options.command === commands.BUILD_THEME) {
        content = result.css;
        if(result.swatchSelector) {
            console.log(`Add the '${result.swatchSelector}' class to the container to apply swatch styles to its nested elements.`);
        }
        if(result.unusedWidgets && result.unusedWidgets.length) {
            console.log('Styles for the following widgets were not included in the resulting theme because these widgets don\'t use CSS styles:\n');
            result.unusedWidgets.forEach(w => console.log(`${w}\n`));
        }
    } else if(options.command === commands.BUILD_VARS) {
        const metadata = getMeta(result.compiledMetadata, options.base, filter, baseParameters);

        for(const metadataKey in metadata) {
            const formatKey = options.fileFormat === 'scss' ? metadataKey.replace('@', '$') : metadataKey;
            content += formatKey + ': ' + metadata[metadataKey] + ';\n';
        }
    } else if(options.command === commands.BUILD_META) {
        const metadata = getMeta(result.compiledMetadata, options.base, filter, baseParameters);
        let exportedMeta = [];

        for(const metadataKey in metadata) {
            exportedMeta.push({ key: metadataKey, value: metadata[metadataKey] });
        }

        const meta = {
            baseTheme: [ options.themeName, options.colorScheme.replace(/-/g, '.') ].join('.'),
            items: exportedMeta,
            version: result.version
        };

        if(result.widgets) {
            Object.assign(meta, { widgets: result.widgets });
        }

        content = JSON.stringify(meta, ' ', 4);
    }

    fs.writeFile(options.out, content, 'utf8', error => {
        if(error) {
            console.log(`Unable to write the ${options.out} file. ${error.message}`);
        } else {
            console.log(`The result was written to the ${options.out} file.`);
        }
    });
};

const isThemeBuilderCommand = command => {
    for(const commandKey in commands) {
        if(commands[commandKey] === command) return true;
    }
    return false;
};

module.exports = {
    run: runThemeBuilder,
    isThemeBuilderCommand: isThemeBuilderCommand
};
