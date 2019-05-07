const puppeteer = require('puppeteer');

module.exports = (options) => {
    let browser;

    beforeAll(async() => {
        browser = await puppeteer.launch();
    });

    it('home view', async() => {
        const page = await browser.newPage();
        await page.goto(options.appPath);
        const image = await page.screenshot();

        expect(image).toMatchImageSnapshot({
            customSnapshotIdentifier: 'app-template-home'
        });
    });

    afterAll(async() => {
        await browser.close();
    });
};
