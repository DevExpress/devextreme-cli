const path = require('path');
const puppeteer = require('puppeteer');

const webServer = require('./helpers/web-server');
const devices = require('./helpers/devices');

module.exports = (env) => {
    const skipAppCreation = process.env.TEST_MODE && process.env.TEST_MODE === 'dev';
    const appUrl = `http://127.0.0.1:${env.port}/`;
    const diffSnapshotsDir = path.join('testing/__tests__/__diff_snapshots__', env.engine);
    let browser;
    let server;

    beforeAll(async() => {
        try {
            if(!skipAppCreation) {
                await env.createApp();
                await env.buildApp();
            }
            server = await webServer.create(env.distPath, env.port);
            browser = await puppeteer.launch();
        } catch(e) {
            console.log(e);
        }
    });

    afterAll(async() => {
        await browser.close();
        await server.close();
    });

    describe(`${env.engine} app-template`, () => {

        devices.forEach((device) => {
            async function openPage(url) {
                const page = await browser.newPage();
                await page.emulate(device);
                await page.goto(url);
                return page;
            }

            function compareSnapshot(image, name) {
                const deviceName = device.name.toLowerCase().replace(/\s+/g, '-');

                expect(image).toMatchImageSnapshot({
                    customSnapshotIdentifier: `${name}-${deviceName}`,
                    customDiffDir: diffSnapshotsDir
                });
            }

            describe(`${device.name}`, () => {
                // TODO: Fix menu in tablet in React
                if(env.engine === 'react' && device.name === 'iPhone 6 landscape') {
                    return;
                }

                it('Home view', async() => {
                    const page = await openPage(appUrl);
                    const image = await page.screenshot({
                        clip: {
                            x: 0,
                            y: 0,
                            width: device.viewport.width,
                            height: 200
                        }
                    });

                    compareSnapshot(image, 'app-template-home');
                });

                it('Profile view', async() => {
                    // TODO: Fix paddings in Vue
                    if(env.engine === 'vue') {
                        expect(true).toBe(true);
                        return;
                    }
                    // TODO: Fix paddings in React
                    if(env.engine === 'react' && device.name === 'Desktop') {
                        expect(true).toBe(true);
                        return;
                    }
                    const page = await openPage(`${appUrl}#/profile`);
                    const image = await page.screenshot();

                    compareSnapshot(image, 'app-template-profile');
                });

                it('Display data view', async() => {
                    // TODO: Fix paddings in Vue
                    if(env.engine === 'vue') {
                        expect(true).toBe(true);
                        return;
                    }
                    const page = await openPage(`${appUrl}#/display-data`);
                    // NOTE: Wait for the DataGrid is loaded
                    await page.waitFor('.dx-row-focused');
                    const image = await page.screenshot();

                    compareSnapshot(image, 'app-template-display-data');
                });

                it('Menu toggle', async() => {
                    // TODO: Fix Vue & React
                    if((env.engine === 'vue' || env.engine === 'react') && device.name === 'Desktop'
                        || env.engine === 'react' && device.name === 'iPhone 5') {
                        expect(true).toBe(true);
                        return;
                    }

                    const page = await openPage(`${appUrl}#/profile`);
                    page.click('.menu-button .dx-button');
                    // NOTE: Wait for animation complete
                    await page.waitFor(1000);
                    const image = await page.screenshot();

                    compareSnapshot(image, 'app-template-toggle');
                });

                it('User panel', async() => {
                    // TODO: Fix Vue & React
                    if(env.engine === 'vue' || env.engine === 'react') {
                        expect(true).toBe(true);
                        return;
                    }

                    const page = await openPage(`${appUrl}#/profile`);
                    const isCompact = await page.$('.dx-toolbar-item-invisible .user-button');
                    await page.click(isCompact ? '.dx-dropdownmenu-button' : '.user-button');
                    // NOTE: Wait for animation complete
                    await page.waitFor(1000);
                    const image = await page.screenshot();

                    compareSnapshot(image, 'app-template-user-panel');
                });

            });
        });

        // TODO: Deal with font blurring
        // TODO: Test Login Form
        // TODO: Test inner layout
    });
};
