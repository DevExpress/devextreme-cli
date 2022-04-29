module.exports = {
    sourcePath: 'packages/devextreme-cli/testing/sandbox/react-ts/my-app/',
    targetPath: 'packages/devextreme-cli/src/templates/react/application/',
    sourceGlob: '**/*.{tsx,ts,scss,json}',
    ignoreList: [
        'src/themes/generated/*.*',
        'src/pages/new-page/new-page.scss',
        'node_modules/**/*.*',
        'public/*.*',
        'build/**/*.*',
        'src/App.test.tsx',
        'src/setupTests.ts',
        'src/reportWebVitals.ts',
        'src/react-app-env.d.ts',
        'src/index.tsx',
        'package.json',
        'package-lock.json',
        'tsconfig.json',
    ],
    replaceRules: [
        {
            glob: ['**/*.ts*', '!**/types.ts*'],
            definitions: [
                {
                    before: /: string|: any|\?: string|import(.*?)types';|: [A-Z]\w+\[]| as any/g,
                    after: '<%=#isTypeScript%>$&<%=/isTypeScript%>'
                },
                {
                    before: /(?<before>\S)\!(?<after>(\.|\())/g,
                    after: '$<before><%=#isTypeScript%>!<%=/isTypeScript%>$<after>'
                },
                {
                    before: /\?\./g,
                    after: '<%=#isTypeScript%>?<%=/isTypeScript%>.'
                },
                {
                    before: /(?<type>: [A-Z](.*?))\)/g,
                    after: '<%=#isTypeScript%>$<type><%=/isTypeScript%>)'
                },
                {
                    before: /}(?<type> as [A-Z]\w+)/g,
                    after: '}<%=#isTypeScript%>$<type><%=/isTypeScript%>'
                },
                {
                    before: /\](?<type> as \[(.*?)\])/g,
                    after: ']<%=#isTypeScript%>$<type><%=/isTypeScript%>'
                },
                {
                    before: /(?<name>(useState|useRef|createContext))(?<type><(.*?)>)/g,
                    after: '$<name><%=#isTypeScript%>$<type><%=/isTypeScript%>'
                }
            ]
        },
        {
            glob: 'src/app-routes.tsx',
            definitions: [
                {
                    before: /(\nimport {([^}]*)} from '.\/pages';)/,
                    after: '<%=^empty%>$1<%=/empty%>'
                },
                {
                    before: /(const routes = \[)([^\]]*)(\])/,
                    after: '$1<%=^empty%>$2<%=/empty%>$3'
                }
            ],
        },
        {
            glob: 'src/app-info.tsx',
            definitions: [
                {
                    before: 'My App',
                    after: '<%=project%>'
                }
            ]
        },
        {
            glob: 'src/app-navigation.tsx',
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
            glob:'src/pages/new-page/new-page.tsx',
            definitions: [
                {
                    before:'new-page',
                    after:'<%=pageName%>'
                },
                {
                    before:/(<h2 className={'content-block'}>)[^<]*(<\/h2>)/,
                    after:'$1<%=title%>$2'
                }
            ]
        },
        {
            glob: 'src/Content.tsx',
            definitions: [
                {
                    before: /SideNav(Outer|Inner)Toolbar/,
                    after: '<%=layout%>'
                },
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
            glob: 'src/App.tsx',
            definitions: [
                'import \'devextreme/dist/css/dx.common.css\';\n',
                'import \'./themes/generated/theme.base.css\';\n',
                'import \'./themes/generated/theme.additional.css\';\n',
            ]
        },
        {
            glob: 'src/app-routes.tsx',
            definitions: [
                    ', NewPagePage'                   
            ]
        },
        {
            glob: 'src/app-navigation.tsx|src/app-routes.tsx',
            definitions: [
                /,\s+{[^}]*'\/new-page'[^}]*}/            
            ]
        },
        {
            glob:'src/pages/index.tsx',
            definitions: [
                'export { default as NewPagePage } from \'./new-page/new-page\';\n'
            ]
        },
    ],
    moveRules: [
        {
            glob: 'src/pages/!(new-page/new-page.tsx)',
            definition: {
                sourcePath: 'src/pages',
                targetPath: 'packages/devextreme-cli/src/templates/react/sample-pages'
            }
        },
        {
            glob: 'src/pages/new-page/new-page.tsx',
            definition: {
                sourcePath: 'src/pages/new-page/new-page.tsx',
                targetPath: 'packages/devextreme-cli/src/templates/react/page/page.tsx'
            }
        }
    ]
};