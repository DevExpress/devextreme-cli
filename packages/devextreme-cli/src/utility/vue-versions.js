const runPrompts = require('./prompts');
const layouts = [
    {
      title: 'Vue version 2 (Vue v2)',
      value: 'v2'
    },
    {
      title: 'Vue version 3 (Vue v3)',
      value: 'v3'
    }
];

const getVersionInfo = () => {
    const prompts = [
        {
            type: 'select',
            name: 'layout',
            message: 'What layout do you want to add?',
            choices: layouts
        }
    ];

    return runPrompts(prompts);
};

module.exports = {
    getVersionInfo
};
