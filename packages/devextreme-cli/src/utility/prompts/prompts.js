const prompts = require('prompts');

const runPrompts = async(questions, validateValue) => {
    if(validateValue) {
        return new Promise((resolve, reject) => {
            resolve({
                value: validateValue
            });
        });
    }

    return await prompts(questions);
};

module.exports = runPrompts;
