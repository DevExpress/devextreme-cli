# Testing
To run tests for all target frameworks use command:
```sh
$ npm run test
```
Test applications will be created in `testing/sandbox` folder. Script will run web server for each framework and perform snapshot testing.
Etalon images are located in `testing/__tests__/__image_snapshots__` folder.
Diff snapshots for failed tests can be found in `testing/__tests__/__diff_snapshots__` directory.

Web server logs for each framework are stored in *logs* folder: `testing/sanbox/logs`.

### Run tests for already created applications
To speed up local development and testing it is possible to run tests for already created applications:
```sh
npm run test-dev
```

### Specify target framework
To run tests for a separate target framework use `-t` flag. The following command runs only React tests:
```sh
npm run test -t react
```
