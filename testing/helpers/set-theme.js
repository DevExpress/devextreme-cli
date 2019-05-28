const fs = require('fs');
const path = require('path');

const runCommand = require('../../utility/run-command');

const themes = {
    material: 'material.orange',
    generic: 'generic'
};

const modes = {
    base: 'light',
    additional: 'dark'
};

module.exports = async(theme, engine) => {
    const appPath = path.join(process.cwd(), `./testing/sandbox/${engine}/my-app/`);
    Object.keys(modes).forEach((modeName) => {
        const mode = modes[modeName];
        const themeFilePath = path.join(appPath, `/src/themes/metadata.${modeName}.json`);
        const regexToFind = /"baseTheme": "[\w\.]+"/g;
        const newSubStr = `"baseTheme": "${themes[theme]}.${mode}"`;
        const data = fs.readFileSync(themeFilePath, 'utf8');
        const result = data.replace(regexToFind, newSubStr);
        fs.writeFileSync(themeFilePath, result, 'utf8');
    });

    await runCommand('node', [
        '../../../../index.js',
        'build'
    ], {
        cwd: appPath,
        forceNoCmd: true,
        silent: true
    });
};
