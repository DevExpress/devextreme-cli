const fs = require('fs');

const isEmptyRouting = (content) => {
    return /\[\s*\]/.test(content);
};

const getPositionInsertionIndexes = (content, isNavigationModule, isEmpty) => {
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

const insertToContent = (content, positions, insertValue) => {
    return `${content.slice(0, positions)}${insertValue}${content.slice(positions, content.length)}`;
};

const addPageToAppNavigation = (filePath, insertValue, isNavigationModule) => {
    const content = fs.readFileSync(filePath).toString();
    const isEmpty = isEmptyRouting(content);
    const positions = getPositionInsertionIndexes(content, isNavigationModule, isEmpty);

    fs.writeFileSync(filePath, insertToContent(content, positions, addSeparatorToValue(insertValue, isNavigationModule, isEmpty)));
};


module.exports = {
    addPageToAppNavigation
};
