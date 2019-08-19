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
        const data = fs.readFileSync(themeFilePath, 'utf8');
        const metadata = JSON.parse(data);
        metadata.baseTheme = `${themes[theme]}.${mode}`;
        metadata.items = [
            {
                key: '@base-font-family',
                value: '\'Helvetica Neue\', \'Segoe UI\', Helvetica, Verdana, sans-serif'
            }
        ];
        fs.writeFileSync(themeFilePath, JSON.stringify(metadata), 'utf8');
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
