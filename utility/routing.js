const fs = require('fs');

const isEmptyRouting = (content) => {
    return /\[\s*\]/.test(content);
};

const getPositionIndex = (content, isNavigationModule, isEmpty) => {
    const valueToSearch = isNavigationModule ? /(\}?)\s*(].*\s*)$/ : /(\[)\s*({?)/;
    const matchResult = content.match(valueToSearch);
    const edgeIndex = matchResult && matchResult.index;

    if(!edgeIndex) {
        console.error('No route found.');
        process.exit();
    }

    if(isNavigationModule) {
        return isEmpty ? edgeIndex : edgeIndex + 1;
    } else {
        return edgeIndex + 1;
    }
};

const addSeparatorToValue = (insertValue, isNavigationModule, isEmpty) => {
    const separator = isEmpty ? '' : ', ';

    return isNavigationModule ? `${separator}${insertValue}` : `${insertValue}${separator}`;
};

const insertToContent = (content, position, insertValue) => {
    return `${content.slice(0, position)}${insertValue}${content.slice(position, content.length)}`;
};

const addPageToAppNavigation = (filePath, insertValue, isNavigationModule) => {
    const content = fs.readFileSync(filePath).toString();
    const isEmpty = isEmptyRouting(content);
    const position = getPositionIndex(content, isNavigationModule, isEmpty);

    fs.writeFileSync(filePath, insertToContent(content, position, addSeparatorToValue(insertValue, isNavigationModule, isEmpty)));
};


module.exports = {
    addPageToAppNavigation
};
