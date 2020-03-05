const fs = require('fs');
const rimraf = require('rimraf');

module.exports = async(path) => {
    if(fs.existsSync(path)) {
        await new Promise((resolve, reject) => {
            rimraf(path, (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};
