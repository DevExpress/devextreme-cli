// NOTE: All puppeteer devices: https://github.com/GoogleChrome/puppeteer/blob/master/lib/DeviceDescriptors.js

exports.envs = [
    require('./env.angular'),
    require('./env.react'),
    // require('./env.vue-v2'),
    require('./env.vue-v3')
];

exports.viewports = {
    xsmall: {
        width: 320,
        height: 568,
        isMobile: true,
        hasTouch: true,
    },
    small: {
        width: 667,
        height: 375,
        isMobile: true,
        hasTouch: true,
        isLandscape: true
    },
    large: {
        width: 1280,
        height: 1024,
    }
};

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
