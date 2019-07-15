const fs = require('fs');
const path = require('path');
const lockFileName = path.join(__dirname, '..', 'tb-install.lock');
const checkInterval = 50;

const create = () => {
    try {
        fs.writeFileSync(lockFileName, '', { flag: 'wx' });
        return true;
    } catch(e) {
        return false;
    }
};

const release = () => {
    try {
        fs.unlinkSync(lockFileName);
    } catch(e) { }
};

const acquire = () => {
    return new Promise(resolve => {
        if(create()) {
            resolve();
            return;
        }

        const interval = setInterval(() => {
            if(create()) {
                clearInterval(interval);
                resolve();
            }
        }, checkInterval);
    });
};

module.exports = {
    acquire: acquire,
    release: release
};
