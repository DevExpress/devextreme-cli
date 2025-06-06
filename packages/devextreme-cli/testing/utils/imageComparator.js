// utils/imageComparator.js
const fs = require('fs');
const path = require('path');
const looksSame = require('looks-same');

function ensureDirSync(dir) {
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function compareImages({ imageBuffer, snapshotPath, diffPath, threshold = 0.01 }) {
    ensureDirSync(path.dirname(snapshotPath));
    ensureDirSync(path.dirname(diffPath));

    // If no snapshot exists, create it
    if(!fs.existsSync(snapshotPath)) {
        fs.writeFileSync(snapshotPath, imageBuffer);
        return { equal: true, created: true };
    }

    return new Promise((resolve, reject) => {
        looksSame(imageBuffer, fs.readFileSync(snapshotPath), {
            tolerance: threshold,
        }, (err, { equal }) => {
            if(err) return reject(err);

            if(!equal) {
                looksSame.createDiff({
                    reference: snapshotPath,
                    current: imageBuffer,
                    diff: diffPath,
                    highlightColor: '#ff00ff', // pink
                }, () => {
                    resolve({ equal: false, created: false  });
                });
            } else {
                resolve({ equal: true, created: false });
            }
        });
    });
}

module.exports = { compareImages };
