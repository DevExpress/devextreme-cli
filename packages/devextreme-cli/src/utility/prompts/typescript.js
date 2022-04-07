const prompts = require('./prompts');

const choices = [
    { value: 'typescript', title: 'TypeScript' },
    { value: 'javascript', title: 'JavaScript' }
];

const question = {
    message: 'Specify desired template type:',
    choices: choices
};

const getTypeTemplateInfo = async(defaultValue) => {
    return await prompts(question, choices, defaultValue);
};

module.exports = getTypeTemplateInfo;
