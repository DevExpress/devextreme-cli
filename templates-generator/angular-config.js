module.exports = {
    sourcePath: 'packages/devextreme-cli/testing/sandbox/angular/my-app/',
    targetPath: 'packages/devextreme-schematics/',
    sourceGlob: '**/*.{js,scss,json,html,ts}',
    updateRules: [
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
            glob: 'src/themes/metadata.additional.json',
            definitions: [
                {
                    before: /"baseTheme": "[^"]*"/,
                    after: '"baseTheme": "material.orange.dark"'
                }
            ]
        },
        {
            glob: 'src/themes/**/*.*',
            definitions: [
                {
                    before: /"items": \[[^\]]*]/s,
                    after: '"items": []'
                },
                {
                    before: /"assetsBasePath": "[^"]*"/,
                    after: '"assetsBasePath": "<%= path %>../../node_modules/devextreme/dist/css/"'
                }
            ]
        },
        {
            glob: 'devextreme.json',
            definitions: [
                {
                    before: 'angular',
                    after: '<%= engine %>'
                },
                {
                    before: /src/g,
                    after: '<%= sourcePath %>'
                }
            ]
        },
        {
            glob: '{src/app/shared/services/app-info.service.ts,e2e/src/app.e2e-spec.ts}',
            definitions: [
                {
                    before: 'My App',
                    after: '<%= title %>'
                }
            ]
        },
        {
            glob:'src/app/pages/home/home.component.html',
            definitions: [
                {
                    before: 'My App',
                    after: '<%= project %>'
                }
            ]
        },
        {
            glob: 'src/app/app-navigation.ts',
            definitions: [
                {
                    before: /export const navigation = \[.*?];/s,
                    after: 'export const navigation = [];'
                }
            ]
        },
        {
            glob: 'src/app/shared/components/side-navigation-menu/side-navigation-menu.component.ts',
            definitions: [
                {
                    before: /\(DxTreeViewComponent[^\]]*?\)/,
                    after: '(DxTreeViewComponent<% if(requireStaticFlag) { %>, { static: true }<% } %>)'
                }
            ]
        },
        {
            glob: 'src/app/app-routing.module.ts',
            definitions: [
                {
                    before: /import { HomeComponent } [^\n]*?\r?\n/,
                    after: ''
                },
                {
                    before: /import { ProfileComponent } [^\n]*?\r?\n/,
                    after: ''
                },
                {
                    before: /import { DisplayDataComponent } [^\n]*?\r?\n/,
                    after: ''
                },
                {
                    before: /import { DxDataGridModule, DxFormModule } [^\n]*?\r?\n/,
                    after: ''
                },
                {
                    before: /{\r?\n\s+path: 'display-data',\r?\n\s+component: DisplayDataComponent,\r?\n\s+canActivate: \[ AuthGuardService \]\r?\n\s+},\r?\n\s+/,
                    after: ''
                },
                {
                    before: /{\r?\n\s+path: 'profile',\r?\n\s+component: ProfileComponent,\r?\n\s+canActivate: \[ AuthGuardService \]\r?\n\s+},\r?\n\s+/,
                    after: ''
                },
                {
                    before: /{\r?\n\s+path: 'home',\r?\n\s+component: HomeComponent,\r?\n\s+canActivate: \[ AuthGuardService \]\r?\n\s+},\r?\n\s+/,
                    after: ''
                },
                {
                    before: /},\r?\n\s+{\r?\n\s+path: '\*\*',\r?\n\s+redirectTo: 'home',\r?\n\s+canActivate: \[ AuthGuardService \]\r?\n\s+/,
                    after: ''
                },
                {
                    before: ', {useHash: true}),',
                    after: ')'
                },
                {
                    before: ' DxDataGridModule, DxFormModule',
                    after: ''
                },
                {
                    before: /,\r?\n\s+declarations: [^\]]*?]/s,
                    after: '' 
                }
            ]
        },
        {
            glob: 'src/app/app.component.html',
            definitions: [
                {
                    before: /side-nav-inner-toolbar/g,
                    after: '<%= layout %>'
                }
            ]
        },
        {
            glob: 'src/app/app.component.ts',
            definitions: [
                {
                    before: 'app',
                    after: '<%= prefix %>'
                },
                {
                    before:/app.component/g,
                    after:'<%= name %>.component'
                },
                {
                    before:'AppComponent',
                    after:'<%= strings.classify(name) %>Component'
                }
            ]
        }
    ],
    moveRules: [
        {
            glob: 'src/app/pages/**/*.*',
            definition:
            {
                sourcePath: 'src/app/',
                targetPath: 'packages/devextreme-schematics/src/add-sample-views/files/'
            }
        },
        {
            glob: '{src/**/!(app.component).*,devextreme.json,e2e/**/*.*}',
            definition:
            {
                sourcePath: '',
                targetPath: 'packages/devextreme-schematics/src/add-layout/files/'
            }
        },
        {
            glob: 'src/app/app.component.{scss,ts,html}',
            definition:
            {
                sourcePath: 'src/app/app',
                targetPath: 'packages/devextreme-schematics/src/add-layout/files/src/app/__name__'
            }
        }
    ],
    ignoreList: [
        'node_modules/**/*.*',
        'src/{themes/generated,environments}/**/*.*',
        'src/{polyfills,test,app/app.module,main}.ts',
        'src/{dx-styles,styles}.scss',
        'src/index.html',
        'e2e/{tsconfig.json,protractor.conf.js}',
        '{package-lock,package}.json',
        'tsconfig.{app,spec}.json',
        'tsconfig.json',
        'angular.json',
        'tslint.json',
        'karma.conf.js'
    ]
};
