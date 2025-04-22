const path = require('path');
const ip = require('ip');
const getBrowser = require('./utils/puppeteer').getBrowser;

const { viewports, themes, layouts } = require('./constants');
const DevServer = require('./dev-server');

const defaultLayout = 'side-nav-outer-toolbar';

module.exports = (env, { port } = { port: '8080' }) => {
    const appUrl = `http://${ip.address()}:${port}/`;
    const diffSnapshotsDir = path.join('testing/__tests__/__diff_snapshots__', env.engine);

    const pageUrls = {
        profile: 'profile',
        tasks: 'tasks',
        page: `${(env.engine === 'angular' ? 'pages/' : '')}new-page`,
    };

    const getPageURL = (name) => `${appUrl}${(env.engine.indexOf('nextjs') !== 0 ? '#/' : '')}${pageUrls[name]}`;

    describe(`${env.engine} app-template`, () => {
        let browser;
        let page;

        beforeAll(async() => {
            browser = await getBrowser();
            page = await browser.newPage();
        });

        afterAll(async() => {
            await (Boolean(process.env.LAUNCH_BROWSER) ? browser : page).close();
        });

        Object.keys(themes).forEach((theme) => {

            describe(theme, () => {
                layouts.forEach((layout) => {
                    const isDefaultLayout = layout === defaultLayout;

                    describe(layout, () => {
                        const devServer = new DevServer(env);

                        beforeAll(async() => {
                            try {
                                await devServer.setLayout(layout);
                                await devServer.setTheme(theme);
                                await devServer.build();
                                await devServer.start();
                            } catch(e) {
                                // NOTE jest@27 will fail test, but jest@26 - not
                                console.log('----throw new Error------>', e);
                                throw new Error(e);
                            }
                        });

                        afterAll(async() => {
                            await devServer.stop();
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
                                await page.waitForTimeout(3000);
                            }

                            async function logOut() {
                                const isCompact = await page.$('.dx-toolbar-item-invisible .user-button');
                                await page.click(isCompact ? '.dx-dropdownmenu-button' : '.user-button');

                                await page.waitForTimeout(500);
                                await page.waitForSelector('.dx-icon-runner');
                                await page.click('.dx-icon-runner');

                                await page.waitForSelector('.login-form');
                                await page.waitForTimeout(500);
                            }

                            const customConfig = { threshold: 0.012 };

                            function compareSnapshot(image, name) {
                                expect(image).toMatchImageSnapshot({
                                    customDiffConfig: customConfig,
                                    customSnapshotIdentifier: `${layout}-${theme}-${viewportName}-${name}-snap`,
                                    customDiffDir: diffSnapshotsDir,
                                    storeReceivedOnFailure: true,
                                    customReceivedDir: diffSnapshotsDir
                                });
                            }

                            /* eslint-disable-next-line no-unused-vars */
                            async function switchTheme() {
                                await page.click('.dx-button.theme-button');
                                await page.waitForTimeout(500);

                                await page.click('.dx-button.theme-button', { offset: { x: 0, y: -100 } });
                                await page.waitForTimeout(500);
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
                                await page.waitForTimeout(3000);
                            }

                            // The footer text is antialiased differently in Angular and React,
                            // so we are hiding the footer before taking screenshots to prevent
                            // false failures. Moving forward, we need to investigate the cause
                            // of this effect.
                            async function hideFooter() {
                                await page.evaluate(() => {
                                    /* eslint-disable no-undef */
                                    const footer = document.getElementsByTagName('app-footer')[0]
                                        || document.getElementsByTagName('footer')[0];

                                    if(footer) {
                                        footer.style = {
                                            ...(footer.style || {}),
                                            transition: 'none',
                                            display: 'none'
                                        };
                                        footer.className += ' dx-state-invisible';
                                    }
                                    /* eslint-enable no-undef */
                                });
                                await page.waitForTimeout(3000);
                            }

                            async function takeScreenshot(options) {
                                await hideFooter();
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
                                    await page.waitForTimeout(5000);

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

                                    await page.waitForTimeout(3000);

                                    const image = await takeScreenshot();

                                    compareSnapshot(image, 'profile');

                                    // TODO: fix false positive screenshot failure and uncomment
                                    // await switchTheme();
                                    // await compareThemeModeSnapshot('profile', 'dark');
                                    // await switchTheme();

                                    await compareThemeModeSnapshot('profile', 'light');
                                });

                                it('Tasks view', async() => {
                                    await openPage(getPageURL('tasks'));
                                    // NOTE: Wait for the DataGrid is loaded
                                    await page.waitForSelector('.dx-row-focused');
                                    await page.waitForTimeout(3000);
                                    const image = await takeScreenshot();

                                    compareSnapshot(image, 'tasks');
                                });

                                it('Add view', async() => {

                                    await openPage(getPageURL('page'));
                                    await page.waitForTimeout(3000);
                                    const image = await takeScreenshot();

                                    compareSnapshot(image, 'add-view');
                                });

                                it('Menu toggle', async() => {
                                    const menuButtonSelector = '.menu-button .dx-button';
                                    await openPage(getPageURL('profile'));
                                    await page.waitForSelector(menuButtonSelector);
                                    await page.click(menuButtonSelector);

                                    // NOTE: Wait for animation complete
                                    await page.waitForTimeout(3000);
                                    const image = await takeScreenshot();

                                    compareSnapshot(image, 'toggle');
                                });

                                it('User panel', async() => {
                                    await openPage(getPageURL('profile'));
                                    const isCompact = await page.$('.dx-toolbar-item-invisible .user-button');
                                    await page.click(isCompact ? '.dx-dropdownmenu-button' : '.user-button');
                                    // NOTE: Wait for animation complete
                                    await page.waitForTimeout(2000);
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

                                    await page.waitForTimeout(3000);
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
                                    await page.waitForTimeout(1000);
                                    await page.click('.dx-button-normal');
                                    await page.waitForSelector('.create-account-form');

                                    await hideScroll();

                                    await page.waitForTimeout(3000);
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
                                    await page.waitForTimeout(500);
                                    await page.waitForSelector('.reset-password-form');
                                    await page.waitForTimeout(3000);

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
                                        'const a = document.createElement("a");a.href="#/change-password/123";a.click()'
                                    );
                                    await page.waitForSelector('form');

                                    await hideScroll();
                                    await page.waitForTimeout(3000);

                                    const image = await takeScreenshot();

                                    compareSnapshot(image, 'change-password');
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};
