const prompts = require('./prompts');

const choices = [
    { value: 'vite-app', title: 'React+Vite' },
    { value: 'nextjs-app', title: 'Next.js-based' }
];

const question = {
    message: 'Specify the desired application type:',
    choices: choices
};

const getScaffoldToolInfo = async(defaultValue) => {
    return await prompts(question, choices, defaultValue);
};

module.exports = getScaffoldToolInfo;
