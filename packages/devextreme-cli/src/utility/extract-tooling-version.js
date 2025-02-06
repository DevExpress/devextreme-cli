const toolingVersionOptionName = 'tooling-version';
const defaultVersion = '5.0.1';

const extractToolingVersion = (commandOptions) => {
    if(commandOptions && commandOptions[toolingVersionOptionName]) {
        return `@${commandOptions[toolingVersionOptionName]}`;
    }
    return `@${defaultVersion}`;
};

module.exports = {
    toolingVersionOptionName,
    extractToolingVersion,
};
