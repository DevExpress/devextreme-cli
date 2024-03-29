const puppeteer = require('puppeteer');

puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--remote-debugging-port=9222',
        '--remote-debugging-address=0.0.0.0',
    ]
});
