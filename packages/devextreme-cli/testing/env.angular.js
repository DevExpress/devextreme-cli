const fs = require('fs');
const path = require('path');

const packageManager = require('../src/utility/package-manager');
const rimraf = require('./utils/rimraf-async');
const runCommand = require('../src/utility/run-command');
const { depsVersionTagOptionName } = require('../src/utility/extract-deps-version-tag');

const appName = 'my-app';
const sandboxPath = path.join(process.cwd(), './testing/sandbox/angular');
const appPath = path.join(sandboxPath, appName);
const schematicsDirectory = '../../../../devextreme-schematics';
const schematicsPath = path.join(sandboxPath, schematicsDirectory);
const appComponentTemplatePath = path.join(appPath, 'src/app/app.component.html');
const appComponentPath = path.join(appPath, 'src/app/app.component.ts');

async function prepareSchematics() {
    await packageManager.runInstall({
        cwd: schematicsPath
    });

    await packageManager.run(['run', 'build'], {
        cwd: schematicsPath
    });
}

exports.engine = 'angular';
exports.appPath = appPath;
exports.deployPath = path.join(appPath, 'dist', 'my-app', 'browser');
// disable optimization due to https://github.com/angular/angular-cli/issues/20760
exports.npmArgs = ['run', 'build', '--', '--configuration', 'development'];
exports.fileExtension = 'ts';

exports.createApp = async(depsVersionTag) => {
    await rimraf(sandboxPath);
    fs.mkdirSync(sandboxPath, { recursive: true });

    await prepareSchematics();
    const additionalArguments = depsVersionTag && [`--${depsVersionTagOptionName} ${depsVersionTag}`] || [];
    await runCommand('node', [
        path.join(process.cwd(), './index.js'),
        'new',
        'angular-app',
        '--layout=side-nav-outer-toolbar',
        `--c=${schematicsDirectory}`,
        ...additionalArguments
    ], {
        cwd: sandboxPath,
        forceNoCmd: true
    });

    await runCommand('node', [
        path.join(process.cwd(), './index.js'),
        'add',
        'view',
        'new-page',
        `--c=${schematicsDirectory}`,
        ...additionalArguments
    ], {
        cwd: appPath,
        forceNoCmd: true
    });
};

exports.setLayout = (layoutName) => {
    const layoutClassName = layoutName === 'side-nav-outer-toolbar'
        ? 'SideNavOuterToolbarComponent'
        : 'SideNavInnerToolbarComponent';

    [
        {
            filePath: appComponentTemplatePath,
            regexp: /app-side-nav-\w+-toolbar/g,
            replacement: `app-${layoutName}`,
        },
        {
            filePath: appComponentPath,
            regexp: /SideNav\w+ToolbarComponent/,
            replacement: layoutClassName,
        }
    ].forEach(({ filePath, regexp, replacement }) => {
        const data = fs.readFileSync(filePath, 'utf8');
        const result = data.replace(regexp, replacement);
        fs.writeFileSync(filePath, result, 'utf8');
    });

};
