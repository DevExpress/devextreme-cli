const puppeteer = require('puppeteer');

module.exports = [
    puppeteer.devices['iPhone 5'],
    puppeteer.devices['iPhone 6 landscape'],
    {
        name: 'Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
        viewport: {
            width: 1280,
            height: 1024,
            deviceScaleFactor: 1
        }
    }
];
