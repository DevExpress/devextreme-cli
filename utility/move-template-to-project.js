const pathJoin = require('path').join;
const extname = require('path').extname
const fs = require('fs');
const Mustache = require('mustache');

const applyTemplateToFile = (filePath, templateOptions) => {
    const tags = ['<%=', '%>'];
    const fileContent = fs.readFileSync(filePath);
    const content = Mustache.render(fileContent.toString(), templateOptions, {}, tags);

    return content;
};

const addPageToProject = (pageName, pathToPage, templatePagesPath) => {
    fs.readdirSync(templatePagesPath).forEach((pageItem) => {
        const content = applyTemplateToFile(pathJoin(templatePagesPath, pageItem), { pageName });
        fs.writeFileSync(pathJoin(pathToPage, `${pageName}${extname(pageItem)}`), content);
    });
};

const moveTemplateFilesToProject = (templateFolder, appPath, templateOptions, pathToFileRelativelyRoot) => {
    const relativePath = pathToFileRelativelyRoot || '';
    const pathToFiles = pathJoin(templateFolder, relativePath);
    
    fs.readdirSync(pathToFiles).forEach(file => {
        if (templateOptions.skipFolder !== file) {
            const pathToAppFile = pathJoin(appPath, relativePath, file);
            const nextFilePath = pathJoin(pathToFiles, file);

            if (fs.lstatSync(nextFilePath).isDirectory()) {
                if (!fs.existsSync(pathToAppFile)) {
                    fs.mkdirSync(pathToAppFile);
                }
                moveTemplateFilesToProject(templateFolder, appPath, templateOptions, pathJoin(relativePath, file));
            } else {
                const content = applyTemplateToFile(nextFilePath, templateOptions);
                fs.writeFileSync(pathToAppFile, content);
            }
        }
    });
};

module.exports = {
    moveTemplateFilesToProject,
    addPageToProject
}
