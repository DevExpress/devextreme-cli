const runCommand = require('../src/utility/run-command');

module.exports = class NextJsServer {
    constructor(env, { port } = { port: 8080 }) {
        this.proc = null;
        this.env = env;
        this.port = port;
    }

    async start() {
        ({ proc: this.proc } = await runCommand('npx', ['next', 'start', `-p ${this.port}`], {
            cwd: this.env.appPath,
            detached: true,
            shell: false,
            stdio: 'ignore',
        }));
    }

    async stop() {
        if(this.proc) {
            process.kill(-this.proc.pid, 'SIGKILL');
        }
    }
};

