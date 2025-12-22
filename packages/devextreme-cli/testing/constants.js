// NOTE: All puppeteer devices: https://github.com/GoogleChrome/puppeteer/blob/master/lib/DeviceDescriptors.js
const reactConfigs = require('./env.react');
const nextjsConfigs = require('./env.nextjs');

exports.envs = [
    require('./env.angular'),
    ...Object.values(reactConfigs),
    ...Object.values(nextjsConfigs),
    require('./env.vue-v3'),
];

exports.viewports = {
    large: {
        width: 1280,
        height: 1024,
    },
    small: {
        width: 667,
        height: 375,
        isMobile: true,
        hasTouch: true,
        isLandscape: true
    },
    xsmall: {
        width: 320,
        height: 568,
        isMobile: true,
        hasTouch: true,
    }
};

exports.themes = {
    // material: 'material.blue',
    // generic: 'generic',
    fluent: 'fluent.blue'
};

exports.layouts = [
    'side-nav-outer-toolbar',
    'side-nav-inner-toolbar'
];

exports.swatchModes = {
    base: 'light',
    additional: 'light'
};

exports.baseFontFamily = {
    key: '@base-font-family',
    value: '\'Helvetica Neue\', \'Segoe UI\', Helvetica, Verdana, sans-serif'
};
