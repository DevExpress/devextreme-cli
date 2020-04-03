const fs = require('fs');
const path = require('path');
const modifyJson = require('./modify-json-file');
const configPath = path.join(__dirname, '../cli-config.json');

const getConfig = () => {
    return JSON.parse(fs.readFileSync(configPath));
};

const setValue = (name, value) => {
    modifyJson(configPath, content => {
        content[name] = value;

        return content;
    });
};

const getValue = (name) => {
    return getConfig()[name];
};

module.exports = {
    getConfig,
    getValue,
    setValue
};
