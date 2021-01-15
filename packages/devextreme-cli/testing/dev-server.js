const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const kill = require('tree-kill-promise').kill;

const runCommand = require('../src/utility/run-command');
const { themes, swatchModes, baseFontFamily } = require('./constants');

module.exports = class DevServer {
    constructor(env) {
        this.env = env;
    }

    async start() {
        const command = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
        this.devServerProcess = spawn(command, this.env.npmArgs, { cwd: this.env.appPath });

        const logsDirPath = path.join(process.cwd(), './testing/sandbox/logs');
        fs.mkdirSync(logsDirPath, { recursive: true });

        const logFilePath = path.join(logsDirPath, `${this.env.engine}.log`);
        const logStream = fs.createWriteStream(logFilePath);

        this.devServerProcess.stdout.pipe(logStream);
        this.devServerProcess.stderr.pipe(logStream);

        await this.waitForCompilation();
    }

    async stop() {
        await kill(this.devServerProcess.pid, 'SIGKILL');

        return new Promise((resolve, reject) => {
            this.devServerProcess.on('exit', () => resolve());
        });
    }

    async setLayout(layout) {
        this.env.setLayout(layout);

        await this.waitForCompilation();
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

        await this.waitForCompilation();
        this.currentTheme = theme;
    }

    async waitForCompilation() {
        return new Promise((resolve, reject) => {
            function onData(data) {

                if(data.toString().toLowerCase().includes('compiled successfully')
                 || data.toString().toLowerCase().includes('compiled with warnings.')) {
                    this.devServerProcess.off('data', onData);
                    this.devServerProcess.off('exit', onError);
                    this.devServerProcess.off('error', onError);

                    resolve();
                }
            }
            onData = onData.bind(this);

            function onError(code) {
                this.devServerProcess.off('data', onData);
                this.devServerProcess.off('exit', onError);
                this.devServerProcess.off('error', onError);

                reject();
            }
            onError = onError.bind(this);

            this.devServerProcess.stdout.on('data', onData);
            this.devServerProcess.on('exit', onError);
            this.devServerProcess.on('error', onError);
        });
    }
};
