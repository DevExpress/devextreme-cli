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

## Generate Applications

```sh
npm run create-template
```

## Generate Applications for an Individual Framework

```sh
npm run create-template -- -- -e angular
npm run create-template -- -- -e react
npm run create-template -- -- -e vue-v2
npm run create-template -- -- -e vue-v3
```

## Lint Applications

```sh
npm run lint-template
```

## Lint Applications for an Individual Framework

```sh
npm run lint-template -- -- -e angular
npm run lint-template -- -- -e react
npm run lint-template -- -- -e react-ts
npm run lint-template -- -- -e vue-v2
npm run lint-template -- -- -e vue-v3
```

## Test Applications

```sh
npm run test-template
```

## Test Applications for an Individual Framework

```sh
npm run test-template -- -- -e angular
npm run test-template -- -- -e react
npm run test-template -- -- -e react-ts
npm run test-template -- -- -e vue-v2
npm run test-template -- -- -e vue-v3
```

## Run Tests for Existing Test Applications

```sh
npm run test-dev
```

## Run Tests for an Individual Framework

```sh
npm run test -- -- -t angular
npm run test -- -- -t react
npm run test -- -- -t react-ts
npm run test -- -- -t vue-v2
npm run test -- -- -t vue-v3
```

## Replace etalon

To replace etalon image just remove it from `packages/devextreme-cli/testing/__tests__/__image_snapshots__` folder and run tests again

# Modify an Application Template

Modifying an application template directly is not recommended. Instead, generate a real application based on this template and modify this application. This is easier because a real application can be run, and you can see how your modifications affect it. Follow these instructions:

1. Generate an application based on the template in the `testing/sandbox` folder.
2. Modify the application as required.
3. Run a script that updates templates for all frameworks:

    ```sh
    npm run update-template
    ```
    
    ... or a script that updates the template for an individual framework:

    ```sh
    npm run update-template -- -p angular
    npm run update-template -- -p react
    npm run update-template -- -p react-ts
    npm run update-template -- -p vue-v2
    npm run update-template -- -p vue-v3
    ```
