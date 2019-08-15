module.exports = {
    'setupFilesAfterEnv': [
        '<rootDir>/testing/jest-setup.js'
    ],
    'roots': [
        '<rootDir>/testing/__tests__'
    ],
    'testRegex': '(react)|(vue)',
    'maxConcurrency': 1
};
