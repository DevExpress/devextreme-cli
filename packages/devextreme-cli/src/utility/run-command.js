const spawn = require('child_process').spawn;

const isWin = /^win/.test(process.platform);

module.exports = function(commandName, args = [], customConfig = {}) {
    const forceNoCmd = customConfig.forceNoCmd;
    const command = isWin && !forceNoCmd ? `${commandName}.cmd` : commandName;
    const config = {
        stdio: 'inherit',
        windowsVerbatimArguments: true,
        shell: isWin ? false : true
    };

    if(customConfig) {
        Object.assign(config, customConfig);
    }

    console.log(`> ${command} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
        spawn(command, args, config)
            .on('exit', (code) => code ? reject(code) : resolve());
    });
};
