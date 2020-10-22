const prompts = require('prompts');

const runPrompts = async(promptsValue, options) => {
    if(options) {
        return await new Promise((resolve, reject) => {
            resolve({
                layout: options
            });
        });
    }

    return await prompts(promptsValue);
};

module.exports = runPrompts;
