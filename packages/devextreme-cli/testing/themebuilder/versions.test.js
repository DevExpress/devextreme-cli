const { mkdir, writeFile, rmdir } = require('fs').promises;
const { join } = require('path');

const workDirectory = join(__dirname, 'versions');
const version = '1.1.1';

const lockFileTemplate = (manager, hasDevExtreme) => {
    const npmDevExtremeTemplate = `"devextreme": { "version": "${version}"}`;
    const yarnDevExtremeTemplate = `devextreme@^1.1.0:\n  version "${version}"`;

    const npmTemplate = `{ "name": "app", "dependencies": { ${hasDevExtreme ? npmDevExtremeTemplate : ''} }}`;
    const yarnTemplate = `# yarn lockfile v1\n\n\n${hasDevExtreme ? yarnDevExtremeTemplate : ''}`;

    return manager === 'npm' ?
        { name: 'package-lock.json', content: npmTemplate } :
        { name: 'yarn.lock', content: yarnTemplate };
};

const createLockFile = async(manager, hasDevExtreme) => {
    const lockFile = lockFileTemplate(manager, hasDevExtreme);
    const fullFileName = join(workDirectory, lockFile.name);
    await mkdir(workDirectory, { recursive: true });
    await writeFile(fullFileName, lockFile.content);
};

const createNodeModules = async(hasDevExtreme) => {
    const nodeModulesDir = join(workDirectory, 'node_modules');
    const devExtremeDir = join(nodeModulesDir, 'devextreme');
    const devExtremePackage = join(devExtremeDir, 'package.json');
    const devExtremePackageContent = `{"version": "${version}"}`;

    await mkdir(nodeModulesDir, { recursive: true });

    if(hasDevExtreme) {
        await mkdir(devExtremeDir);
        await writeFile(devExtremePackage, devExtremePackageContent);
    }
};


describe('ThemeBuilder getDevExtremeVersion Test', () => {

    beforeEach(async() => {
        jest.resetModules();
        await mkdir(workDirectory, { recursive: true });
    });

    afterEach(async() => {
        await rmdir(workDirectory, { recursive: true });
    });

    test.each`
    manager   | lockFileExists | lockFileHasDevExtreme | nodeModulesExists | nodeModulesHasDevExtreme | expectedVersion
    ${'npm'}  | ${true}        | ${true}               | ${false}          | ${false}                 | ${version}
    ${'npm'}  | ${true}        | ${false}              | ${false}          | ${false}                 | ${undefined}
    ${'npm'}  | ${true}        | ${false}              | ${true}           | ${false}                 | ${undefined}
    ${'npm'}  | ${true}        | ${false}              | ${true}           | ${true}                  | ${version}
    ${'npm'}  | ${false}       | ${false}              | ${true}           | ${true}                  | ${version}
    ${'npm'}  | ${false}       | ${false}              | ${false}          | ${false}                 | ${undefined}
    ${'npm'}  | ${false}       | ${false}              | ${true}           | ${false}                 | ${undefined}
    ${'yarn'} | ${true}        | ${true}               | ${false}          | ${false}                 | ${version}
    ${'yarn'} | ${true}        | ${false}              | ${false}          | ${false}                 | ${undefined}
    ${'yarn'} | ${true}        | ${false}              | ${true}           | ${false}                 | ${undefined}
    ${'yarn'} | ${true}        | ${false}              | ${true}           | ${true}                  | ${version}
    ${'yarn'} | ${false}       | ${false}              | ${true}           | ${true}                  | ${version}
    ${'yarn'} | ${false}       | ${false}              | ${false}          | ${false}                 | ${undefined}
    ${'yarn'} | ${false}       | ${false}              | ${true}           | ${false}                 | ${undefined}
    `('$manager: \
lock file exist: $lockFileExists, \
lock file has devextreme: $lockFileHasDevExtreme, \
node_modules exists: $nodeModulesExists, \
node_modules has devextreme: $nodeModulesHasDevExtreme', async({
        manager,
        lockFileExists,
        lockFileHasDevExtreme,
        nodeModulesExists,
        nodeModulesHasDevExtreme,
        expectedVersion
    }) => {
        const { getDevExtremeVersion } = require('../../src/themebuider');
        if(lockFileExists) await createLockFile(manager, lockFileHasDevExtreme);
        if(nodeModulesExists) await createNodeModules(nodeModulesHasDevExtreme);

        const version = getDevExtremeVersion(workDirectory);

        expect(version).toBe(expectedVersion);
    });

});
