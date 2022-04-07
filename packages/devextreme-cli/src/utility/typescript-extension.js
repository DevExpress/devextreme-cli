const devextremeConfigUtils = require('./devextreme-config');

const isTypeScript = (templateType) => templateType === 'typescript';

const getFileExtension = (isTypeScript) => isTypeScript ? 'ts' : 'js';

const getTemplateType = (engine) => {
    const devextremeConfig = devextremeConfigUtils.read();
    return devextremeConfig[engine]
        ? devextremeConfig[engine].template
        : 'javascript';
};

module.exports = {
    isTypeScript,
    getFileExtension,
    getTemplateType
};
