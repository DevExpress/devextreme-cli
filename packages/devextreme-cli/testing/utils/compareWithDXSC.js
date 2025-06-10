const fs = require('fs');
const path = require('path');
const { compareScreenshot } = require('devextreme-screenshot-comparer');

const BASELINE_DIR = path.resolve(__dirname, '../testing/__tests__/__diff_snapshots__/baseline');
const ACTUAL_DIR = path.resolve(__dirname, '../testing/__tests__/__diff_snapshots__/actual');
const DIFF_DIR = path.resolve(__dirname, '../testing/__tests__/__diff_snapshots__/diff');

function ensureDirs() {
    [BASELINE_DIR, ACTUAL_DIR, DIFF_DIR].forEach((dir) => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
}

async function compareWithDXSC(imageBuffer, snapshotName, envEngine, options = {}) {
    ensureDirs();

    const filename = `${snapshotName}.png`;

    const engineDir = path.join('testing/__tests__/__diff_snapshots__', envEngine);
    const baselinePath = path.join(BASELINE_DIR, engineDir, filename);
    const actualPath = path.join(ACTUAL_DIR, engineDir, filename);
    const diffPath = path.join(DIFF_DIR, engineDir, filename);

    fs.writeFileSync(actualPath, imageBuffer);

    if (!fs.existsSync(baselinePath)) {
        // First-time snapshot creation
        fs.writeFileSync(baselinePath, imageBuffer);
        console.warn(`[devextreme-screenshot-comparer] Created new baseline: ${baselinePath}`);
        return true;
    }

    const result = await compareScreenshot({
        actual: actualPath,
        expected: baselinePath,
        diff: diffPath,
        ...options,
    });

    if (result.errorCount > 0) {
        throw new Error(`[Screenshot mismatch] ${snapshotName}: ${result.errorCount} errors, ${result.misMatchPercentage}% mismatch`);
    }

    return true;
}

module.exports = { compareWithDXSC };