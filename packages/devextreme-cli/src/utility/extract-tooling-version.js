const toolingVersionOptionName = 'tooling-version';

const extractToolingVersion = (commandOptions) => {
    if(commandOptions && commandOptions[toolingVersionOptionName]) {
        return `@${commandOptions[toolingVersionOptionName]}`;
    }
    return '';
};

module.exports = {
    toolingVersionOptionName,
    extractToolingVersion,
};
