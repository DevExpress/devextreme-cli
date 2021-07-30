const { readFile } = require('fs').promises;
const { join } = require('path');
const { spawnSync } = require('child_process');
const runCommand = require('../../src/utility/run-command');
const cliVersion = require('../../package.json').version;

module.exports.buildPackage = async() => {
    await runCommand('npm', ['pack'], { cwd: join(__dirname, '..', '..') });
};

module.exports.prepareDirectory = async(devextremeVersion, themeBuilderVersion, workDirectory) => {
    await runCommand('npm', ['init', '--yes'], { cwd: workDirectory });
    if(devextremeVersion) {
        await runCommand('npm', ['install', `devextreme@${devextremeVersion}`, '--save-exact'], { cwd: workDirectory });
    }
    if(themeBuilderVersion) {
        await runCommand('npm', ['install', `devextreme-themebuilder@${themeBuilderVersion}`, '--save-exact'], { cwd: workDirectory });
    }
    // we need to install cli as tgz (npm i for folder make symlink and require works in wrong way)
    await runCommand('npm', ['install', `../../../devextreme-cli-${cliVersion}.tgz`, '--save-exact'], { cwd: workDirectory });
};

module.exports.parseDetectedVersion = (output) => {
    return output.replace(/.*Using version (\d\d\.\d.\d\d?|latest).*/s, '$1');
};
module.exports.parseInstalledVersion = (output) => {
    const reg = /.*> npm(\.cmd)? install.*?devextreme-themebuilder@(\d\d\.\d.\d\d?|latest).*/s;
    if(!reg.test(output)) return null;
    return output.replace(reg, '$2');
};

module.exports.getLatestThemeBuilderVersion = () => {
    return spawnSync(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', [
        'view',
        'devextreme-themebuilder',
        'version'
    ]).stdout.toString().trim();
};

module.exports.getVersionFromTheme = async(workDirectory) => {
    const themeFileName = join(workDirectory, 'dx.generic.custom-scheme.css');
    const themeContent = (await readFile(themeFileName, 'utf8')).slice(0, 200);
    return themeContent.replace(/.*version:\s(\d\d\.\d\.\d\d?).*/gis, '$1');
};
