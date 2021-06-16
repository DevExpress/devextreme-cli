const prompts = require('prompts');

const runPrompts = async(questions, validateValue) => {
    if(validateValue) {
        const optionData = {
            [questions[0].name]: validateValue
        };
        return new Promise((resolve, reject) => {
            resolve(optionData);
        });
    }

    return await prompts(questions);
};

module.exports = runPrompts;
