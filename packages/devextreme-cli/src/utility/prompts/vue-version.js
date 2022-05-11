const prompts = require('./prompts');

const choices = [
    { value: 'v2', title: 'Vue version (v2)' },
    { value: 'v3', title: 'Vue version (v3)' }
];

const question = {
    message: 'What version do you want?',
    choices: choices
};

const getVersionInfo = async(defaultValue) => {
    return await prompts(question, choices, `v${defaultValue}`);
};

module.exports = getVersionInfo;
