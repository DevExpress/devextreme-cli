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
                    before: /\[(.*?)\];/s,
                    after: '[<%=^empty%>$1<%=/empty%>];'
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
                    before: /(import defaultLayout)[^;]*/,
                    after: '<%=/empty%>$1 from "./layouts/<%=layout%>"'
                },
                {
                    before: /\[\s+/,
                        after: `[
<%=#empty%>{
      path: "*",
      redirect: "/"
    },<%=/empty%>
    <%=^empty%>
    `
            },
                {
                    before: /\[[^{*]/,
                    after: `[<%=#empty%>
    {
      path: "/",
      components: {
        layout: defaultLayout
      }
    },<%=/empty%>
    `
                },
                {
                    before: /(".\/views\/login-form"\)\n\s+}\n\s+\},)/,
                    after: '$1<%=^empty%>'
                },
                {
                    before: /(path: "\*"[^}]*home[^}]*})/,
                    after: '$1<%=/empty%>'
                },
                {
                    before: /},([^}]*\/login-form",)/,
                    after:'},<%=/empty%>$1'
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
