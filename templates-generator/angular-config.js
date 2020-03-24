module.exports = {
    sourcePath: 'packages/devextreme-cli/testing/sandbox/angular/my-app/',
    targetPath: 'packages/devextreme-schematics/',
    sourceGlob: '**/*.{js,scss,json,html,ts}',
    updateRules: [
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
            glob: 'src/themes/metadata.additional.json',
            definitions: [
                {
                    before: /"baseTheme": ".*?"/,
                    after: '"baseTheme": "material.orange.dark"'
                }
            ]
        },
        {
            glob: 'src/themes/**/*.*',
            definitions: [
                {
                    before: /"items":\s+\[[^]*?\]/,
                    after: '"items": []'
                },
                {
                    before: '"assetsBasePath": "../',
                    after: '"assetsBasePath": "<%= path %>'
                }
            ]
        },
        {
            glob: 'src/themes/**/*.*',
            definitions: [
                {
                    before: /"items":\s+\[[^]*?\]/,
                    after: '"items": []'
                },
                {
                    before: /"assetsBasePath": ".*?"/,
                    after: '"assetsBasePath": "<%= path %>../../node_modules/devextreme/dist/css/"'
                }
            ]
        },
        {
            glob: 'devextreme.json',
            definitions: [
                {
                    before: /"applicationEngine": ".*?"/,
                    after: '"applicationEngine": "<%= engine %>"'
                },
                {
                    before: /"outputFile": "src/g,
                    after: '"outputFile": "<%= sourcePath %>'
                },
                {
                    before: /"inputFile": "src/g,
                    after: '"inputFile": "<%= sourcePath %>'
                }
            ]
        },
        {
            glob: 'src/app/shared/services/app-info.service.ts',
            definitions: [
                {
                    before: 'My App',
                    after: '<%= title %>'
                }
            ]
        },
        {
            glob: 'e2e/src/app.e2e-spec.ts',
            definitions: [
                {
                    before: 'My App',
                    after: '<%= title %>'
                }
            ], 
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
            glob: 'components/side-navigation-menu/side-navigation-menu.component.ts',
            definitions: [
                {
                    before: /@ViewChild\([^\)]*?/,
                    after: '@ViewChild(DxTreeViewComponent, { static: true })'
                }
            ]
        },
        {
            glob: 'src/app/app-navigation.ts',
            definitions: [
                {
                    before: /export const navigation =\s+\[[\s\S]*?\];/,
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
                    before: /import { HomeComponent } from '.\/pages\/home\/home.component';[\r\n]/,
                    after: ''
                },
                {
                    before: /import { ProfileComponent } from \'.\/pages\/profile\/profile.component\';[\r\n]/,
                    after: ''
                },
                {
                    before: /import { DisplayDataComponent } from \'.\/pages\/display-data\/display-data.component\';[\r\n]/,
                    after: ''
                },
                {
                    before: /import { DxDataGridModule, DxFormModule } from \'devextreme-angular\';[\r\n][\r\n]/,
                    after: ''
                },
                {
                    before: /const routes: Routes =\s+\[[\s\S]*?\];/,
                    after: 'const routes: Routes = [\n  {\n    path: \'login-form\',\n    component: LoginFormComponent,\n    canActivate: [ AuthGuardService ]\n\  }\n];'
                },
                {
                    before: /imports: [RouterModule.forRoot(routes[\s\S]*?]/,
                    after: 'imports: [RouterModule.forRoot(routes)]'
                },
                {
                    before: /exports: \[RouterModule\],[\s\S]*?\}\)/,
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
                sourcePath: 'src/themes/',
                targetPath: 'packages/devextreme-schematics/src/add-layout/files/src/themes/'
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
            glob: 'src/app/layouts/**/*.*',
            definition:
            {
                sourcePath: 'src/app/',
                targetPath: 'packages/devextreme-schematics/src/add-layout/files/src/app/'
            }
        },
        {
            glob: 'src/app/shared/**/*.*',
            definition:
            {
                sourcePath: 'src/app/',
                targetPath: 'packages/devextreme-schematics/src/add-layout/files/src/app/'
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
                sourcePath: 'src/app/',
                targetPath: 'packages/devextreme-schematics/src/add-layout/files/src/app/'
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
