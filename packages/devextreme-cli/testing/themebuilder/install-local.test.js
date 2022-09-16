const { mkdir, rm } = require('fs').promises;
const { join } = require('path');
const { spawnSync } = require('child_process');
const {
    buildPackage,
    prepareDirectory,
    parseDetectedVersion,
    parseInstalledVersion,
    getLatestThemeBuilderVersion,
    getVersionFromTheme
} = require('./utils');


const workDirectory = join(__dirname, 'install-local');

describe('ThemeBuilder local install tests', () => {
    jest.setTimeout(1800000); // 30min
    beforeAll(async() => {
        await buildPackage();
    });

    beforeEach(async() => {
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
    ${'22.1.5'}  | ${'22.1.5'}            | ${null}
    ${'22.1.5'}  | ${null}                | ${'22.1.5'}
    ${'22.1.5'}  | ${'22.1.4'}            | ${'22.1.5'}
    ${null}      | ${'22.1.5'}            | ${'latest'}
    ${null}      | ${null}                | ${'latest'}
    `('devextreme: $devextreme, devextreme-themebuilder: $devextremeThemebuilder', async({
        devextreme,
        devextremeThemebuilder,
        expectInstall
    }) => {
        await prepareDirectory(devextreme, devextremeThemebuilder, workDirectory).catch(e => {
            throw new Error(e);
        });

        const runResult = spawnSync('node', [
            join(workDirectory, 'node_modules', 'devextreme-cli', 'index.js'),
            'build-theme'
        ]).stdout.toString();

        console.log('Run result\n', runResult);

        const detectedVersion = parseDetectedVersion(runResult);
        const installedVersion = parseInstalledVersion(runResult);
        const buildedVersion = await getVersionFromTheme(workDirectory);

        let realInstalledVersion = expectInstall;

        if(expectInstall === null) {
            realInstalledVersion = devextremeThemebuilder;
        } else if(expectInstall === 'latest') {
            realInstalledVersion = getLatestThemeBuilderVersion();
        }

        expect(detectedVersion).toBe(devextreme || 'latest');
        expect(installedVersion).toBe(expectInstall);
        expect(realInstalledVersion).toBe(buildedVersion);
    });

});
