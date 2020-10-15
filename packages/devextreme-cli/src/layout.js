const prompts = require('./prompts');
const layouts = [
    { value: 'side-nav-outer-toolbar', title: 'Side navigation (outer toolbar)' },
    { value: 'side-nav-inner-toolbar', title: 'Side navigation (inner toolbar)' }
];

const getValidLayoutName = (layoutName) => {
    if(!layoutName || !layouts.some((layout) => layoutName === layout.value)) {
        return;
    }
    return layoutName;
};

const getLayoutInfo = (layoutName) => {
    const question = [
        {
            type: 'select',
            name: 'layout',
            message: 'What layout do you want to add?',
            choices: layouts
        }
    ];

    return prompts(question, getValidLayoutName(layoutName));
};

module.exports = {
    getLayoutInfo
};
