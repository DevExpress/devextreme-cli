const fs = require('fs');
const path = require('path');
const os = require('os');
const looksSame = require('looks-same');

function ensureDirSync(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function compareImages({ imageBuffer, snapshotPath, diffPath, threshold = 0.01 }) {
    ensureDirSync(path.dirname(snapshotPath));
    ensureDirSync(path.dirname(diffPath));

    if (!fs.existsSync(snapshotPath)) {
        fs.writeFileSync(snapshotPath, imageBuffer);
        return { equal: true, created: true };
    }
    
    const tempPath = path.join(os.tmpdir(), `current-${Date.now()}.png`);
    fs.writeFileSync(tempPath, imageBuffer);

    return new Promise((resolve, reject) => {
        looksSame(tempPath, snapshotPath, { tolerance: threshold }, (err, { equal }) => {
            if (err) return reject(err);

            if (!equal) {
                looksSame.createDiff({
                    reference: snapshotPath,
                    current: tempPath,
                    diff: diffPath,
                    highlightColor: '#ff00ff'
                }, (diffErr) => {
                    fs.unlinkSync(tempPath);

                    if (diffErr) {
                        console.error('Error creating diff:', diffErr);
                        return reject(diffErr);
                    }

                    if (!fs.existsSync(diffPath)) {
                        console.error('Diff file was not created at:', diffPath);
                        return reject(new Error('Diff file not created'));
                    }

                    resolve({ equal: false, created: false });
                });
            } else {
                fs.unlinkSync(tempPath);
                resolve({ equal: true, created: false });
            }
        });
    });
}

module.exports = { compareImages };
