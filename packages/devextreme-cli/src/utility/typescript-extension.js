const path = require('path');
const devextremeConfigUtils = require('./devextreme-config');

const isTypeScript = (templateType) => templateType === 'typescript';

const setFileExtension = (filePath, isTypeScript) => {
    const { dir, name } = path.parse(filePath);
    const ext = '.' + (isTypeScript ? 'tsx' : 'js');

    return path.join(dir, name + ext);
};

const getTemplateType = (engine) => {
    const devextremeConfig = devextremeConfigUtils.read();
    return devextremeConfig[engine]
        ? devextremeConfig[engine].template
        : 'javascript';
};

module.exports = {
    isTypeScript,
    setFileExtension,
    getTemplateType
};
