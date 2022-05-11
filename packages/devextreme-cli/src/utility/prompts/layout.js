const prompts = require('./prompts');

const choices = [
    { value: 'side-nav-outer-toolbar', title: 'Side navigation (outer toolbar)' },
    { value: 'side-nav-inner-toolbar', title: 'Side navigation (inner toolbar)' }
];

const question = {
    message: 'Specify desired application layout:',
    choices: choices
};

const getLayoutInfo = async(defaultValue) => {
    return await prompts(question, choices, defaultValue);
};

module.exports = getLayoutInfo;
