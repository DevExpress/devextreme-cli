const puppeteer = require('puppeteer');

module.exports.getBrowser = () => {
    if(Boolean(process.env.LAUNCH_BROWSER)) {
        return puppeteer.launch({
            args: ['--no-sandbox'],
            dumpio: true
        });
    } else {
        return puppeteer.connect({
            browserURL: 'http://localhost:9222/json/protocol'
        });
    }
};
