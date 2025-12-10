const spawn = require('child_process').spawn;

const isWin = /^win/.test(process.platform);

module.exports = function(commandName, args = [], customConfig = {}) {
    const forceNoCmd = customConfig.forceNoCmd;
    const command = isWin && !forceNoCmd ? `${commandName}.cmd` : commandName;
    const config = {
        stdio: 'inherit',
        windowsVerbatimArguments: true,
        shell: true,
    };

    if(customConfig) {
        Object.assign(config, customConfig);
    }

    console.log(`> ${command} ${args.join(' ')}`);

    const proc = spawn(`${command} ${args.join(' ')}`, config);

    return new Promise((resolve, reject) => {
        proc.on('exit', (code) => {
            code ? reject(code) : resolve({ proc });
        });

        if(config.detached) {
            proc.unref();
            resolve({ proc });
        }
    });
};
