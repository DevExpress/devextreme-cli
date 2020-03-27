module.exports = {
    sourcePath: 'packages/devextreme-cli/testing/sandbox/angular/my-app/',
    targetPath: 'packages/devextreme-schematics/',
    sourceGlob: '**/*.{js,scss,json,html,ts}',
    updateRules: [
        {
            glob: 'src/themes/metadata.base.json',
            definitions: [
                {
                    before: /"baseTheme": "[^]*?"/,
                    after: '"baseTheme": "material.orange.light"'
                }
            ]
        },
        {
            glob: 'src/themes/metadata.additional.json',
            definitions: [
                {
                    before: /"baseTheme": "[^]*?"/,
                    after: '"baseTheme": "material.orange.dark"'
                }
            ]
        },
        {
            glob: 'src/themes/**/*.*',
            definitions: [
                {
                    before: /"items": \[[^]*?\]/s,
                    after: '"items": []'
                },
                {
                    before: /"assetsBasePath": "[^]*?"/,
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
                    before: /export const navigation = \[[^]*?\];/s,
                    after: 'export const navigation = [];'
                }
            ]
        },
        {
            glob: 'src/app/shared/components/side-navigation-menu/side-navigation-menu.component.ts',
            definitions: [
                {
                    before: /\(DxTreeViewComponent[^]*?\)/,
                    after: '(DxTreeViewComponent<% if(requireStaticFlag) { %>, { static: true }<% } %>)'
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
                    before:'import { AuthGuardService } from \'./shared/services\';\n',
                    after:'import { AuthGuardService } from \'./shared/services\';\r\n'
                },
                {
                    before: /const routes: Routes = \[[^]*?\];/s,
                    after: 'const routes: Routes = [\r\n  {\r\n    path: \'login-form\',\r\n    component: LoginFormComponent,\r\n    canActivate: [ AuthGuardService ]\r\n\  }\r\n];'
                },
                {
                    before: ', {useHash: true}), DxDataGridModule, DxFormModule',
                    after: ')'
                },
                {
                    before: /exports: \[RouterModule\],[^]*?\}\)/s,
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
        '{src/{themes/generated,environments},node_modules/}/**/*.*',
        '{e2e/tsconfig,package-lock,package,angular,tsconfig.app,tsconfig.spec,tsconfig,tslint}.json',
        'src/{polyfills,test,app/app.module,main}.ts',
        'src/{dx-styles,styles}.scss',
        '{e2e/protractor.conf,karma.conf}.js',
        'src/index.html'
    ]
};
