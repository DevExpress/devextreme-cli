const { mkdir, rm, writeFile, readFile } = require('fs').promises;
const { join } = require('path');
const { spawnSync } = require('child_process');
const {
    buildPackage,
    prepareDirectory,
    getLatestThemeBuilderVersion,
    getVersionFromTheme
} = require('./utils');

const workDirectory = join(__dirname, 'bootstrap3');

describe('ThemeBuilder bootstrap3 integration tests', () => {
    jest.setTimeout(1800000); // 30min
    beforeAll(async() => {
        await buildPackage();
        await mkdir(workDirectory, { recursive: true });
        process.chdir(workDirectory);
        await prepareDirectory(null, 'latest', workDirectory).catch(e => {
            throw new Error(e);
        });
    });

    afterEach(async() => {
        await rm(join(workDirectory, 'dx.generic.custom-scheme.css'));
    });

    afterAll(async() => {
        await rm(join(workDirectory, 'package.json'));
        await rm(join(workDirectory, 'package-lock.json'));
        await rm(join(workDirectory, 'node_modules'), { recursive: true, force: true });
    });

    test('Empty less file', async() => {
        await writeFile(join(workDirectory, 'bootstrap3.less'), '');

        const runResult = spawnSync('node', [
            join(workDirectory, 'node_modules', 'devextreme-cli', 'index.js'),
            'build-theme',
            '--input-file=bootstrap3.less'
        ], { cwd: workDirectory }).stdout.toString();

        console.log('Run result\n', runResult);

        const buildedVersion = await getVersionFromTheme(workDirectory);
        const realInstalledVersion = getLatestThemeBuilderVersion();

        expect(buildedVersion).toBe(realInstalledVersion);
    });

    test('Change primary color', async() => {
        await writeFile(join(workDirectory, 'bootstrap3.less'), '@brand-primary: #123456;\n');

        const runResult = spawnSync('node', [
            join(workDirectory, 'node_modules', 'devextreme-cli', 'index.js'),
            'build-theme',
            '--input-file=bootstrap3.less'
        ], { cwd: workDirectory }).stdout.toString();

        console.log('Run result\n', runResult);

        const buildedVersion = await getVersionFromTheme(workDirectory);
        const realInstalledVersion = getLatestThemeBuilderVersion();

        const themeFileName = join(workDirectory, 'dx.generic.custom-scheme.css');
        const themeContent = await readFile(themeFileName, 'utf8');

        expect(buildedVersion).toBe(realInstalledVersion);
        expect(themeContent.indexOf('123456') !== -1).toBe(true);
    });
});
