const fs = require('fs');
const path = require('path');
const runCommand = require('../../src/utility/run-command');
const { name, version } = require('../../package.json');

const cliRoot = path.join(__dirname, '../..');
const packageDir = path.join(cliRoot, 'testing/sandbox/local-cli-package');
const tarballPath = path.join(packageDir, `${name}-${version}.tgz`);
const preloadPath = path.join(__dirname, 'use-local-cli-package.js');

const packLocalCli = async() => {
    fs.mkdirSync(packageDir, { recursive: true });
    await runCommand('npm', ['pack', '--pack-destination', packageDir], { cwd: cliRoot });
};

module.exports = {
    tarballPath,
    packLocalCli,
    nodeArgs: ['--require', preloadPath]
};
