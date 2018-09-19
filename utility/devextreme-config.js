const fs = require('fs');
const fileName = 'devextreme.json';

const read = () => {
    return fs.existsSync(fileName)
        ? JSON.parse(fs.readFileSync(fileName))
        : {};
};

module.exports = {
    read
};
