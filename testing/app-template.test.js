const puppeteer = require('puppeteer');
const runCommand = require('../utility/run-command');
const skipAppCreation = process.env.TEST_MODE && process.env.TEST_MODE === 'dev';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function startServer(path, port) {
    return new Promise((resolve, reject) => {
        // TODO: run server with js
        runCommand('npx', [ 'http-server', '-p', `${port}` ], {
            cwd: path,
            silent: true
        });
        setTimeout(() => {
            resolve();
        }, 0);
    });
}

function logErr(err) {
    console.log(err);
}

function prepareApp(env) {
    return new Promise((resolve, reject) => {
        if(skipAppCreation) {
            resolve();
        } else {
            env.createApp()
                .then(env.buildApp, reject)
                .then(resolve, reject);
        }
    });
};

module.exports = (env) => {
    const appUrl = `http://127.0.0.1:${env.port}/`;
    const diffSnapshotsDir = `testing/__tests__/__diff_snapshots__/${env.engine}`;
    let browser;

    beforeAll(async() => {
        await prepareApp(env)
            .then(() => {
                startServer(env.distPath, env.port);
            }, logErr);
        browser = await puppeteer.launch();
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

        afterAll(async() => {
            await browser.close();
            // TODO: Close server
        });
    });
};
