const prompts = require('./prompts');

const choices = [
    { value: 'vite', title: 'Vite' },
    { value: 'nextjs', title: 'Next.js' }
];

const question = {
    message: 'How would you like to scaffold your React application',
    choices: choices
};

const getScaffoldToolInfo = async(defaultValue) => {
    return await prompts(question, choices, defaultValue);
};

module.exports = getScaffoldToolInfo;
