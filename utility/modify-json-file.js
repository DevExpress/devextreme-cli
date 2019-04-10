const fs = require('fs');

const readJSONFile = (path) => {
    return JSON.parse(fs.readFileSync(path));
};

const writeJSONFile = (path, content) => {
    fs.writeFileSync(path, JSON.stringify(content, null, 2));
};

module.exports = (path, callback) => {
    let fileContent = readJSONFile(path);

    fileContent = callback(fileContent);
    writeJSONFile(path, fileContent);
};
