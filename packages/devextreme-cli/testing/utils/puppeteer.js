const puppeteer = require('puppeteer');

module.exports.getBrowser = () => {
    if(Boolean(process.env.LAUNCH_BROWSER)) {
        return puppeteer.launch({
            headless: 'new',
            executablePath: process.env.CHROME_PATH,
            defaultViewport: null,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    } else {
        return puppeteer.connect({
            defaultViewport: null,
            browserURL: 'http://localhost:9222/json/protocol'
        });
    }
};
