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

# Modifying Templates

In order to make a change to the template you need:
1.generate testing applications in `testing/sandbox`;
2.modify it's files and check its;
3.run the update command.
It moves the changes from the generated application in `testing/sandbox` to the template in `templates` according to the framework.

## Run Auto-Updating Templates for Existing Applications

```sh
npm run update-template
```

## Auto-Updating All the Frameworks

```sh
npm run update-template -- -p angular
npm run update-template -- -p vue
npm run update-template -- -p react
```
