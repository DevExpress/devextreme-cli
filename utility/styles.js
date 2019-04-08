const fs = require('fs');
const insertImport = require('./module').insertImport;

const defaultStyles = [
    'devextreme/dist/css/dx.light.css',
    'devextreme/dist/css/dx.common.css'
];

const addStylesToApp = (filePath, styles) => {
    if(!styles) {
        styles = defaultStyles;
    }
    styles.forEach(style => {
        insertImport(filePath, style);
    });
};

module.exports = addStylesToApp;
