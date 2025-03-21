const prompts = require('./prompts');

const choices = [
    { value: 'babel', title: 'Babel (default)' },
    { value: 'swc', title: 'SWC' }
];

const question = {
    message: 'Specify desired transpiler type:',
    choices: choices
};

const getTranspilerTypeInfo = async(defaultValue) => {
    return await prompts(question, choices, defaultValue);
};

module.exports = getTranspilerTypeInfo;
