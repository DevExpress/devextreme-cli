const fs = require('fs');
const path = require('path');
const semver = require('semver');
const stripBom = require('strip-bom');
const importCwd = require('import-cwd');
const packageManager = require('./utility/package-manager');
const lock = require('./utility/file-lock');

const commands = {
    BUILD_THEME: 'build-theme',
    BUILD_VARS: 'export-theme-vars',
    BUILD_META: 'export-theme-meta'
};

const themeBuilderPackagePath = path.join(process.cwd(), 'node_modules', 'devextreme-themebuilder');

const scssCompilerDart = {
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

const scssCompiler = {
    render: (scss) => {
        return new Promise((resolve, reject) => {
            require('sass-embeded').compileStringAsync(scss)
                .then((data) => resolve(data.css.toString()))
                .catch((error) => reject(error.message));
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
    const fullFileName = path.normalize(path.join(
        themeBuilderPackagePath,
        '..',
        fileName
    ));
    fs.readFile(fullFileName, 'utf8', (error, data) => {
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
            data = stripBom(data.toString());
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
        result[key] = fullMeta[key];
    }

    return result;
};

const getInstalledPackageVersion = (packageName) => {
    try {
        return importCwd(`${packageName}/package.json`).version;
    } catch(e) {
        return null;
    }
};

const installThemeBuilder = async version => {
    if(getInstalledPackageVersion('devextreme-themebuilder') === version) {
        return;
    }

    await packageManager.installPackage(`devextreme-themebuilder@${version}`, {
        cwd: process.cwd(),
        stdio: 'inherit'
    }, {
        npm: ['--no-save', '--fund=false', '--package-lock=false', '--omit=dev', '--omit=optional']
    });
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
    const version = options.version || getInstalledPackageVersion('devextreme') || 'latest';
    const initialItems = options.items ? [...options.items] : [];

    options.reader = readFile;
    options.sassCompiler = scssCompilerDart;

    if(version === 'latest' || semver.gte(version, '22.1.3')) {
        options.sassCompiler = scssCompiler;
    }

    options.lessCompiler = require('less/lib/less-node');

    options.lessCompiler.options = options.lessCompiler.options || {};
    options.lessCompiler.options['math'] = 'always';
    options.lessCompiler.options['paths'] = [ path.join(themeBuilderPackagePath, 'data', 'less', 'bundles') ];

    if(options.assetsBasePath) {
        options.lessCompiler.options['rootpath'] = options.assetsBasePath;
    }

    await lock.acquire();

    try {
        console.log(`Using version ${version}.`);
        await installThemeBuilder(version);
    } catch(e) {
        console.log(`The devextreme-themebuilder npm package of v${version} was not installed. Please verify you are using v18.2.5 or higher and examine the installation error log to further troubleshoot the issue.`);
        lock.release();
        return;
    }

    const themeBuilder = importCwd('devextreme-themebuilder/modules/builder');
    const baseParameters = importCwd('devextreme-themebuilder/modules/base-parameters');

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
            const formatKey = options.fileFormat === 'scss' ?
                metadataKey.replace('@', '$') :
                metadataKey.replace('$', '@'); // lgtm[js/incomplete-sanitization]
            content += formatKey + ': ' + metadata[metadataKey] + ';\n';
        }
    } else if(options.command === commands.BUILD_META) {
        const metadata = getMeta(result.compiledMetadata, options.base, filter, baseParameters);

        const meta = {
            baseTheme: [ options.themeName, options.colorScheme.replace(/-/g, '.') ].join('.'),
            items: initialItems.filter(item => metadata[item.key]),
            version: result.version,
            removeExternalResources: !!options.removeExternalResources,
            outputColorScheme: options.outColorScheme,
            makeSwatch: !!options.makeSwatch,
            widgets: options.widgets
        };

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
    isThemeBuilderCommand,
    getInstalledPackageVersion
};
