const fs = require('fs');
const WebServer = require('./web-server');
const NextJsServer = require('./nextjs-server');

const runCommand = require('../src/utility/run-command');

module.exports = class DevServer {
    constructor(env, { port }) {
        this.env = env;
        this.server = this.env.engine.startsWith('nextjs')
            ? new NextJsServer(this.env, { port })
            : new WebServer();
    }

    async start() {
        await this.server.start(this.env.deployPath);
    }

    async stop() {
        await this.server.stop();
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
};
