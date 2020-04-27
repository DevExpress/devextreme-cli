const fs = require('fs');

const remove = (filePath) => {
    if(fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = {
    remove
};
