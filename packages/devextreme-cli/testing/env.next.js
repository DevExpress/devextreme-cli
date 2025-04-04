const fs = require('fs');
const { EOL } = require('os');
const path = require('path');

const rimraf = require('./utils/rimraf-async');
const runCommand = require('../src/utility/run-command');
const { depsVersionTagOptionName } = require('../src/utility/extract-deps-version-tag');
const classify = require('../src/utility/string').classify;

function getConfig({ engine, template, fileExtension, templateExtension, transpiler }) {
    const appName = 'my-app';
    const sandboxPath = path.join(process.cwd(), `./testing/sandbox/${engine}`);
    const appPath = path.join(sandboxPath, appName);
    const appLayoutPath = path.join(sandboxPath, appName, `src/Content.${templateExtension}`);

    const config = {
        engine: engine,
        appPath: appPath,
        deployPath: path.join(appPath, 'dist'),
        npmArgs: ['run', 'build'],
        fileExtension,
    };

    config.createApp = async(depsVersionTag) => {
        await rimraf(sandboxPath);
        fs.mkdirSync(sandboxPath, { recursive: true });

        const additionalArguments = depsVersionTag && [`--${depsVersionTagOptionName} ${depsVersionTag}`] || [];
        await runCommand('node', [
            path.join(process.cwd(), './index.js'),
            'new',
            'next-app',
            `--template=${template}`,
            '--layout=side-nav-outer-toolbar',
            ...additionalArguments
        ], {
            cwd: sandboxPath,
            forceNoCmd: true
        });

        await runCommand('node', [
            path.join(process.cwd(), './index.js'),
            'add',
            'view',
            'new-page'
        ], {
            cwd: appPath,
            forceNoCmd: true
        });

        fs.writeFileSync(path.join(appPath, '.env'), 'SKIP_PREFLIGHT_CHECK=true' + EOL + 'BROWSER=none');
    };

    config.setLayout = (layoutName) => {
        const regexToFind = /SideNav\w+Toolbar as SideNavBarLayout/g;
        const newSubStr = `${classify(layoutName)} as SideNavBarLayout`;
        const data = fs.readFileSync(appLayoutPath, 'utf8');
        const result = data.replace(regexToFind, newSubStr);
        fs.writeFileSync(appLayoutPath, result, 'utf8');
    };

    return config;
}


const nextJs = {
    ...getConfig({
        engine: 'react',
        template: 'javascript',
        templateExtension: 'jsx',
        fileExtension: 'jsx',
        transpiler: 'babel',
    }),
};

const nextTs = {
    ...getConfig({
        engine: 'react-ts',
        template: 'typescript',
        templateExtension: 'tsx',
        fileExtension: 'ts',
        transpiler: 'babel',
    })
};


module.exports = {
    nextJs,
    nextTs,
};
