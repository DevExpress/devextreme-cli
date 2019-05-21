// eslint runs from root and only looks at root package.json
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

jest.setTimeout(999999);
