module.exports = {
    sourcePath: 'packages/devextreme-cli/testing/sandbox/angular/my-app/',
    targetPath: 'packages/devextreme-schematics/',
    sourceGlob: '**/*.{js,scss,json,html,ts}',
    updateRules: [
        {
            glob: 'src/themes/metadata.base.json',
            definitions: [
                {
                    before: /"baseTheme":\s+".*?"/,
                    after: '"baseTheme": "material.orange.light"'
                }
            ]
        },
        {
            glob: 'src/themes/metadata.additional.json',
            definitions: [
                {
                    before: /"baseTheme":\s+".*?"/,
                    after: '"baseTheme": "material.orange.dark"'
                }
            ]
        },
        {
            glob: 'src/themes/**/*.*',
            definitions: [
                {
                    before: /"items":\s+\[.*?\]/s,
                    after: '"items": []'
                },
                {
                    before: /"assetsBasePath":\s+".*?"/,
                    after: '"assetsBasePath": "<%= path %>../../node_modules/devextreme/dist/css/"'
                }
            ]
        },
        {
            glob: 'devextreme.json',
            definitions: [
                {
                    before: /"applicationEngine":\s+".*?"/,
                    after: '"applicationEngine": "<%= engine %>"'
                },
                {
                    before: /"outputFile":\s+"src/g,
                    after: '"outputFile": "<%= sourcePath %>'
                },
                {
                    before: /"inputFile":\s+"src/g,
                    after: '"inputFile": "<%= sourcePath %>'
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
                    before: /export\s+const\s+navigation\s+=\s+\[.*?\];/s,
                    after: 'export const navigation = [];'
                }
            ]
        },
        {
            glob: 'src/app/shared/components/side-navigation-menu/side-navigation-menu.component.ts',
            definitions: [
                {
                    before: /@ViewChild\(DxTreeViewComponent.*?\)/,
                    after: '@ViewChild(DxTreeViewComponent<% if(requireStaticFlag) { %>, { static: true }<% } %>)'
                }
            ]
        },
        {
            glob: 'src/app/app-routing.module.ts',
            definitions: [
                {
                    before: /import\s+{\s+HomeComponent\s+}\s+from\s+'.\/pages\/home\/home.component';[\r\n]/,
                    after: ''
                },
                {
                    before: /import\s+{\s+ProfileComponent\s+}\s+from\s+\'.\/pages\/profile\/profile.component\';[\r\n]/,
                    after: ''
                },
                {
                    before: /import\s+{\s+DisplayDataComponent\s+}\s+from\s+\'.\/pages\/display-data\/display-data.component\';[\r\n]/,
                    after: ''
                },
                {
                    before: /import\s+{\s+DxDataGridModule,\s+DxFormModule\s+}\s+from\s+\'devextreme-angular\';[\r\n][\r\n]/,
                    after: ''
                },
                {
                    before:'import { AuthGuardService } from \'./shared/services\';\n',
                    after:'import { AuthGuardService } from \'./shared/services\';\r\n'
                },
                {
                    before: /const\s+routes:\s+Routes\s+=\s+\[.*?\];/s,
                    after: 'const routes: Routes = [\r\n  {\r\n    path: \'login-form\',\r\n    component: LoginFormComponent,\r\n    canActivate: [ AuthGuardService ]\r\n\  }\r\n];'
                },
                {
                    before: /imports:\s+\[RouterModule.forRoot\(routes.*?\]/,
                    after: 'imports: [RouterModule.forRoot(routes)]'
                },
                {
                    before: /exports:\s+\[RouterModule\],.*?\}\)/s,
                    after: 'exports: [RouterModule]\r\n})' 
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
            glob: 'src/themes/**/*.*',
            definition:
            {
                sourcePath: '',
                targetPath: 'packages/devextreme-schematics/src/add-layout/files/'
            }
        },
        {
            glob: 'devextreme.json',
            definition:
            {
                sourcePath: '',
                targetPath: 'packages/devextreme-schematics/src/add-layout/files/'
            }
        },
        {
            glob: 'e2e/**/*.*',
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
        },
        {
            glob: 'src/app/**/*.*',
            definition:
            {
                sourcePath: '',
                targetPath: 'packages/devextreme-schematics/src/add-layout/files/'
            }
        }
    ],
    ignoreList: [
        'e2e/tsconfig.json',
        'src/themes/generated/**/*.*',
        'src/styles.scss',
        'src/environments/**/*.*',
        'src/dx-styles.scss',
        'src/polyfills.ts',
        'src/test.ts',
        'src/index.html',
        'src/app/app.module.ts',
        'src/e2e/protractor.conf.js',
        'src/main.ts',
        'node_modules/**/*.*',
        'karma.conf.js',
        'package-lock.json',
        'package.json',
        'angular.json',
        'tsconfig.app.json',
        'tsconfig.spec.json',
        'tsconfig.json',
        'tslint.json'
    ]
};
