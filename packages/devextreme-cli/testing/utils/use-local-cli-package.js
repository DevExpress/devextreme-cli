const fs = require('fs');
const latestVersions = require('../../src/utility/latest-versions');
const { tarballPath } = require('./local-cli-package');

if(!fs.existsSync(tarballPath)) {
    throw new Error(`Local devextreme-cli package is not found at ${tarballPath}. Run testing/creating.js to pack it.`);
}

latestVersions['devextreme-cli'] = `file:${tarballPath}`;
