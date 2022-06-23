const { mkdir, rm, writeFile, unlink, readFile } = require('fs').promises;
const { join } = require('path');
const { spawnSync } = require('child_process');
const importCwd = require('import-cwd');
const {
    buildPackage,
    prepareDirectory
} = require('./utils');

const workDirectory = join(__dirname, 'save-metadata');
const colorValue1 = '#123456';
const colorValue2 = '#654321';

const metadataCases = [{
    baseTheme: 'generic.light',
}, {
    baseTheme: 'generic.light',
    // old-style meta for old versions
    items: [{
        key: '@base-accent',
        value: colorValue1
    },
    {
        key: '@base-text-color',
        value: colorValue2
    }],
    outputColorScheme: 'my-scheme',
    makeSwatch: true,
    widgets: ['button'],
    removeExternalResources: true
}];

const runThemeBuilder = async(command, meta, parameters) => {
    const metaFileName = join(workDirectory, 'meta.json');
    await writeFile(metaFileName, JSON.stringify(meta));

    const runParameters = [
        join(workDirectory, 'node_modules', 'devextreme-cli', 'index.js'),
        command,
        '--input-file=./meta.json'
    ];

    parameters.forEach(p => runParameters.push(p));

    const result = spawnSync('node', runParameters).stdout.toString();
    await unlink(metaFileName);

    console.log(`Run result (${command})\n`, result);
};

describe('ThemeBuilder save metadata and variables tests', () => {
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

    for(const version of ['20.1.15', '21.1.9', '21.2.8', '22.1.3']) {
        for(const meta of metadataCases) {
            const hasItems = meta.items && meta.items.length;
            for(const format of ['scss', 'less']) {
                test(`export-theme-vars, v: ${version}, items: ${hasItems}, format: ${format}`, async() => {
                    await prepareDirectory(version, version, workDirectory).catch(e => {
                        throw new Error(e);
                    });

                    const outFile = join(workDirectory, `out.${format}`);

                    await runThemeBuilder('export-theme-vars', meta, [
                        `--output-format=${format}`,
                        `--output-file=${outFile}`
                    ]);

                    const content = (await readFile(outFile)).toString();

                    const baseParameters = importCwd('devextreme-themebuilder/modules/base-parameters');

                    baseParameters.forEach(baseParameter => {
                        const variableName = format === 'scss' ?
                            baseParameter.replace('@', '$') :
                            baseParameter.replace('$', '@');

                        expect(content).toContain(variableName);

                        if(hasItems) {
                            expect(content).toContain(colorValue1);
                            expect(content).toContain(colorValue2);
                        }
                    });

                    await unlink(outFile);
                });
            }

            test(`export-theme-meta, v: ${version}, items: ${hasItems}`, async() => {
                await prepareDirectory(version, version, workDirectory).catch(e => {
                    throw new Error(e);
                });

                const outFile = join(workDirectory, 'out.json');

                await runThemeBuilder('export-theme-meta', meta, [
                    `--output-file=${outFile}`
                ]);

                const content = JSON.parse((await readFile(outFile)));

                expect(content.baseTheme).toBe(meta.baseTheme);
                expect(content.outputColorScheme).toBe(meta.outputColorScheme || 'custom-scheme');
                expect(content.widgets).toEqual(meta.widgets);
                expect(content.items).toEqual(
                    (meta.items || []).map(item => ({
                        // we should not change @->$ for old versions
                        key: version !== '20.1.13' ? item.key.replace('@', '$') : item.key,
                        value: item.value
                    }))
                );
                expect(content.makeSwatch).toBe(meta.makeSwatch || false);
                expect(content.removeExternalResources).toBe(meta.removeExternalResources || false);

                await unlink(outFile);
            });
        }
    }

});
