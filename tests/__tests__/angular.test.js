const prepareAngular = require('../prepare-angular');
const testAppTemplate = require('../app-template.test.js');
const options = {};

beforeAll(() => {
    return new Promise((resolve, reject) => {
        prepareAngular().then((path) => {
            options.appPath = path;
            resolve();
        }, (err) => {
            reject(err);
        });
    });
});

describe('angular app-template', () => {
    testAppTemplate(options);
});
