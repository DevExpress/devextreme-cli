const runPrompts = require('./utility/prompts');
const layouts = [
    { value: 'side-nav-outer-toolbar', title: 'Side navigation (outer toolbar)' },
    { value: 'side-nav-inner-toolbar', title: 'Side navigation (inner toolbar)' }
];

const getValidLayoutName = (layoutName) => {
    if(!layoutName) {
        return;
    }

    const currentLayout = layouts.find((layout) => {
        return layoutName === layout.value;
    });

    return currentLayout && currentLayout.value;
};

const getLayout = (layoutName) => {
    const prompts = [
        {
            type: 'select',
            name: 'layout',
            message: 'What layout do you want to add?',
            choices: layouts
        }
    ];

    return runPrompts(prompts, getValidLayoutName(layoutName));
};

module.exports = {
    getLayout
};
