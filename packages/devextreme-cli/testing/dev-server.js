const fs = require('fs');
const path = require('path');
const WebServer = require('./web-server');

const webServer = new WebServer();
const runCommand = require('../src/utility/run-command');
const { themes, swatchModes, baseFontFamily } = require('./constants');

module.exports = class DevServer {
    constructor(env) {
        this.env = env;
    }

    async start() {
        await webServer.start(this.env.deployPath);
    }

    async stop() {
        await webServer.stop();
    }

    async build() {
        try {
            fs.mkdirSync(this.env.deployPath, { recursive: true });

            await runCommand('npm', this.env.npmArgs, {
                cwd: this.env.appPath,
                // https://github.com/facebook/create-react-app/issues/3657
                env: Object.assign(process.env, { CI: false })
            });
        } catch(e) {
            throw new Error(e);
        }
    }

    async setLayout(layout) {
        this.env.setLayout(layout);
    }

    async setTheme(theme) {
        if(this.currentTheme === theme) {
            return;
        }

        Object.keys(swatchModes).forEach((modeName) => {
            const mode = swatchModes[modeName];
            const themeFilePath = path.join(this.env.appPath, `/src/themes/metadata.${modeName}.json`);

            const data = fs.readFileSync(themeFilePath, 'utf8');
            const metadata = JSON.parse(data);

            const items = metadata.items
                ? metadata.items.filter(item => item.key !== baseFontFamily.key)
                : [];
            items.push(baseFontFamily);

            metadata.items = items;
            metadata.baseTheme = `${themes[theme]}.${mode}`;

            fs.writeFileSync(themeFilePath, `${JSON.stringify(metadata, null, '  ')}\n`, 'utf8');
        });

        await runCommand('node', [
            path.join(process.cwd(), 'index.js'),
            'build'
        ], {
            cwd: this.env.appPath,
            forceNoCmd: true
        });

        this.currentTheme = theme;
    }
};
