const puppeteer = require('puppeteer');
// NOTE: All puppeteer devices: https://github.com/GoogleChrome/puppeteer/blob/master/lib/DeviceDescriptors.js

exports.devices = [
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

exports.themes = {
    material: 'material.orange',
    generic: 'generic'
};

exports.layouts = ['side-nav-outer-toolbar', 'side-nav-inner-toolbar'];

exports.swatchModes = {
    base: 'light',
    additional: 'dark'
};

exports.baseFontFamily = {
    key: '@base-font-family',
    value: '\'Helvetica Neue\', \'Segoe UI\', Helvetica, Verdana, sans-serif'
};
