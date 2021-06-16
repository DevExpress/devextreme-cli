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

    start() {
        fs.mkdirSync(this.env.deployPath, { recursive: true });

        const command = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';
        this.devServerProcess = spawn(command, ['http-server', this.env.deployPath, '-c-1']);

        // const command = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
        // this.devServerProcess = spawn(command, this.env.npmArgs, { cwd: this.env.appPath });

        // const logsDirPath = path.join(process.cwd(), './testing/sandbox/logs');
        // fs.mkdirSync(logsDirPath, { recursive: true });

        // const logFilePath = path.join(logsDirPath, `${this.env.engine}.log`);
        // const logStream = fs.createWriteStream(logFilePath);

        // this.devServerProcess.stdout.pipe(logStream);
        // this.devServerProcess.stderr.pipe(logStream);

        // await this.waitForCompilation();
    }

    async stop() {
        await kill(this.devServerProcess.pid, 'SIGKILL');

        return new Promise((resolve, reject) => {
            this.devServerProcess.on('exit', () => resolve());
        });
    }

    async build() {
        // TODO - we need to write logs to the './testing/sandbox/logs'
        try {
            await runCommand('npm', this.env.npmArgs, {
                cwd: this.env.appPath,
                env: Object.assign(process.env, { CI: false })
                // forceNoCmd: true,
                // silent: false
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
            forceNoCmd: true,
            silent: false
        });

        this.currentTheme = theme;
    }

    async waitForCompilation() {
        let successCount = 0;
        let timeoutId = null;
        const proxy = {};
        const setProxy = (resolve, reject) => {
            proxy.resolve = resolve;
            proxy.reject = reject;
        };

        const removeSubscriptions = () => {
            this.devServerProcess.stdout.off('data', onData);
            this.devServerProcess
                .off('exit', onError)
                .off('error', onError);
        };

        const setSubscriptions = () => {
            this.devServerProcess.stdout
                .off('data', onData)
                .on('data', onData);

            this.devServerProcess
                .off('exit', onError)
                .on('exit', onError)
                .off('error', onError)
                .on('error', onError);
        };

        const onData = (data) => {
            console.log('DATA', new Date().toISOString());
            const dataString = data.toString().toLowerCase();
            // dev server can recompile app several times during `devextreme build`
            const successMessagesCount = 5;
            const success = () => {
                successCount = 0;
                removeSubscriptions();
                proxy.resolve();
            };

            if(dataString.includes('compiled successfully')
                || dataString.includes('compiled with warnings.')) {
                    console.log('OKKKK', new Date().toISOString());
                successCount += 1;
                if(timeoutId) {
                    clearTimeout(timeoutId);
                }

                if(successCount >= successMessagesCount) {
                    success();
                } else {
                    timeoutId = setTimeout(success, 10000);
                }
            }
        };

        const onError = (code) => {
            removeSubscriptions();
            proxy.reject();
        };

        return new Promise((resolve, reject) => {
            setSubscriptions();
            setProxy(resolve, reject);
        });
    }
};
