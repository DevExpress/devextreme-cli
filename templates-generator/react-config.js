module.exports = {
    sourcePath: 'packages/devextreme-cli/testing/sandbox/react/my-app/',
    targetPath: 'packages/devextreme-cli/templates/react/application/',
    sourceGlob: '**/*.{js,scss,json}',
    updateRules: [
        {
            glob: 'src/app-routes.js',
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
            glob: 'src/app-info.js',
            definitions: [{
                before: 'My App',
                after: '<%=project%>'
            }
            ],
        },
        {
            glob: 'src/app-navigation.js',
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
            glob: 'src/App.js',
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
            glob: 'src/themes/metadata.additional.json',
            definitions: [
                {
                    before: /"baseTheme": ".*?"/,
                    after: '"baseTheme": "material.orange.dark"'
                }
            ]
        },
        {
            glob: 'src/themes/metadata.base.json',
            definitions: [
                {
                    before: /"baseTheme": ".*?"/,
                    after: '"baseTheme": "material.orange.light"'
                }
            ]
        },
        {
            glob: 'src/themes/metadata.**.json',
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
            glob: 'src/pages/**/*.*',
            definition: {
                sourcePath: 'src/pages',
                targetPath: 'packages/devextreme-cli/templates/react/sample-pages'
            }
        },
        {
            glob: 'devextreme.json',
            definition: {
                sourcePath: '',
                targetPath: 'packages/devextreme-cli/templates/react/application/'
            }
        }
    ],
    ignoreList: [
        'src/themes/generated/*.*',
        'node_modules/**/*.*',
        'public/*.*',
        'src/App.test.js',
        'src/setupTests.js',
        'src/serviceWorker.js',
        'src/index.js',
        'package.json',
        'package-lock.json'
    ]
};
