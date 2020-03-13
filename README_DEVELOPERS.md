# Testing

To run tests for all target frameworks, use the following command:

```sh
$ npm run test-local
```

This script creates test applications in the `testing/sandbox` folder, starts a web server per framework, and runs the snapshot tests.

You can find test results in the following folders:

- `packages/devextreme-cli/testing/__tests__/__image_snapshots__` - reference snapshots
- `packages/devextreme-cli/testing/__tests__/__diff_snapshots__` - diff snapshots for failed tests
- `packages/devextreme-cli/testing/sandbox/logs` - server logs for each framework

## Run Tests for Existing Test Applications

```sh
npm run test-dev
```

## Run Tests for an Individual Framework

```sh
npm run test-local -- -- -t angular
npm run test-local -- -- -t vue
npm run test-local -- -- -t react
```
