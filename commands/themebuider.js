const themeBuilder = require('devextreme-themebuilder');
const commands = require('devextreme-themebuilder/modules/commands');
const baseParameters = require('devextreme-themebuilder/modules/base-parameters');
const fs = require('fs');
const path = require('path');

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

const getMeta = (fullMeta, base, filter) => {
    let result = {};

    for(const key in fullMeta) {
        if(base && baseParameters.indexOf(key) === -1) continue;
        if(filter && filter.length > 0 && filter.indexOf(key) === -1) continue;
        result[key] = fullMeta[key];
    }

    return result;
};

const runThemeBuilder = (rawOptions) => {
    const options = camelize(rawOptions);

    readInput(options).then(() => {
        options.reader = readFile;
        options.sassCompiler = scssCompiler;
        options.lessCompiler = require('less/lib/less-node');

        if(options.assetsBasePath) {
            options.lessCompiler.options = options.lessCompiler.options || {};
            options.lessCompiler.options['rootpath'] = options.assetsBasePath;
        }

        themeBuilder.buildTheme(options).then((result) => {
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
                const metadata = getMeta(result.compiledMetadata, options.base, filter);

                for(const metadataKey in metadata) {
                    const formatKey = options.fileFormat === 'scss' ? metadataKey.replace('@', '$') : metadataKey;
                    content += formatKey + ': ' + metadata[metadataKey] + ';\n';
                }
            } else if(options.command === commands.BUILD_META) {
                const metadata = getMeta(result.compiledMetadata, options.base, filter);
                let exportedMeta = [];

                for(const metadataKey in metadata) {
                    exportedMeta.push({ key: metadataKey, value: metadata[metadataKey] });
                }

                content = JSON.stringify({
                    baseTheme: [ options.themeName, options.colorScheme.replace('-', '.') ].join('.'),
                    items: exportedMeta
                }, ' ', 4);
            }

            fs.writeFile(options.out, content, 'utf8', error => {
                if(error) {
                    console.log(`Unable to write the ${options.out} file. ${error.message}`);
                } else {
                    console.log(`The result was written to the ${options.out} file.`);
                }
            });
        });
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
