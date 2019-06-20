const spawn = require('child_process').spawn;

module.exports = function(commandName, args = [], customConfig = {}) {
    const forceNoCmd = customConfig.forceNoCmd;
    const command = /^win/.test(process.platform) && !forceNoCmd ? `${commandName}.cmd` : commandName;
    const config = {
        stdio: customConfig.silent ? 'ignore' : 'inherit',
        windowsVerbatimArguments: true
    };

    if(customConfig) {
        Object.assign(config, customConfig);
    }

    console.log(`> ${command} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
        spawn(command, args, config).on('exit', (code) => {
            code ? reject(code) : resolve();
        });
    });
};
