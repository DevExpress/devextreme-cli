const runPrompts = require('../utility/prompts');

const getLayoutFromOptions = (options, layouts) => {
    if(!options.layout) {
        return;
    }

    const currentLayout = layouts.filter((layout) => {
        const layoutName = layout.fullName || layout.value;
        return layoutName === options.layout;
    });

    return currentLayout.length ? [currentLayout[0].value] : undefined;
};

const getLayout = (layouts, options) => {
    const prompts = [
        {
            type: 'select',
            name: 'layout',
            message: 'What layout do you want to add?',
            choices: layouts
        }
    ];

    return runPrompts(prompts, getLayoutFromOptions(options, layouts));
};

module.exports = {
    getLayout
};
