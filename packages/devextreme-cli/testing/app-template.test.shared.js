const path = require('path');
const ip = require('ip');
const getBrowser = require('./utils/puppeteer').getBrowser;

const { viewports, themes, layouts } = require('./constants');
const DevServer = require('./dev-server');

const defaultLayout = 'side-nav-outer-toolbar';

module.exports = (env) => {
    const appUrl = `http://${ip.address()}:8080/`;
    const diffSnapshotsDir = path.join('testing/__tests__/__diff_snapshots__', env.engine);

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
                                    timeout: 0,
                                    waitUntil: 'networkidle0',
                                    ...options
                                });
                                await page.waitFor('.with-footer', {
                                    // timeout: 0
                                });

                                return page;
                            }

                            async function logOut() {
                                const isCompact = await page.$('.dx-toolbar-item-invisible .user-button');
                                await page.click(isCompact ? '.dx-dropdownmenu-button' : '.user-button');
                                await page.waitFor('.dx-icon-runner', { timeout: 0 });
                                await page.click('.dx-icon-runner');
                                await page.waitFor('.login-header, .login-form', { timeout: 0 });
                            }

                            const customConfig = { threshold: 0.012 };
                            function compareSnapshot(image, name) {
                                expect(image).toMatchImageSnapshot({
                                    customDiffConfig: customConfig,
                                    customSnapshotIdentifier: `${layout}-${theme}-${viewportName}-${name}`,
                                    customDiffDir: diffSnapshotsDir,
                                    storeReceivedOnFailure: true
                                });
                            }

                            async function hideScroll() {
                                await page.evaluate(() => {
                                    // eslint-disable-next-line no-undef
                                    const scrollElement = document.getElementsByClassName('dx-scrollable-scroll')[0];
                                    scrollElement.style.transition = 'none';
                                    scrollElement.style.display = 'none';
                                    scrollElement.className += ' dx-state-invisible';
                                });
                                await page.waitFor(3000);
                            }

                            describe(`${viewportName}`, () => {
                                it('Home view', async() => {
                                    const page = await openPage(appUrl, { timeout: 5000 });
                                    await page.reload([{
                                        waitUntil: {
                                            networkidle0: 5000,
                                            networkidle2: 5000,
                                            domcontentloaded: true
                                        }
                                    }]);
                                    await page.waitFor(5000);

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

                                it('Tasks view', async() => {
                                    const page = await openPage(`${appUrl}#/tasks`);
                                    // NOTE: Wait for the DataGrid is loaded
                                    await page.waitFor('.dx-row-focused');
                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'tasks');
                                });

                                it('Add view', async() => {
                                    let pageUrl = 'new-page';
                                    if(env.engine === 'angular') {
                                        pageUrl = 'pages/' + pageUrl;
                                    }
                                    const page = await openPage(`${appUrl}#/${pageUrl}`);
                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'add-view');
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
                                    const page = await openPage(appUrl);
                                    await logOut();

                                    await hideScroll();

                                    const image = await page.screenshot();

                                    compareSnapshot(image, name);
                                });

                                it('Create account page', async() => {
                                    // NOTE: Test only once
                                    if(!isDefaultLayout) {
                                        return;
                                    }

                                    const page = await openPage(appUrl);
                                    await logOut();
                                    await page.click('.dx-button-normal');
                                    await page.waitFor('.create-account-form', { timeout: 0 });

                                    await hideScroll();

                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'create-account');
                                });

                                it('Reset password page', async() => {
                                    // NOTE: Test only once
                                    if(!isDefaultLayout) {
                                        return;
                                    }

                                    const page = await openPage(appUrl);
                                    await logOut();
                                    await page.click('a');
                                    await page.waitFor('form', { timeout: 0 });

                                    await hideScroll();

                                    const image = await page.screenshot();

                                    compareSnapshot(image, 'reset-password');
                                });

                                it('Change password page', async() => {
                                    // NOTE: Test only once
                                    if(!isDefaultLayout) {
                                        return;
                                    }

                                    const page = await openPage(appUrl);
                                    await logOut();
                                    await page.evaluate(
                                        'const a = document.createElement("a");a.href="#/change-password/123";a.click()'
                                    );
                                    await page.waitFor('form', { timeout: 0 });

                                    await hideScroll();

                                    const image = await page.screenshot();

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
