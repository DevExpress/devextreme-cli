const path = require('path');
const puppeteer = require('puppeteer');

const { viewports, themes, layouts } = require('./constants');
const DevServer = require('./dev-server');

const defaultLayout = 'side-nav-outer-toolbar';

module.exports = (env) => {
    const skipAppCreation = process.env.TEST_MODE && process.env.TEST_MODE === 'dev';
    const appUrl = `http://127.0.0.1:${env.port}/`;
    const diffSnapshotsDir = path.join('testing/__tests__/__diff_snapshots__', env.engine);
    const chromiumUserDataDir = path.join(process.cwd(), './testing/sandbox/user-data');

    describe(`${env.engine} app-template`, () => {
        let devServer;
        let browser;
        let page;

        beforeAll(async() => {
            browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-dev-shm-usage'],
                userDataDir: chromiumUserDataDir
            });
            page = await browser.newPage();

            try {
                if(!skipAppCreation) {
                    await env.createApp();
                }
            } catch(e) {
                console.log(e);
            }

            devServer = new DevServer(env);
            await devServer.start();
        });

        afterAll(async() => {
            await devServer.stop();
            await browser.close();
        });

        Object.keys(themes).forEach((theme) => {

            describe(theme, () => {
                layouts.forEach((layout) => {
                    const isDefaultLayout = layout === defaultLayout;

                    describe(layout, () => {

                        beforeAll(async() => {
                            await devServer.setLayout(layout);
                            await devServer.setTheme(theme);
                        });

                        Object.keys(viewports).forEach((viewportName) => {
                            const viewport = viewports[viewportName];

                            async function openPage(url) {
                                await page.goto('about:blank');
                                await page.setViewport(viewport);
                                await page.goto(url, {
                                    timeout: 0
                                });

                                return page;
                            }

                            function compareSnapshot(image, name) {
                                expect(image).toMatchImageSnapshot({
                                    customSnapshotIdentifier: `${layout}-${theme}-${viewportName}-${name}`,
                                    customDiffDir: diffSnapshotsDir
                                });
                            }

                            describe(`${viewportName}`, () => {
                                it('Home view', async() => {
                                    const page = await openPage(appUrl);
                                    const image = await page.screenshot({
                                        clip: {
                                            x: 0,
                                            y: 0,
                                            width: viewport.width,
                                            height: 180
                                        }
                                    });

                                    compareSnapshot(image, 'home');
                                });

                                it('Profile view', async() => {
                                    const page = await openPage(`${appUrl}#/profile`);
                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'profile');
                                });

                                it('Display data view', async() => {
                                    const page = await openPage(`${appUrl}#/display-data`);
                                    // NOTE: Wait for the DataGrid is loaded
                                    await page.waitFor('.dx-row-focused');
                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'display-data');
                                });

                                it('Menu toggle', async() => {
                                    const menuButtonSelector = '.menu-button .dx-button';
                                    const page = await openPage(`${appUrl}#/profile`);
                                    await page.waitForSelector(menuButtonSelector);
                                    await page.click(menuButtonSelector);

                                    // NOTE: Wait for animation complete
                                    await page.waitFor(1000);
                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'toggle');
                                });

                                it('User panel', async() => {
                                    const page = await openPage(`${appUrl}#/profile`);
                                    const isCompact = await page.$('.dx-toolbar-item-invisible .user-button');
                                    await page.click(isCompact ? '.dx-dropdownmenu-button' : '.user-button');
                                    // NOTE: Wait for animation complete
                                    await page.waitFor(1000);
                                    const image = await page.screenshot({
                                        clip: {
                                            x: viewport.width - 250,
                                            y: 0,
                                            width: 250,
                                            height: 300
                                        }
                                    });

                                    compareSnapshot(image, 'user-panel');
                                });

                                it('Login page', async() => {
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
