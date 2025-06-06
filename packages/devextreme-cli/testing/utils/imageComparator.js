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

    // If no snapshot exists, save one and return
    if (!fs.existsSync(snapshotPath)) {
        fs.writeFileSync(snapshotPath, imageBuffer);
        return { equal: true, created: true };
    }

    // Write current image to temp file for diffing
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
                    fs.unlinkSync(tempPath); // Clean up temp file
                    if (diffErr) return reject(diffErr);
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
