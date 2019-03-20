const pathJoin = require('path').join;
const dirname = require('path').dirname;
const fs = require('fs-extra');
const Mustache = require('mustache');

const getTemplateFiles = (ownPath, directory, fileList) => {
    fileList = fileList || [];

    fs.readdirSync(ownPath).forEach(file => {
        const path = pathJoin(ownPath, file);
        if (fs.lstatSync(path).isDirectory()) {
            fileList.concat(getTemplateFiles(path, pathJoin(directory || './', file), fileList));
        } else {           
            fileList.push(pathJoin(directory  || './', file));
        }
    });
    return fileList;
};

const applyTemplateToFile = (filePath, templateOptions) => {
    const tags = ['<%=', '%>'];
    const fileContent = fs.readFileSync(filePath);
    const content = Mustache.render(fileContent.toString(), templateOptions, {}, tags);

    return content;
};

const isExists = (appPath, file) => {
    return fs.existsSync(pathJoin(appPath, file));
};

const getComponentName = (appPath, file) => {
    let name = '';
    const index = 1;
    if (!isExists(appPath, file)) {
        name = file;
    }

    while (!name) {
        const fileNameDetails = file.match(/(.+?)(\.[^.]*$|$)/);
        const componentName = `${fileNameDetails[1]}${index}${fileNameDetails[2]}`;
        if (!isExists(appPath, componentName)) {
            name = componentName;
        }
    }

    return name;
};

const moveTemplate = (ownPath, appPath, options, modifyContent) =>{ 
    return new Promise((resolve, reject) => {
        getTemplateFiles(ownPath).forEach((file) => {
            const content = applyTemplateToFile(pathJoin(ownPath, file), options);
            let modifiedContent;

            if (!isExists(appPath, file)) {
                const directory = dirname(pathJoin(appPath, file));
                if (!fs.existsSync(directory)) {
                    fs.mkdirsSync(directory);
                }

                fs.writeFileSync(pathJoin(appPath, file), content);
            }

            const currentContent = fs.readFileSync(pathJoin(appPath, file)).toString();

            if (options.resolveConflicts === 'createNew' && options.resolveConflictsOptions) {
                if (resolveConflictOptions === file) {
                    file = getComponentName(appPath, options.resolveConflictOptions);
                }
            }

            if (modifyContent) {
                modifiedContent = modifyContent(content, currentContent, file);
              }

            fs.writeFileSync(pathJoin(appPath, file), modifiedContent);
        });

        resolve();
       
    });
};

module.exports = {
    moveTemplate
}
