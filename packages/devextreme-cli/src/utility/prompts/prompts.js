const prompts = require('prompts');

const run = async(question, choices, defaultValue) => {
    question = Object.assign({}, question, {
        type: 'select',
        name: 'answer',
    });

    const { answer } = await askQuestion(question, getDefaultValue(choices, defaultValue));

    return answer;
};

const askQuestion = async(question, validateValue) => {
    if(validateValue) {
        return {
            answer: validateValue
        };
    }

    return await prompts(question);
};

const getDefaultValue = (choices, answer) => {
    if(!answer || !choices.some((choice) => answer === choice.value)) {
        return;
    }

    return answer;
};

module.exports = run;
