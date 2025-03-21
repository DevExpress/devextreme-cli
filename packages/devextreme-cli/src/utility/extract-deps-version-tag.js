const depsVersionTagOptionName = 'deps-version-tag';

const extractDepsVersionTag = (commandOptions) => {
    if(commandOptions && commandOptions[depsVersionTagOptionName]) {
        return commandOptions[depsVersionTagOptionName];
    }
    return '';
};

module.exports = {
    depsVersionTagOptionName,
    extractDepsVersionTag,
};
