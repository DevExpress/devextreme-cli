module.exports = {
    sourcePath: 'packages/devextreme-cli/testing/sandbox/react/my-app/',
    targetPath: 'packages/devextreme-cli/templates/react/application/',
    sourceGlob: '**/*.{js,scss,json}',
    updateInfo: [
        {
            pattern: '**/src/app-routes.js',
            definitions: [
                {
                    before: 'import',
                    after: '<%=^empty%>import'
                },
                {
                    before: '];',
                    after: '<%=/empty%>];'
                },
                {
                    before: 'export default [',
                    after: '<%=/empty%>export default [<%=^empty%>'
                }
            ],
        },
        {
            pattern: '**/src/app-info.js',
            definitions: [{
                before: 'My App',
                after: '<%=project%>'
            }
            ],
        },
        {
            pattern: '**/src/app-navigation.js',
            definitions: [
                {
                    before: '= [',
                    after: '= [<%=^empty%>'
                },
                {
                    before: '];',
                    after: '<%=/empty%>];'
                }
            ]
        },
        {
            pattern: '**/src/App.js',
            definitions: [
                {
                    before: 'SideNavOuterToolbar',
                    after: '<%=layout%>'
                },
                {
                    before: 'SideNavInnerToolbar',
                    after: '<%=layout%>'
                },
                {
                    before: 'import \'devextreme/dist/css/dx.common.css\';\n',
                    after: ''
                },
                {
                    before: 'import \'./themes/generated/theme.base.css\';\n',
                    after: ''
                },
                {
                    before: 'import \'./themes/generated/theme.additional.css\';\n',
                    after: ''
                },
                {
                    before: '))}',
                    after: '))}<%=^empty%>'
                },
                {
                    before: '<Redirect to={\'/home\'} />',
                    after: '<Redirect to={\'/home\'} /><%=/empty%>'
                }
            ]
        },
        {
            pattern: '**/themes/metadata.additional.json',
            definitions: [
                {
                    before: /"baseTheme": ".*?"/,
                    after: '"baseTheme": "material.orange.dark"'
                }
            ]
        },
        {
            pattern: '**/themes/metadata.base.json',
            definitions: [
                {
                    before: /"baseTheme": ".*?"/,
                    after: '"baseTheme": "material.orange.light"'
                }
            ]
        },
        {
            pattern: '**/themes/metadata.**.json',
            definitions: [
                {
                    before: /"items":\s+\[[^]*?\]/,
                    after: '"items": []'
                }
            ]
        }
    ],
    moveRules: [
        {
            pattern: '**/src/pages/**/*.*',
            definition: {
                sourcePath: 'src/pages',
                targetPath: 'packages/devextreme-cli/templates/react/sample-pages'
            }
        },
        {
            pattern: '**/devextreme.json',
            definition: {
                sourcePath: '',
                targetPath: 'packages/devextreme-cli/templates/react/application/'
            }
        }
    ],
    ignoreList: [
        '**/themes/generated/**/*.*',
        '**/src/App.test.js',
        '**/src/setupTests.js',
        '**/src/serviceWorker.js',
        '**/src/index.js',
        '**/node_modules/**/*.*',
        '**/public/**/*.*',
        'package.json',
        'package-lock.json'
    ]
};
