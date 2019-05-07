module.exports = {
    'setupFilesAfterEnv': [
        '<rootDir>/tests/jest-setup.js'
    ],
    'roots': [
        '<rootDir>/tests/__tests__'
    ],
    'setTimeout': 999999,
    'maxConcurrency': 1,
    'verbose': true
};
