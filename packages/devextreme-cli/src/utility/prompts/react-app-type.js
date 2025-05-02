const prompts = require('./prompts');

const choices = [
    { value: 'vite-app', title: 'React+Vite' },
    { value: 'nextjs-app', title: 'Next.js-based' }
];

const question = {
    message: 'Specify the desired React application type:',
    choices: choices
};

const getReactAppType = async(defaultValue) => {
    return await prompts(question, choices, defaultValue);
};

module.exports = getReactAppType;
