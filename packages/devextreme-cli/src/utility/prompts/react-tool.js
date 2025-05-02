const prompts = require('./prompts');

const choices = [
    { value: 'vite', title: 'React+Vite' },
    { value: 'nextjs', title: 'Next.js-based' }
];

const question = {
    message: 'Specify the desired application type:',
    choices: choices
};

const getScaffoldToolInfo = async(defaultValue) => {
    return await prompts(question, choices, defaultValue);
};

module.exports = getScaffoldToolInfo;
