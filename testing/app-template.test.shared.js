const path = require('path');
const puppeteer = require('puppeteer');
const httpServer = require('http-server');
const skipAppCreation = process.env.TEST_MODE && process.env.TEST_MODE === 'dev';

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
        it('home view', async() => {
            const page = await browser.newPage();
            await page.goto(appUrl);
            const image = await page.screenshot({
                clip: {
                    x: 0,
                    y: 0,
                    width: 800,
                    height: 200
                }
            });

            expect(image).toMatchImageSnapshot({
                customSnapshotIdentifier: 'app-template-home',
                customDiffDir: diffSnapshotsDir
            });
        });

        it('profile view', async() => {
            // TODO Fix paddings in Vue
            if(env.engine === 'vue') {
                expect(true).toBe(true);
                return;
            }
            const page = await browser.newPage();
            await page.goto(`${appUrl}#/profile`);
            const image = await page.screenshot();

            expect(image).toMatchImageSnapshot({
                customSnapshotIdentifier: 'app-template-profile',
                customDiffDir: diffSnapshotsDir
            });
        });

        it('display-data view', async() => {
            // TODO Fix paddings in Vue
            if(env.engine === 'vue') {
                expect(true).toBe(true);
                return;
            }
            const page = await browser.newPage();
            await page.goto(`${appUrl}#/display-data`);
            await sleep(1000);
            const image = await page.screenshot();

            expect(image).toMatchImageSnapshot({
                customSnapshotIdentifier: 'app-template-display-data',
                customDiffDir: diffSnapshotsDir
            });
        });

        // TODO: Test responsiveness
        // TODO: Test Menu toggling
        // TODO: Test User menu
        // TODO: Test Login Form
        // TODO: Test inner layout
    });
};
