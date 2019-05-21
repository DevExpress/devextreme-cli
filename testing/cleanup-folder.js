const fs = require('fs');
const rimraf = require('rimraf');

module.exports = (dirPath) => {
    return new Promise((resolve, reject) => {
        // TODO: use async
        if(fs.existsSync(dirPath)) {
            rimraf.sync(dirPath);
        }

        fs.mkdirSync(dirPath, { recursive: true });
        resolve();
    });
};
