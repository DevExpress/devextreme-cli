const runPrompts = require('./prompts');
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
    const questions = [
        {
            type: 'select',
            name: 'layout',
            message: 'Specify desired application layout:',
            choices: layouts
        }
    ];

    return runPrompts(questions, getValidLayoutName(layoutName));
};

module.exports = {
    getLayoutInfo
};
