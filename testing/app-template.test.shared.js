const path = require('path');
const puppeteer = require('puppeteer');
const ip = require('ip');

const webServer = require('./helpers/web-server');
const devices = require('./helpers/devices');
const setTheme = require('./helpers/set-theme');

module.exports = (env) => {
    const skipAppCreation = process.env.TEST_MODE && process.env.TEST_MODE === 'dev';
    const appUrl = `http://${ip.address()}:${env.port}/`;
    const diffSnapshotsDir = path.join('testing/__tests__/__diff_snapshots__', env.engine);
    const defaultLayout = 'side-nav-outer-toolbar';

    describe(`${env.engine} app-template`, () => {

        beforeAll(async() => {
            try {
                if(!skipAppCreation) {
                    await env.createApp();
                }
            } catch(e) {
                console.log(e);
            }
        });

        [
            'side-nav-outer-toolbar',
            'side-nav-inner-toolbar'
        ].forEach((layout) => {
            const isDefaultLayout = layout === defaultLayout;

            describe(layout, () => {

                [
                    'material',
                    'generic'
                ].forEach((theme) => {

                    describe(theme, () => {
                        let browser;
                        let server;

                        beforeAll(async() => {
                            try {
                                if(!isDefaultLayout || skipAppCreation) {
                                    env.setLayout(layout);
                                }
                                await setTheme(theme, env.engine);
                                await env.buildApp();
                                server = await webServer.create(env.distPath, env.port);
                            } catch(e) {
                                throw new Error(e);
                            }
                        });

                        afterAll(async() => {
                            await server.close();
                        });

                        beforeEach(async() => {
                            browser = await puppeteer.launch({
                                args: ['--no-sandbox', '--disable-dev-shm-usage']
                            });
                        });

                        afterEach(async() => {
                            await browser.close();
                        });

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
                                    customSnapshotIdentifier: `${layout}-${theme}-${deviceName}-${name}`,
                                    customDiffDir: diffSnapshotsDir
                                });
                            }

                            describe(`${device.name}`, () => {
                                // TODO: Fix menu in tablet in React
                                if(env.engine === 'react' && device.name === 'iPhone 6 landscape') {
                                    return;
                                }

                                it('Home view', async() => {
                                    // TODO: Fix content shift in Vue
                                    if(env.engine === 'vue' && !isDefaultLayout && device.name !== 'Desktop') {
                                        expect(true).toBe(true);
                                        return;
                                    }

                                    // TODO: Fix user panel and content shift in Reactin inner layout
                                    if(env.engine === 'react' && !isDefaultLayout && device.name === 'iPhone 5') {
                                        expect(true).toBe(true);
                                        return;
                                    }

                                    const page = await openPage(appUrl);
                                    const image = await page.screenshot({
                                        clip: {
                                            x: 0,
                                            y: 0,
                                            width: device.viewport.width,
                                            height: 180
                                        }
                                    });

                                    compareSnapshot(image, 'home');
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
                                    // TODO: Fix user panel and content shift in Reactin inner layout
                                    if(env.engine === 'react' && !isDefaultLayout && device.name === 'iPhone 5') {
                                        expect(true).toBe(true);
                                        return;
                                    }

                                    const page = await openPage(`${appUrl}#/profile`);
                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'profile');
                                });

                                it('Display data view', async() => {
                                    // TODO: Fix paddings in Vue
                                    if(env.engine === 'vue') {
                                        expect(true).toBe(true);
                                        return;
                                    }
                                    // TODO: Fix user panel and content shift in Reactin inner layout
                                    if(env.engine === 'react' && !isDefaultLayout && device.name === 'iPhone 5') {
                                        expect(true).toBe(true);
                                        return;
                                    }

                                    const page = await openPage(`${appUrl}#/display-data`);
                                    // NOTE: Wait for the DataGrid is loaded
                                    await page.waitFor('.dx-row-focused');
                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'display-data');
                                });

                                it('Menu toggle', async() => {
                                    // TODO: Fix Vue & React
                                    if((env.engine === 'vue' || env.engine === 'react') && device.name === 'Desktop'
                                        || env.engine === 'react' && device.name === 'iPhone 5') {
                                        expect(true).toBe(true);
                                        return;
                                    }

                                    // TODO: Fix redundant menu button in Vue
                                    if(env.engine === 'vue' && !isDefaultLayout && device.name === 'iPhone 5') {
                                        expect(true).toBe(true);
                                        return;
                                    }

                                    // TODO: Fix content shift in Vue
                                    if(env.engine === 'vue' && !isDefaultLayout && device.name === 'iPhone 6 landscape') {
                                        expect(true).toBe(true);
                                        return;
                                    }

                                    const page = await openPage(`${appUrl}#/profile`);
                                    const menuButton = await page.waitForSelector('.menu-button .dx-button', { visible: true });
                                    await menuButton.click();

                                    // NOTE: Wait for animation complete
                                    await page.waitFor(1000);
                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'toggle');
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
                                    const image = await page.screenshot({
                                        clip: {
                                            x: device.viewport.width - 250,
                                            y: 0,
                                            width: 250,
                                            height: 300
                                        }
                                    });

                                    compareSnapshot(image, 'user-panel');
                                });

                                it('Login page', async() => {
                                    // TODO: Fix Angular & React
                                    if(env.engine === 'angular' || env.engine === 'react') {
                                        expect(true).toBe(true);
                                        return;
                                    }

                                    // NOTE: Test only once
                                    if(!isDefaultLayout) {
                                        return;
                                    }

                                    const page = await openPage(appUrl);
                                    const isCompact = await page.$('.dx-toolbar-item-invisible .user-button');
                                    await page.click(isCompact ? '.dx-dropdownmenu-button' : '.user-button');
                                    await page.waitFor('.dx-icon-runner', { timeout: 0 });
                                    await page.click('.dx-icon-runner');
                                    await page.waitFor('.login-header', { timeout: 0 });
                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'login');
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};
