const prompts = require('prompts');

const runPrompts = async(promptsValue, options) => {
    if(options) {
        prompts.inject([options]);
    }

    return await prompts(promptsValue);
};

module.exports = runPrompts;
