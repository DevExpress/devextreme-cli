const runPrompts = require('../utility/prompts');

const getValidLayoutName = (layoutsList, layoutName) => {
    if(!layoutName) {
        return;
    }

    const currentLayout = layoutsList.find((layout) => {
        const name = layout.fullName || layout.value;
        return name === layoutName;
    });

    return currentLayout && currentLayout.value;
};

const getLayout = (layoutsList, layoutName) => {
    const prompts = [
        {
            type: 'select',
            name: 'layout',
            message: 'What layout do you want to add?',
            choices: layoutsList
        }
    ];

    return runPrompts(prompts, getValidLayoutName(layoutsList, layoutName));
};

module.exports = {
    getLayout
};
