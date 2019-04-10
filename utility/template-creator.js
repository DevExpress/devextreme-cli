const path = require('path');
const extname = require('path').extname;
const stringUtils = require('./string');
const fs = require('fs');
const Mustache = require('mustache');

const applyTemplateToFile = (filePath, templateOptions) => {
    const tags = ['<%=', '%>'];
    const fileContent = fs.readFileSync(filePath);
    const content = Mustache.render(fileContent.toString(), templateOptions, {}, tags);

    return content;
};

const addPageToApp = (pageName, pathToPage, templatePagesPath) => {
    fs.readdirSync(templatePagesPath).forEach((pageItem) => {
        const templateOption = { pageName, title: stringUtils.humanize(pageName) };
        const content = applyTemplateToFile(path.join(templatePagesPath, pageItem), templateOption);
        fs.writeFileSync(path.join(pathToPage, `${pageName}${extname(pageItem)}`), content);
    });
};

const moveTemplateFilesToProject = (templateFolder, appPath, templateOptions, pathToFileRelativelyRoot) => {
    const relativePath = pathToFileRelativelyRoot || '';
    const pathToFiles = path.join(templateFolder, relativePath);

    fs.readdirSync(pathToFiles).forEach(file => {
        if(templateOptions.skipFolder !== file) {
            const pathToAppFile = path.join(appPath, relativePath, file);
            const nextFilePath = path.join(pathToFiles, file);

            if(fs.lstatSync(nextFilePath).isDirectory()) {
                if(!fs.existsSync(pathToAppFile)) {
                    fs.mkdirSync(pathToAppFile);
                }
                moveTemplateFilesToProject(templateFolder, appPath, templateOptions, path.join(relativePath, file));
            } else {
                const content = applyTemplateToFile(nextFilePath, templateOptions);
                fs.writeFileSync(pathToAppFile, content);
            }
        }
    });
};

module.exports = {
    moveTemplateFilesToProject,
    addPageToApp
};
