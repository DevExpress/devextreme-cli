const { mkdir, writeFile, rm } = require('fs').promises;
const { join } = require('path');
const { spawnSync } = require('child_process');
const runCommand = require('../../src/utility/run-command');

const workDirectory = join(__dirname, 'install-local');

const prepareDirectory = async(devextremeVersion, themeBuilderVersion) => {
    await runCommand('npm', ['init', '--yes'], { cwd: workDirectory });
    await runCommand('npm', ['install', `devextreme@${devextremeVersion}`, '--save-exact'], { cwd: workDirectory });
    if(themeBuilderVersion) {
        await runCommand('npm', ['install', `devextreme-themebuilder@${themeBuilderVersion}`, '--save-exact'], { cwd: workDirectory });
    }
    // we need to install cli as tgz (npm i for folder make symlink and require works in wrong way)
    await runCommand('npm', ['pack'], { cwd: join(__dirname, '..', '..') });
    const cliVersion = require('../../package.json').version;
    await runCommand('npm', ['install', `../../../devextreme-cli-${cliVersion}.tgz`, '--save-exact'], { cwd: workDirectory });
};

const parseDetectedVersion = (output) => {
    return output.replace(/.*Using version (\d\d\.\d.\d\d?|latest).*/s, '$1');
};
const parseInstalledVersion = (output) => {
    const reg = /.*> npm.cmd install --no-save devextreme-themebuilder@(\d\d\.\d.\d\d?).*/s;
    if(!reg.test(output)) return null;
    return output.replace(reg, '$1');
};

describe('ThemeBuilder local install tests', () => {
    jest.setTimeout(1000000);
    beforeEach(async() => {
        jest.resetModules();
        await mkdir(workDirectory, { recursive: true });
        process.chdir(workDirectory);
    });

    afterEach(async() => {
        await rm(join(workDirectory, 'package.json'));
        await rm(join(workDirectory, 'package-lock.json'));
        await rm(join(workDirectory, 'node_modules'), { recursive: true, force: true });
    });

    test.each`
    devextreme   | devextremeThemebuilder | expectInstall
    ${'21.1.4'}  | ${'21.1.4'}            | ${false}
    ${'21.1.4'}  | ${null}                | ${true}
    `('devextreme: $devextreme, devextreme-themebuilder: $devextremeThemebuilder', async({
        devextreme,
        devextremeThemebuilder,
        expectInstall
    }) => {
        await prepareDirectory(devextreme, devextremeThemebuilder).catch(e => {
            throw new Error(e);
        });

        const runResult = spawnSync('node', [
            join(workDirectory, 'node_modules', 'devextreme-cli', 'index.js'),
            'build-theme'
        ]).stdout.toString();
        const detectedVersion = parseDetectedVersion(runResult);
        const installedVersion = parseInstalledVersion(runResult);

        expect(detectedVersion).toBe(devextreme);
        expect(installedVersion).toBe(expectInstall ? devextreme : null);
    });

});
