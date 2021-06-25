const spawn = require('child_process').spawn;

module.exports = function(commandName, args = [], customConfig = {}) {
    const forceNoCmd = customConfig.forceNoCmd;
    const command = /^win/.test(process.platform) && !forceNoCmd ? `${commandName}.cmd` : commandName;
    const config = {
        // stdio: customConfig.silent ? 'ignore' : 'pipe',
        windowsVerbatimArguments: true
    };

    if(customConfig) {
        Object.assign(config, customConfig);
    }

    console.log(`> ${command} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
        const child = spawn(command, args, config);
        let out = '';

        if(child.stdout && child.stderr) {
            console.log('SET DATA PIPE');
            child.stdout.on('data', (data) => {out += data;console.log('STDOUT', data.toString());});
            child.stderr.on('data', (data) => {out += data;console.log('STDERR', data.toString());});
        }

        child.on('exit', (code) => code ? reject(code) : resolve(out));
    });
};
