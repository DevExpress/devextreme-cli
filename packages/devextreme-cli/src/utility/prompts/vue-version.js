const runPrompts = require('./prompts');
const versions = [
    { value: 'v2', title: 'Vue version (v2)' },
    { value: 'v3', title: 'Vue version (v3)' }
];

const getValidVersion = (versionValue) => {
    if(!versionValue || !versions.some((version) => `v${versionValue}` === version.value)) {
        return;
    }
    return `v${versionValue}`;
};

const getVersionInfo = (versionValue) => {
    const questions = [
        {
            type: 'select',
            name: 'version',
            message: 'What version do you want?',
            choices: versions
        }
    ];

    return runPrompts(questions, getValidVersion(versionValue));
};

module.exports = {
    getVersionInfo
};
