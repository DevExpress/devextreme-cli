const pathJoin = require('path').join;
const extname = require('path').extname
const dirname = require('path').dirname;
const fs = require('fs');
const Mustache = require('mustache');

const getTemplateFiles = (ownPath, directory, fileList, options) => {
    fs.readdirSync(ownPath).forEach(file => {
        const isSkip = options && options.skipFolder === file;
        if (!isSkip) {
            const path = pathJoin(ownPath, file);
            if (fs.lstatSync(path).isDirectory()) {
                fileList.concat(getTemplateFiles(path, pathJoin(directory || './', file), fileList, options));
            } else {           
                fileList.push(pathJoin(directory  || './', file));
            }
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

const addPageToProject = (pageName, path, templateOptions) => {
    const pagePath = pathJoin(path, pageName);
    const templatePagesPath = pathJoin(__dirname, '..', 'templates', 'pages');
    if (fs.existsSync(pagePath)) {
        console.error('The page exists');
        process.exit();
    }

    fs.mkdirSync(pagePath, { recursive: true });

    console.log(getTemplateFiles(templatePagesPath, './', []));
    getTemplateFiles(templatePagesPath, './', []).forEach((file) => {
        const content = applyTemplateToFile(pathJoin(templatePagesPath, file), templateOptions);
        console.log(content);
        fs.writeFileSync(pathJoin(pagePath, `${pageName}${extname(file)}`), content);
    });
};

const moveTemplateToProject = (ownPath, appPath, options) => { 
    return new Promise((resolve, reject) => {
        getTemplateFiles(ownPath, './', [], options).forEach((file) => {
            const content = applyTemplateToFile(pathJoin(ownPath, file), options);
            const filePath = pathJoin(appPath, file);
            const directory = dirname(filePath);
            
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            fs.writeFileSync(filePath, content);
        });

        resolve();
    });
};

module.exports = {
    moveTemplateToProject,
    addPageToProject
}
