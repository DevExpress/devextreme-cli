const prompts = require('prompts');

const runPrompts = async(promptsValue, options) => {
    const validatedValue = options;

    return validatedValue !== undefined
        ? validatedValue
        : await prompts(promptsValue);
};

module.exports = runPrompts;
