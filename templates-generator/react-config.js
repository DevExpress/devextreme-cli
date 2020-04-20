module.exports = {
    sourcePath: 'packages/devextreme-cli/testing/sandbox/react/my-app/',
    targetPath: 'packages/devextreme-cli/templates/react/application/',
    sourceGlob: '**/*.{js,scss,json}',
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
    ],
    replaceRules: [
        {
            glob: 'src/app-routes.js',
            definitions: [
                {
                    before: /import {([^}]*)} from '.\/pages'/,
                    after: '<%=^empty%>import {$1} from \'./pages\''
                },
                {
                    before: /(const routes = \[)/,
                    after: '<%=/empty%>$1<%=^empty%>'
                },
                {
                    before: '];',
                    after: '<%=/empty%>];'
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
            glob: 'src/Content.js',
            definitions: [
                {
                    before: /SideNav(Outer|Inner)Toolbar/,
                    after: '<%=layout%>'
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
                    before: /"baseTheme": "[^"]*?"/,
                    after: '"baseTheme": "material.orange.dark"'
                }
            ]
        },
        {
            glob: 'src/themes/metadata.base.json',
            definitions: [
                {
                    before: /"baseTheme": "[^"]*?"/,
                    after: '"baseTheme": "material.orange.light"'
                }
            ]
        },
        {
            glob: 'src/themes/metadata.*.json',
            definitions: [
                {
                    before: /"items":\s+\[[^\]]*?\]/,
                    after: '"items": []'
                }
            ]
        }
    ],
    removeRules: [
        {
            glob: 'src/App.js',
            definitions: [
                'import \'devextreme/dist/css/dx.common.css\';\n',
                'import \'./themes/generated/theme.base.css\';\n',
                'import \'./themes/generated/theme.additional.css\';\n',
            ]
        },
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
    ]
};
