const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const kill = require('tree-kill-promise');

const runCommand = require('../src/utility/run-command');
const { themes, swatchModes, baseFontFamily } = require('./constants');
const logsDirPath = path.join(process.cwd(), 'testing', 'sandbox', 'logs');

module.exports = class DevServer {
    constructor(env) {
        this.env = env;
    }

    async start() {
        fs.mkdirSync(this.env.deployPath, { recursive: true });
        fs.mkdirSync(logsDirPath, { recursive: true });

        const command = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';
        console.log(command,
            'http-server',
            this.env.deployPath,
            '-c-1',
            '>>',
            path.join(logsDirPath, 'http-server.log'));
        this.devServerProcess = spawn(command, [
            'http-server',
            this.env.deployPath,
            '-c-1',
            '>>',
            path.join(logsDirPath, 'http-server.log')
        ]);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('server exit code', this.devServerProcess.exitCode);
                if(this.devServerProcess.exitCode === null) resolve();
                else reject('http-server fail to start');
            }, 1000);
        });
    }

    async stop() {
        return new Promise(async(resolve, reject) => {
            this.devServerProcess.on('exit', () => resolve());
            await kill(this.devServerProcess.pid, 'SIGKILL');
        });
    }

    async build() {
        try {
            const output = await runCommand('npm', this.env.npmArgs, {
                cwd: this.env.appPath,
                // https://github.com/facebook/create-react-app/issues/3657
                env: Object.assign(process.env, { CI: false })
            });

            fs.mkdirSync(logsDirPath, { recursive: true });

            const logFilePath = path.join(logsDirPath, `${this.env.engine}.log`);
            fs.writeFileSync(logFilePath, output, { flag: 'a' });
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
            forceNoCmd: true,
            silent: false
        });

        this.currentTheme = theme;
    }
};
