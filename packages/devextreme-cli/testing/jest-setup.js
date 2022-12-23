// eslint runs from root and only looks at root package.json
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

jest.setTimeout(300000);
