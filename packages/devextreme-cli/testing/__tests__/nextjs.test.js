const { nextjsJs } = require('../env.nextjs');
const testAppTemplate = require('../app-template.test.shared.js');
testAppTemplate(nextjsJs, {
    port: 3000,
    urls: {
        profile: 'pages/profile',
        tasks: 'pages/tasks',
        page: 'pages/new-page',
        'change-password': 'auth/change-password',
    },
});
