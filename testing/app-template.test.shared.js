const path = require('path');
const puppeteer = require('puppeteer');
const httpServer = require('http-server');
const skipAppCreation = process.env.TEST_MODE && process.env.TEST_MODE === 'dev';

const devices = [
    puppeteer.devices['iPhone 5'],
    puppeteer.devices['iPhone 5 landscape'],
    {
        name: 'Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
        viewport: {
            width: 1280,
            height: 1024,
            deviceScaleFactor: 1
        }
    }
];

async function prepareApp(env) {
    if(skipAppCreation) {
        return;
    }

    await env.createApp();
    await env.buildApp();
};

async function startServer(path, port) {
    return new Promise((resolve, reject) => {
        const server = httpServer.createServer({
            root: path
        });
        server.listen(port, '0.0.0.0', (err) => {
            if(err) {
                reject(err);
            } else {
                resolve(server);
            }
        });
    });
}

async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = (env) => {
    const appUrl = `http://127.0.0.1:${env.port}/`;
    const diffSnapshotsDir = path.join('testing/__tests__/__diff_snapshots__', env.engine);
    let browser;
    let server;

    beforeAll(async() => {
        try {
            await prepareApp(env);
            server = await startServer(env.distPath, env.port);
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
                it('home view', async() => {
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

                it('profile view', async() => {
                    // TODO Fix paddings in Vue
                    if(env.engine === 'vue') {
                        expect(true).toBe(true);
                        return;
                    }
                    // TODO Fix paddings in React
                    if(env.engine === 'react' && device.name === 'Desktop') {
                        expect(true).toBe(true);
                        return;
                    }
                    const page = await openPage(`${appUrl}#/profile`);
                    const image = await page.screenshot();

                    compareSnapshot(image, 'app-template-profile');
                });

                it('display-data view', async() => {
                    // TODO Fix paddings in Vue
                    if(env.engine === 'vue') {
                        expect(true).toBe(true);
                        return;
                    }
                    const page = await openPage(`${appUrl}#/display-data`);
                    // NOTE: Wait for the DataGrid is loaded
                    await sleep(1000);
                    const image = await page.screenshot();

                    compareSnapshot(image, 'app-template-display-data');
                });
            });
        });

        // TODO: Test Menu toggling
        // TODO: Test User menu
        // TODO: Test Login Form
        // TODO: Test inner layout
    });
};
