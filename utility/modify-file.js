const path = require('path');
const fs = require('fs');

const addPageToRouting = (filePath, route) => {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContent = fs.readFileSync(fullPath).toString();
    const endOfLastElement = fileContent.match(/(\[)\s*({)/);
    let indexToInsert;
    if (!endOfLastElement.index) {
       console.error('No route found.');
    }
    indexToInsert = endOfLastElement.index + 1;
    const modifiedConten = fileContent.slice(0, indexToInsert) + route + fileContent.slice(indexToInsert, fileContent.length );
    
    fs.writeFileSync(fullPath, modifiedConten);
};

const insertExport = (filePath, exportName, modulePath, isDefault) => {
    const fileContent = fs.readFileSync(filePath).toString();
    let modifiedConten;

    if (isDefault) {
        modifiedConten = `${fileContent}export { default as ${exportName} } from \'${modulePath}\';\n`
    }

    fs.writeFileSync(filePath, modifiedConten);
};

const addNavigation = (filePath, navigation) => {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContent = fs.readFileSync(fullPath).toString();
    const endOfLastElement = fileContent.lastIndexOf('}');

    if (endOfLastElement === -1) {
       console.error('No navigation found.');
       process.exit();
    }
    const indexToInsert = endOfLastElement + 1;
    const modifiedConten = fileContent.slice(0, indexToInsert) + navigation + fileContent.slice(indexToInsert, fileContent.length );
    
    fs.writeFileSync(fullPath, modifiedConten);
};

const findModule = (fileContent, moduleName) => {
    const regExprSearch = new RegExp(`}?\\s+from\\s+\\'?\\"?${moduleName}\\"?\\'?`);
    
    return fileContent.search(regExprSearch);
};

const insertImport = (filePath, importName, moduleName, isDefault) => {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContent = fs.readFileSync(fullPath).toString();
    const searchResult = findModule(fileContent, moduleName);
    let modifiedConten = '';

    if (searchResult !== -1) {
        modifiedConten = `${fileContent.slice(0, searchResult -1)}, ${importName}${fileContent.slice(searchResult -1, fileContent.length)}`;
    } else {
        if (isDefault) {
            modifiedConten = `import ${importName} from \'${moduleName}\'\n${fileContent}`;
        } else {
            modifiedConten = `import {${importName}} from \'${moduleName}\'\n${fileContent}`;
        }
    }

    fs.writeFileSync(fullPath, modifiedConten);
};

module.exports = {
    addPageToRouting,
    addNavigation,
    insertImport,
    insertExport
};