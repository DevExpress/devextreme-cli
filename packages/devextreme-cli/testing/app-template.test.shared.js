const path = require('path');
const waitOn = require('wait-on');

const getBrowser = require('./utils/puppeteer').getBrowser;
const { viewports, layouts } = require('./constants');
const DevServer = require('./dev-server');

const defaultLayout = 'side-nav-outer-toolbar';
const defaultHost = process.env.APP_TEMPLATE_HOST || process.env.HOST || '127.0.0.1';

module.exports = (env, { port = 8080, urls = {} } = {}) => {
    const diffSnapshotsDir = path.join('testing/__tests__/__diff_snapshots__', env.engine);
    const pageUrls = {
        profile: 'profile',
        tasks: 'tasks',
        page: `${(env.engine === 'angular' ? 'pages/' : '')}new-page`,
        'change-password': 'change-password/123',
        ...urls,
    };

    describe(`${env.engine} app-template`, () => {
        layouts.forEach((layout) => {
            const isDefaultLayout = layout === defaultLayout;

            describe(layout, () => {
                const devServer = new DevServer(env, { port });
                const appUrl = `http://${defaultHost}:${port}/`;

                let browser;
                let page;

                const getPageURL = (name) => `${appUrl}${(!env.engine.startsWith('nextjs') ? '#/' : '')}${pageUrls[name]}`;

                beforeAll(async() => {
                    browser = await getBrowser();
                    page = await browser.newPage();

                    try {
                        await devServer.setLayout(layout);
                        await devServer.build();
                        await devServer.start();
                        await waitOn({
                            resources: [appUrl],
                            timeout: 30000,
                            interval: 100
                        });
                    } catch(e) {
                        // NOTE jest@27 will fail test, but jest@26 - not
                        throw new Error(e);
                    }
                });

                afterAll(async() => {
                    await devServer.stop();
                    await (Boolean(process.env.LAUNCH_BROWSER) ? browser : page).close();
                });

                Object.keys(viewports).forEach((viewportName) => {
                    const viewport = viewports[viewportName];

                    async function openPage(url, options) {
                        await page.goto('about:blank');
                        await page.setViewport(viewport);
                        await page.goto(url, {
                            waitUntil: 'networkidle0',
                            ...options
                        });
                        await page.waitForSelector('.with-footer');
                        await new Promise(r => setTimeout(r, 3000));
                    }

                    async function logOut() {
                        const isCompact = await page.$('.dx-toolbar-item-invisible .user-button');
                        await page.click(isCompact ? '.dx-dropdownmenu-button' : '.user-button');

                        await new Promise(r => setTimeout(r, 500));
                        await page.waitForSelector('.dx-icon-runner');
                        await page.click('.dx-icon-runner');

                        await page.waitForSelector('.login-form');
                        await new Promise(r => setTimeout(r, 500));
                    }

                    const customConfig = {
                        threshold: 0.3,
                        thresholdType: 'percent',
                        failureThreshold: 0.1,
                        failureThresholdType: 'percent',
                        customDiffConfig: {
                            includeAA: false,
                            threshold: 0.5,
                        }
                    };

                    function compareSnapshot(image, name, overrideConfig = {}) {
                        expect(image).toMatchImageSnapshot({
                            customDiffConfig: { ...customConfig, ...overrideConfig },
                            customSnapshotIdentifier: `${layout}-fluent-${viewportName}-${name}-snap`,
                            customDiffDir: diffSnapshotsDir,
                            storeReceivedOnFailure: true,
                            customReceivedDir: diffSnapshotsDir
                        });
                    }

                    /* eslint-disable-next-line no-unused-vars */
                    async function switchTheme() {
                        await page.click('.dx-button.theme-button');
                        await new Promise(r => setTimeout(r, 500));

                        await page.click('.dx-button.theme-button', { offset: { x: 0, y: -100 } });
                        await new Promise(r => setTimeout(r, 500));
                    }

                    async function compareThemeModeSnapshot(name, mode) {
                        const image = await takeScreenshot();

                        compareSnapshot(image, name + (mode === 'light' ? '' : '-dark'));
                    }

                    async function hideScroll() {
                        await page.evaluate(() => {
                            // eslint-disable-next-line no-undef
                            const scrollElement = document.getElementsByClassName('dx-scrollable-scroll')[0];

                            if(scrollElement) {
                                scrollElement.style.transition = 'none';
                                scrollElement.style.display = 'none';
                                scrollElement.className += ' dx-state-invisible';
                            }
                        });
                        await new Promise(r => setTimeout(r, 3000));
                    }

                    async function takeScreenshot(options) {
                        return await page.screenshot({
                            ...(options || {}),
                            captureBeyondViewport: false
                        });
                    }

                    describe(`${viewportName}`, () => {
                        it('Home view', async() => {
                            await openPage(appUrl, { timeout: 5000 });
                            await page.reload([{
                                waitUntil: {
                                    networkidle0: 5000,
                                    networkidle2: 5000,
                                    domcontentloaded: true
                                }
                            }]);
                            await new Promise(r => setTimeout(r, 5000));

                            const image = await takeScreenshot({
                                clip: {
                                    x: 0,
                                    y: 0,
                                    width: viewport.width,
                                    height: 150
                                }
                            });

                            compareSnapshot(image, 'home');
                        });

                        it('Profile view', async() => {
                            await openPage(getPageURL('profile'));

                            await new Promise(r => setTimeout(r, 3000));

                            const image = await takeScreenshot();

                            compareSnapshot(image, 'profile');

                            await switchTheme();
                            await compareThemeModeSnapshot('profile', 'dark');
                            await switchTheme();

                            await compareThemeModeSnapshot('profile', 'light');
                        });

                        xit('Tasks view', async() => {
                            await openPage(getPageURL('tasks'));
                            // NOTE: Wait for the DataGrid is loaded
                            await page.waitForSelector('.dx-row-focused');
                            await new Promise(r => setTimeout(r, 3000));
                            const image = await takeScreenshot();

                            compareSnapshot(image, 'tasks');
                        });

                        it('Add view', async() => {
                            await openPage(getPageURL('page'));
                            await new Promise(r => setTimeout(r, 3000));
                            const image = await takeScreenshot();

                            compareSnapshot(image, 'add-view');
                        });

                        it('Menu toggle', async() => {
                            const menuButtonSelector = '.menu-button .dx-button';
                            await openPage(getPageURL('profile'));
                            await page.waitForSelector(menuButtonSelector);
                            await page.click(menuButtonSelector);

                            // NOTE: Wait for animation complete
                            await new Promise(r => setTimeout(r, 3000));
                            const image = await takeScreenshot();

                            compareSnapshot(image, 'toggle');
                        });

                        it('User panel', async() => {
                            await openPage(getPageURL('profile'));
                            const isCompact = await page.$('.dx-toolbar-item-invisible .user-button');
                            await page.click(isCompact ? '.dx-dropdownmenu-button' : '.user-button');
                            // NOTE: Wait for animation complete
                            await new Promise(r => setTimeout(r, 2000));
                            const image = await takeScreenshot({
                                clip: {
                                    x: viewport.width - 300,
                                    y: 0,
                                    width: 300,
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

                            const name = 'login';
                            await openPage(appUrl);
                            await logOut();

                            await hideScroll();

                            await new Promise(r => setTimeout(r, 3000));
                            const image = await takeScreenshot();

                            compareSnapshot(image, name);
                        });

                        it('Create account page', async() => {
                            // NOTE: Test only once
                            if(!isDefaultLayout) {
                                return;
                            }

                            await openPage(appUrl);
                            await logOut();
                            await page.waitForSelector('.dx-button-normal');
                            await page.hover('.dx-button-normal');
                            await new Promise(r => setTimeout(r, 1000));
                            await page.click('.dx-button-normal');
                            await page.waitForSelector('.create-account-form');

                            await hideScroll();
                            await new Promise(r => setTimeout(r, 3000));
                            const image = await takeScreenshot();

                            compareSnapshot(image, 'create-account');
                        });

                        it('Reset password page', async() => {
                            // NOTE: Test only once
                            if(!isDefaultLayout) {
                                return;
                            }

                            await openPage(appUrl);
                            await logOut();
                            await page.click('a');
                            await new Promise(r => setTimeout(r, 500));
                            await page.waitForSelector('.reset-password-form');
                            await new Promise(r => setTimeout(r, 3000));

                            await hideScroll();

                            const image = await takeScreenshot();

                            compareSnapshot(image, 'reset-password');
                        });

                        it('Change password page', async() => {
                            // NOTE: Test only once
                            if(!isDefaultLayout) {
                                return;
                            }

                            await openPage(appUrl);
                            await logOut();
                            await page.evaluate(
                                `const a = document.createElement("a");a.href="${getPageURL('change-password')}";a.click()`
                            );
                            await page.waitForSelector('form');
                            await page.mouse.move(0, 0);
                            await hideScroll();
                            await new Promise(r => setTimeout(r, 3000));

                            const image = await takeScreenshot();

                            compareSnapshot(image, 'change-password');
                        });
                    });
                });
            });
        });
    });
};
