const fs = require('fs');

const isEmptyRouting = (content) => {
    return /\[\s*\]/.test(content);
};

const getPositionIndex = (content, isEmpty) => {
    const valueToSearch = /(\}?)\s*(].*\s*)$/;
    const matchResult = content.match(valueToSearch);
    const edgeIndex = matchResult && matchResult.index;

    if(!edgeIndex) {
        console.error('No route found.');
        process.exit();
    }

    
    return isEmpty ? edgeIndex : edgeIndex + 1;
};

const addSeparatorToValue = (insertValue, isEmpty) => {
    const separator = isEmpty ? '' : ', ';

    return `${separator}${insertValue}`;
};

const insertToContent = (content, position, insertValue) => {
    return `${content.slice(0, position)}${insertValue}${content.slice(position, content.length)}`;
};

const addPageToAppNavigation = (filePath, insertValue) => {
    const content = fs.readFileSync(filePath).toString();
    const isEmpty = isEmptyRouting(content);
    const position = getPositionIndex(content, isEmpty);

    fs.writeFileSync(filePath, insertToContent(content, position, addSeparatorToValue(insertValue, isEmpty)));
};


module.exports = {
    addPageToAppNavigation
};
