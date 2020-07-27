const fs = require('fs');

const isEmptyRouting = (content) => {
    return /\[\s*\]/.test(content);
};

const getPositionIndex = (content) => {
    const edgeIndex = content.search(/\n(\s+)?\][^\]]*$/);

    if(edgeIndex === -1) {
        console.error('No route found.');
        process.exit();
    }
    return edgeIndex;
};

const addSeparatorToValue = (insertValue, isEmpty) => {
    const separator = isEmpty ? '' : ', ';

    return `${separator}${insertValue}`;
};

const insertToContent = (content, position, insertValue) => {
    return `${content.slice(0, position)}${insertValue}${content.slice(position, content.length)}`;
};

const insertItemToArray = (filePath, insertValue) => {
    const content = fs.readFileSync(filePath).toString();
    const isEmpty = isEmptyRouting(content);
    const position = getPositionIndex(content);

    fs.writeFileSync(filePath, insertToContent(content, position, addSeparatorToValue(insertValue, isEmpty)));
};


module.exports = {
    insertItemToArray
};
