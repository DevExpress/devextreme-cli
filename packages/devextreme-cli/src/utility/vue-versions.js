const prompts = require('./prompts');
const layouts = [
    { title: 'Vue version 2 (Vue v2)', value: 'v2' },
    { title: 'Vue version 3 (Vue v3)', value: 'v3' }
];

const getValidVersion = (version) => {
    if(!version || !layouts.some((layout) => `v${version}` === layout.value)) {
        return;
    }
    return `v${version}`;
};

const getVersionInfo = (version) => {
    const question = [
        {
            type: 'select',
            name: 'layout',
            message: 'What layout do you want to add?',
            choices: layouts
        }
    ];

    return prompts(question, getValidVersion(version));
};

module.exports = {
    getVersionInfo
};
