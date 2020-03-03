const prompts = require('prompts');

const runPrompts = async(options, promptsValue, getOptionsValue) => {
    const optionsValue = getOptionsValue(options);

    if(optionsValue) {
        prompts.inject(optionsValue);
    }

    return await prompts(promptsValue);
};

module.exports = runPrompts;
