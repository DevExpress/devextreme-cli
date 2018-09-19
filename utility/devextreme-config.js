const fs = require('fs');
const fileName = 'devextreme.json';

const read = () => {
    if(fs.existsSync(fileName)) {
        return JSON.parse(fs.readFileSync(fileName));
    }
};

module.exports = {
    read
};
