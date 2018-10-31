const spawn = require('child_process').spawn;

module.exports = function(packageManagerName, args, customConfig) {
    const command = /^win/.test(process.platform) ? `${packageManagerName}.cmd` : packageManagerName;
    const config = {
        stdio: 'inherit',
        windowsVerbatimArguments: true
    };

    if(customConfig) {
        Object.assign(config, customConfig);
    }

    console.log(`> ${command} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
        spawn(command, args, config).on('exit', (code) => {
            if(code) {
                reject(code);
            } else {
                resolve();
            }
        });
    });
};
