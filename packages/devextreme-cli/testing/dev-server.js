const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');
const kill = require('tree-kill-promise').kill;

const runCommand = require('../src/utility/run-command');
const { themes, swatchModes, baseFontFamily } = require('./constants');

module.exports = class DevServer {
    constructor(env, appUrl) {
        this.env = env;
        this.appUrl = appUrl;
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

        function onError() {
          throw new Error('Compilation failed');
        }

        this.devServerProcess.on('exit', onError);
        this.devServerProcess.on('error', onError);

        await this.waitForCompilation();
    }

    async waitForCompilation() {
      let statusCode = 0;
      while (statusCode === 0) {
        await new Promise((ok) => setTimeout(ok, 1000));
        await new Promise((ok) => {
            const r = http.get(this.appUrl, function(res) {
              statusCode = res.statusCode;
              ok();
            });

            r.on('error', ok);
        })
      }
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
            silent: true
        });

        await this.waitForCompilation();
        this.currentTheme = theme;
    }
};
