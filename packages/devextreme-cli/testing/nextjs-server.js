const runCommand = require('../src/utility/run-command');

module.exports = class NextJsServer {
    constructor(env) {
        this.proc = null;
        this.env = env;
    }

    async start() {
        ({ proc: this.proc } = await runCommand('npm', ['run', 'start'], {
            cwd: this.env.appPath,
            detached: true,
            // https://github.com/facebook/create-react-app/issues/3657
            env: Object.assign(process.env, { CI: false })
        }));

        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    stop() {
        if(this.proc) {
            this.proc.kill('SIGTERM');
        }
    }
};

