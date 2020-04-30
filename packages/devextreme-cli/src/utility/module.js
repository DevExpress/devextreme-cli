const fs = require('fs');

const findImportModule = (fileContent, moduleName) => {
    const regExprSearch = new RegExp(`}?\\s+from\\s+\\'?\\"?${moduleName}\\"?\\'?`);

    return fileContent.search(regExprSearch);
};

const addImportValueToExisting = (fileContent, importName, index) => {
    return `${fileContent.slice(0, index - 1)}, ${importName}${fileContent.slice(index - 1, fileContent.length)}`;
};

const insertImport = (filePath, moduleName, importName, isDefault) => {
    const fileContent = fs.readFileSync(filePath).toString();
    const indexEndOfImport = findImportModule(fileContent, moduleName);

    if(indexEndOfImport !== -1) {
        fs.writeFileSync(filePath, addImportValueToExisting(fileContent, importName, indexEndOfImport));
    } else if(importName) {
        const importValue = isDefault ? importName : `{ ${importName} }`;
        fs.writeFileSync(filePath, `import ${importValue} from \'${moduleName}\';\n${fileContent}`);
    } else {
        fs.writeFileSync(filePath, `import \'${moduleName}\';\n${fileContent}`);
    }
};

const insertExport = (filePath, exportName, modulePath) => {
    const fileContent = fs.readFileSync(filePath).toString();

    fs.writeFileSync(filePath, `${fileContent}export { default as ${exportName} } from \'${modulePath}\';\n`);
};

module.exports = {
    insertImport,
    insertExport
};
