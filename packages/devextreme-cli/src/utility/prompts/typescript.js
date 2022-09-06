const prompts = require('./prompts');

const choices = [
    { value: 'typescript', title: 'TypeScript' },
    { value: 'javascript', title: 'JavaScript' }
];

const question = {
    message: 'Specify desired template type:',
    choices: choices
};

const getTemplateTypeInfo = async(defaultValue) => {
    return await prompts(question, choices, defaultValue);
};

module.exports = getTemplateTypeInfo;
