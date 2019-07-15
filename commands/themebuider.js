const fs = require('fs');
const path = require('path');
const runCommand = require('../utility/run-command');
const lock = require('../utility/file-lock');

const commands = {
    BUILD_THEME: 'build-theme',
    BUILD_VARS: 'export-theme-vars',
    BUILD_META: 'export-theme-meta'
};

const scssCompiler = {
    render: (scss) => {
        return new Promise((resolve, reject) => {
            require('node-sass').render({
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
    if(!fileName) resolve();

    fs.readFile(fileName, (error, data) => {
        if(error) {
            console.error(`Unable to read the ${fileName} file.`);
        } else {
            const extension = path.extname(fileName);
            if(extension !== '.json') {
                options.data = data;
            } else {
                const inputObject = JSON.parse(data);
                Object.assign(options, inputObject);
            }
        }
        resolve();
    });
});

const getMeta = (fullMeta, base, filter, baseParametersList) => {
    let result = {};

    for(const key in fullMeta) {
        if(base && baseParametersList.indexOf(key) === -1) continue;
        if(filter && filter.length > 0 && filter.indexOf(key) === -1) continue;
        result[key] = fullMeta[key];
    }

    return result;
};

const installThemeBuilder = version => {
    const rootDir = path.join(__dirname, '..');
    const packageJsonPath = path.join(rootDir, 'node_modules', 'devextreme-themebuilder', 'package.json');

    if(fs.existsSync(packageJsonPath) && require(packageJsonPath).version === version) {
        return;
    }

    return runCommand('npm', [
        'install',
        '--no-save',
        `devextreme-themebuilder@${version}`
    ], {
        cwd: rootDir,
        stdio: 'ignore'
    });
};

const getDevExtremeVersion = () => {
    const installedDevExtremePackageJson = path.join(process.cwd(), 'node_modules', 'devextreme', 'package.json');
    if(fs.existsSync(installedDevExtremePackageJson)) {
        return require(installedDevExtremePackageJson).version;
    }
    return;
};

const runThemeBuilder = async rawOptions => {
    const options = camelize(rawOptions);

    await readInput(options);
    options.reader = readFile;
    options.sassCompiler = scssCompiler;
    options.lessCompiler = require('less/lib/less-node');

    options.lessCompiler.options = options.lessCompiler.options || {};
    options.lessCompiler.options['math'] = 'always';
    if(options.assetsBasePath) {
        options.lessCompiler.options['rootpath'] = options.assetsBasePath;
    }

    const version = options.version || getDevExtremeVersion() || 'latest';

    await lock.acquire();

    try {
        console.log(`The ${version} version is used.`);
        await installThemeBuilder(version);
    } catch(e) {
        console.log(`The devextreme-themebuilder npm package of v${version} was not installed. Please verify you are using v18.2.5 or higher and examine the installation error log to further troubleshoot the issue.`);
        return;
    }

    const themeBuilder = require('devextreme-themebuilder/modules/builder');
    const baseParameters = require('devextreme-themebuilder/modules/base-parameters');

    lock.release();

    const result = await themeBuilder.buildTheme(options);

    let content = '';
    const vars = options.vars || [];
    let filter = (vars instanceof Array) ? vars : vars.split(',');
    createPath(options.out);

    if(options.command === commands.BUILD_THEME) {
        content = result.css;
        if(result.swatchSelector) {
            console.log(`Add the '${result.swatchSelector}' class to the container to apply swatch styles to its nested elements.`);
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

        content = JSON.stringify({
            baseTheme: [ options.themeName, options.colorScheme.replace(/-/g, '.') ].join('.'),
            items: exportedMeta,
            version: result.version
        }, ' ', 4);
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
