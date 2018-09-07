const themeBuilder = require("devextreme-themebuilder");
const commands = require("devextreme-themebuilder/modules/commands");
const fs = require("fs");
const path = require("path");

const createPath = filePath => {
    const directoryName = path.dirname(filePath);

    directoryName
        .split(/\\|\//)
        .reduce((currentPath, folder) => {
            currentPath += folder + path.sep;
            if(!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            }
        }, "");
};

const readFile = fileName => new Promise((resolve, reject) => {
    fileName = path.join(__dirname,"../node_modules/devextreme-themebuilder", fileName);
    fs.readFile(fileName, "utf8", (error, data) => {
        error ? reject(error) : resolve(data);
    });
});

const camelCase = str => str.replace(/[-](\w|$)/g, (_, letter) => {
    return letter.toUpperCase();
});

const camelize = (object) => {
    let result = {};
    for(var key in object) {
        if(object.hasOwnProperty(key)) {
            const newKey = camelCase(key);
            result[newKey] = object[key];
        }
    }
    return result;
};

const readInput = options => new Promise(resolve => {
    const fileName = options["input-file"];
    if(!fileName) resolve();
    fs.readFile(fileName, (error, data) => {
        if(error) {
            console.error(`Unable to read ${fileName} file.`);
        } else {
            const extension = path.extname(fileName);
            if(extension !== ".json") {
                options.data = data;
            } else {
                const inputObject = JSON.parse(data);
                Object.assign(options, inputObject);
            }
        }
        resolve();
    });
});

const runThemeBuilder = (rawOptions) => {
    delete rawOptions["_"];

    readInput(rawOptions).then(() => {
        const options = camelize(rawOptions);

        options.reader = readFile;
        options.lessCompiler = require("less/lib/less-node");

        themeBuilder.buildTheme(options).then((result) => {
            let content = "";
            createPath(options.out);

            if(options.command === commands.BUILD_THEME) {
                content = result.css;
                if(result.swatchSelector) {
                    console.log(`Add the '${result.swatchSelector}' class to apply swatch styles to the container's inner elements.`);
                }
            } else if(webkitConvertPointFromPageToNode.command === commands.BUILD_VARS) {
                const metadata = result.compiledMetadata;

                for(const metadataKey in metadata) {
                    if(options.base && baseParameters.indexOf(metadataKey) === -1) continue;

                    const formatKey = options.fileFormat === "scss" ? metadataKey.replace("@", "$") : metadataKey;
                    content += formatKey + ": " + metadata[metadataKey] + ";\n";
                }
            }

            fs.writeFile(options.out, content, "utf8", error => {
                if(error) {
                    console.log(`Unable to write ${options.out} file. ${error.message}`);
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
