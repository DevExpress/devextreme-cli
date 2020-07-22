module.exports = {
    sourcePath: 'packages/devextreme-cli/testing/sandbox/vue/my-app/',
    targetPath: 'packages/devextreme-cli/src/templates/vue/',
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
                    after: '[<%=^empty%>$1  <%=/empty%>];'
                }
            ]
        },
        {
            glob:'src/views/new-page.vue',
            definitions: [
                {
                    before:'new-page',
                    after:'<%=pageName%>'
                },
                {
                    before:/(<h2 class="content-block">)New Page(<\/h2>)/,
                    after:'$1<%=title%>$2'
                }
            ]
        },
        {
            glob: 'src/router.js',
            definitions: [
                {
                    before: /((import (Home|Profile|Tasks).*\n)+)/,
                    after: '<%=^empty%>$1<%=/empty%>'
                },
                {
                    before: /side-nav-(inner|outer)-toolbar/,
                    after: '<%=layout%>'
                },
                {
                    before: /routes: \[\s+/,
                    after: `routes: [<%=#empty%>
    {
      path: "/",
      components: {
        layout: defaultLayout
      }
    },<%=/empty%>
    `
                },
                {
                    before: /(\n\s+{\s+path: "\/home".*content: Tasks(\s+})+,)/s,
                    after: '<%=^empty%>$1<%=/empty%>'
                },
                {
                    before:`, 
    {
      path: "/new-page",
      name: "new-page",
      meta: { requiresAuth: true },
      components: 
      {
        layout: defaultLayout,
        content: NewPage
      }
    }`,
                    after:''
                },
                {
                    before: /(\n\s+{[^}]*redirect: "\/home"[^\]]*})\s+]/,
                    after: `<%=^empty%>$1<%=/empty%><%=#empty%>
    {
      path: "*",
      redirect: "/"
    }<%=/empty%>
  ]`
                },
                {
                    before: 'import NewPage from \'./views/new-page\';\n',
                    after:''
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
        },
        {
            glob: 'src/app-navigation.js',
            definitions: [
                `, 
  {
    text: 'New Page',
    path: '/new-page',
    icon: 'folder'
  }`
            ]
        }
    ],
    moveRules: [
        {
            glob: 'src/{!(views)/*.*,views/login-form.vue,*.*}',
            definition:
            {
                sourcePath: '',
                targetPath: 'packages/devextreme-cli/src/templates/vue/application/'
            }
        },
        {
            glob: 'devextreme.json',
            definition:
            {
                sourcePath: '',
                targetPath: 'packages/devextreme-cli/src/templates/vue/application/'
            }
        },
        {
            glob: 'src/views/!(new-page.vue)',
            definition:
            {
                sourcePath: 'src/views/',
                targetPath: 'packages/devextreme-cli/src/templates/vue/sample-pages/'
            }
        },
        {
            glob: 'src/views/new-page.vue',
            definition: {
                sourcePath: 'src/views/new-page.vue',
                targetPath: 'packages/devextreme-cli/src/templates/vue/page/page.vue'
            }
        }
    ]
};
