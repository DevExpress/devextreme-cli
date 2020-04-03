module.exports = {
    sourcePath: 'packages/devextreme-cli/testing/sandbox/vue/my-app/',
    targetPath: 'packages/devextreme-cli/templates/vue/',
    sourceGlob: '**/*.{js,scss,json,vue}',
    ignoreList: [
        '{node_modules,public,src/themes/generated}/**/*.*',
        'src/{App.test,setupTests,serviceWorker,index}.js',
        'src/components/HelloWorld.vue',
        '{package,package-lock}.json',
        'babel.config.js'
    ],
    replaceRules: [
        {
            glob: 'src/themes/metadata.additional.json',
            definitions: [
                {
                    before: /"baseTheme": "[^"]*"/,
                    after: '"baseTheme": "material.orange.dark"'
                }
            ]
        },
        {
            glob: 'src/themes/metadata.base.json',
            definitions: [
                {
                    before: /"baseTheme": "[^"]*"/,
                    after: '"baseTheme": "material.orange.light"'
                }
            ]
        },
        {
            glob: 'src/themes/metadata.*.json',
            definitions: [
                {
                    before: /"items": \[[^\]]*]/,
                    after: '"items": []'
                }
            ]
        },
        {
            glob: 'src/app-info.js',
            definitions: [
                {
                    before: 'My App',
                    after: '<%=project%>'
                }
            ],
        },
        {
            glob: 'src/app-navigation.js',
            definitions: [
                {
                    before: 'export default [',
                    after: 'export default [<%=^empty%>'
                },
                {
                    before: '];',
                    after: '<%=/empty%>];'
                }
            ]
        },
        {
            glob: 'src/router.js',
            definitions: [
                {
                    before: 'import Home',
                    after: '<%=^empty%>import Home'
                },
                {
                    before: /import defaultLayout[^;]*/,
                    after: '<%=/empty%>import defaultLayout from "./layouts/<%=layout%>"'
                },
                {
                    before: 'routes: [',
                    after: 'routes: [<%=^empty%>'
                },
                {
                    before: /},\n\s+\n/,
                    after: '},<%=/empty%>\n    <%=#empty%>{\n      path: "/",\n      components: {\n        layout: defaultLayout\n      }\n    },<%=/empty%>\n'
                },
                {
                    before: /}\n\s+\n/,
                    after: '}<%=/empty%>\n    <%=#empty%>{\n      path: "*",\n      redirect: "/"\n    }<%=/empty%>\n'
                },
                {
                    before: /".\/views\/login-form"\)\n\s+}\n\s+\},/,
                    after: '"./views/login-form")\n      }\n    },<%=^empty%>'
                }
            ]
        }
    ],
    removeRules: [
        {
            glob: 'src/main.js',
            definitions: [
                'import \'devextreme/dist/css/dx.common.css\';\n',
                'import \'./themes/generated/theme.base.css\';\n',
                'import \'./themes/generated/theme.additional.css\';\n',
            ]
        }
    ],
    moveRules: [
        {
            glob: 'src/{!(views)/*.*,views/login-form.vue,*.*}',
            definition:
            {
                sourcePath: '',
                targetPath: 'packages/devextreme-cli/templates/vue/application/'
            }
        },
        {
            glob: 'devextreme.json',
            definition:
            {
                sourcePath: '',
                targetPath: 'packages/devextreme-cli/templates/vue/application/'
            }
        },
        {
            glob: 'src/views/**/*.*',
            definition:
            {
                sourcePath: 'src/views/',
                targetPath: 'packages/devextreme-cli/templates/vue/sample-pages/'
            }
        }
    ]
};
