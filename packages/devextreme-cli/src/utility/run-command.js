const spawn = require('child_process').spawn;

module.exports = function(commandName, args = [], customConfig = {}) {
    const forceNoCmd = customConfig.forceNoCmd;
    const command = /^win/.test(process.platform) && !forceNoCmd ? `${commandName}.cmd` : commandName;
    const config = {
        stdio: customConfig.silent ? 'ignore' : 'pipe',
        windowsVerbatimArguments: true
    };

    if(customConfig) {
        Object.assign(config, customConfig);
    }

    console.log(`> ${command} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
        const child = spawn(command, args, config);

        let out = '';

        if(child.stdout !== null && child.stderr !== null) {
            child.stdout.on('data', (data) => out += data);
            child.stderr.on('data', (data) => out += data);
        }

        child.on('exit', (code) => code ? reject(code) : resolve(out));
    });
};
