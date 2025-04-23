const runCommand = require('../src/utility/run-command');

module.exports = class NextJsServer {
    constructor(env) {
        this.proc = null;
        this.env = env;
    }

    async start() {
        ({ proc: this.proc } = await runCommand('npm', ['run', 'start'], {
            cwd: this.env.appPath,
            detached: true
        }));
    }

    stop() {
        if(this.proc) {
            this.proc.kill('SIGTERM');
        }
    }
};

