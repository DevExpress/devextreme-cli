# Testing

## Build docker image 
```sh
$ lerna run docker:build
```

## Run docker image with browser
```sh
$ lerna run docker:run
```

## Run tests 

To run tests for all target frameworks, use the following command:

```sh
$ npm run test
```

This script creates test applications in the `testing/sandbox` folder, starts a web server for each framework, and runs the snapshot tests.

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
npm run test -- -- -t angular
npm run test -- -- -t vue
npm run test -- -- -t react
```

## Replace etalon

To replace etalon image just remove it from `packages/devextreme-cli/testing/__tests__/__image_snapshots__` folder and run tests again

# Modify an Application Template

If you need to modify an application template, we recommend that you create a real application based on this template and modify this application instead. This is easier because a real application can be run, and you can see how your modifications affect it, which would not be possible if you were to modify the template directly.

To modify an application template, follow these instructions:

1. Generate an application based on the template in the `testing/sandbox` folder.
2. Modify the application as required.
3. Run a script that updates templates for all frameworks:

```sh
npm run update-template
```
... or a script that updates the template for an individual framework:

```sh
npm run update-template -- -p angular
npm run update-template -- -p vue
npm run update-template -- -p react
```

## Auto-Updating Templates for All the Frameworks

```sh
npm run update-template
```

## Auto-Updating Templates for a Specific Framework

```sh
npm run update-template -- -p angular
npm run update-template -- -p vue
npm run update-template -- -p react
```
