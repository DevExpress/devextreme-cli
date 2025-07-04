import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import {
  NodeDependencyType,
  addPackageJsonDependency,
  removePackageJsonDependency
} from '@schematics/angular/utility/dependencies';
import * as path from 'path';

import { modifyJSONFile } from '../utility/modify-json-file';

const collectionPath = path.join(__dirname, '../collection.json');

describe('layout', () => {
  const appOptions: any = {
    name: 'testApp',
    projectRoot: '',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'scss',
    skipTests: false,
    skipPackageJson: false,
    standalone: false
  };

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    version: '17.0.0'
  };

  const options: any = {
    layout: 'side-nav-outer-toolbar',
    resolveConflicts: 'override',
    globalNgCliVersion: '^17.2.0'
  };

  const angularSchematicsCollection = require.resolve('../../node_modules/@schematics/angular/collection.json');
  const schematicRunner = new SchematicTestRunner(
    '@schematics/angular',
    angularSchematicsCollection,
  );
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await schematicRunner.runSchematic('workspace', workspaceOptions);
    appTree = await schematicRunner.runSchematic('application', appOptions, appTree);
  });

  it('should add layout with override', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-layout', options, appTree);

    expect(tree.files)
      .toContain('/devextreme.json');
    expect(tree.files)
      .toContain('/src/app/app-navigation.ts');
    expect(tree.files)
      .toContain('/src/app/shared/components/header/header.component.ts');
    expect(tree.files)
      .toContain('/src/app/shared/components/login-form/login-form.component.ts');
    expect(tree.files)
      .toContain('/src/app/shared/components/side-navigation-menu/side-navigation-menu.component.ts');
    expect(tree.files)
      .toContain('/src/app/shared/services/app-info.service.ts');
    expect(tree.files)
      .toContain('/src/app/shared/services/auth.service.ts');
    expect(tree.files)
      .toContain('/src/app/shared/services/screen.service.ts');
    expect(tree.files)
      .toContain('/src/app/layouts/side-nav-outer-toolbar/side-nav-outer-toolbar.component.ts');
    expect(tree.files)
      .toContain('/src/app/layouts/side-nav-inner-toolbar/side-nav-inner-toolbar.component.ts');
    expect(tree.files)
      .toContain('/src/app/layouts/single-card/single-card.component.ts');
    expect(tree.files)
      .toContain('/src/themes/metadata.base.json');
    expect(tree.files)
      .toContain('/src/themes/metadata.additional.json');

    const devextremeConfigContent = tree.readContent('/devextreme.json');
    expect(devextremeConfigContent).toContain('"applicationEngine": "angular"');
    expect(devextremeConfigContent).toContain('"inputFile": "src/themes/metadata.additional.json"');
    expect(devextremeConfigContent).toMatch(/\n\s{2}\S/g);

    const componentContent = tree.readContent('/src/app/app.component.html');
    expect(componentContent).toContain('app-side-nav-outer-toolbar title="{{appInfo.title}}"');

    const stylesContent = tree.readContent('/src/dx-styles.scss');
    expect(stylesContent).toMatch(/html, body {/);

    const indexContent = tree.readContent('/src/index.html');
    expect(indexContent).toMatch(/<body class="dx-viewport">/);

    const angularContent = JSON.parse(tree.readContent('/angular.json'));
    const styles = angularContent.projects.testApp.architect.build.options.styles;

    expect(styles[0]).toBe('node_modules/devextreme/dist/css/dx.common.css');
    expect(styles[1]).toBe('src/themes/generated/theme.base.dark.css');
    expect(styles[2]).toBe('src/themes/generated/theme.base.css');
    expect(styles[3]).toBe('src/themes/generated/theme.additional.dark.css');
    expect(styles[4]).toBe('src/themes/generated/theme.additional.css');

    const appContent = tree.readContent('/src/app/app.component.ts');
    expect(appContent).toContain('import { DxHttpModule }');
    expect(appContent)
      .toContain('import { SideNavOuterToolbarComponent as SideNavToolbarComponent }');
    expect(appContent)
      .toContain(`import { AuthService, ScreenService, AppInfoService } from './shared/services';`);
    expect(appContent)
      .toContain('import { FooterComponent }');
    expect(appContent).toContain('templateUrl: \'./app.component.html\',');
    expect(appContent).toContain('styleUrls: [\'./app.component.scss\']');
    expect(appContent).toContain('selector: \'app-root\',');

    const navigationMenu = tree.readContent(
      '/src/app/shared/components/side-navigation-menu/side-navigation-menu.component.ts');
    expect(navigationMenu).toContain('@ViewChild(DxTreeViewComponent, { static: true })');
  });

  it('should add npm scripts', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-layout', options, appTree);
    const packageConfig = JSON.parse(tree.readContent('package.json'));
    expect(packageConfig.scripts['build-themes']).toBe('devextreme build');
    expect(packageConfig.scripts['postinstall']).toBe('npm run build-themes');
  });

  it('should set static flag', async () => {
    removePackageJsonDependency(appTree, '@angular/core');
    addPackageJsonDependency(appTree, {
      type: NodeDependencyType.Default,
      name: '@angular/core',
      version: '7.0.0'
    });

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-layout', options, appTree);
    const navigationMenu = tree.readContent(
      '/src/app/shared/components/side-navigation-menu/side-navigation-menu.component.ts');

    expect(navigationMenu).toContain('@ViewChild(DxTreeViewComponent, { static: true })');
  });

  it('should add npm scripts safely', async () => {
    modifyJSONFile(appTree, './package.json', config => {
      const scripts = config['scripts'];

      scripts['build-themes'] = 'prev value 1';
      scripts['postinstall'] = 'prev value 2';

      return config;
    });

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-layout', options, appTree);
    const packageConfig = JSON.parse(tree.readContent('package.json'));
    expect(packageConfig.scripts['origin-build-themes']).toBe('prev value 1');
    expect(packageConfig.scripts['origin-postinstall']).toBe('prev value 2');
    expect(packageConfig.scripts['build-themes']).toBe('npm run origin-build-themes && devextreme build');
    expect(packageConfig.scripts['postinstall']).toBe('npm run origin-postinstall && npm run build-themes');
  });

  it('should add angular/cdk dependency', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-layout', options, appTree);
    const packageConfig = JSON.parse(tree.readContent('package.json'));

    expect(packageConfig.dependencies['@angular/cdk']).toBeDefined();
  });

  it('should choose angular/cdk version such as angular/cli', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-layout', options, appTree);
    const packageConfig = JSON.parse(tree.readContent('package.json'));

    expect(packageConfig.dependencies['@angular/cdk']).toBe('~17.2.0');
  });

  it('should update budgets if updateBudgets option is true', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-layout', {
      ...options,
      updateBudgets: true
    }, appTree);

    const angularContent = JSON.parse(tree.readContent('/angular.json'));
    const budgets = angularContent.projects.testApp.architect.build.configurations.production.budgets;

    expect(budgets.length).toBe(2);
    expect(budgets[0]).toEqual({
      type: 'initial',
      maximumWarning: '4mb',
      maximumError: '7mb'
    });
  });

  it('should not update budgets if updateBudgets option is not defined or false', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-layout', options, appTree);

    const angularContent = JSON.parse(tree.readContent('/angular.json'));
    const budgets = angularContent.projects.testApp.architect.build.configurations.production.budgets;
    const defaultBudget = {
      type: 'initial',
      maximumWarning: '500kb',
      maximumError: '1mb'
    };

    expect(budgets.length).toBe(2);
    expect(budgets[0]).toEqual(defaultBudget);
  });

  it('should add layout without override', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    options.resolveConflicts = 'createNew';
    const tree = await runner.runSchematic('add-layout', options, appTree);

    expect(tree.files).toContain('/src/app/app1.component.ts');

    const componentContent = tree.readContent('/src/app/app1.component.html');
    expect(componentContent).toContain('app-side-nav-outer-toolbar title="{{appInfo.title}}"');

    const appContent = tree.readContent('/src/app/app.component.ts');
    expect(appContent).toMatch(/templateUrl: '.\/app.component.html',/);
    expect(appContent).toMatch(/styleUrl: '.\/app.component.scss'/);

    const newAppContent = tree.readContent('/src/app/app1.component.ts');
    expect(newAppContent).toMatch(/templateUrl: '.\/app1.component.html',/);
    expect(newAppContent).toMatch(/styleUrls: \['.\/app1.component.scss'\]/);
    expect(newAppContent).toContain(`import { AuthService, ScreenService, AppInfoService } from './shared/services';`);

    const appInfo = tree.readContent('/src/app/shared/services/app-info.service.ts');
    expect(appInfo).toContain(`return 'TestApp';`);
  });

  it('should add routing to layout', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-layout', options, appTree);

    expect(tree.files).toContain('/src/app/app.routes.ts');
    const routesContent = tree.readContent('/src/app/app.routes.ts');

    expect(routesContent)
      .toContain(`import { AuthGuardService } from './shared/services';`);
    const loginFormComponentMatch = routesContent.match(/\bLoginFormComponent\b/g);
    const resetPasswordFormComponentMatch = routesContent.match(/\bResetPasswordFormComponent\b/g);
    const createAccountFormComponentMatch = routesContent.match(/\bCreateAccountFormComponent\b/g);
    const changePasswordFormComponentMatch = routesContent.match(/\bChangePasswordFormComponent\b/g);
    expect(loginFormComponentMatch?.length).toBe(2);
    expect(resetPasswordFormComponentMatch?.length).toBe(2);
    expect(createAccountFormComponentMatch?.length).toBe(2);
    expect(changePasswordFormComponentMatch?.length).toBe(2);

    expect(routesContent)
      .toContain(`path: 'login-form'`);
    expect(routesContent)
      .toContain(`path: 'reset-password'`);
    expect(routesContent)
      .toContain(`path: 'create-account'`);
    expect(routesContent)
      .toContain(`path: 'change-password/:recoveryCode'`);
  });
  it('should use selected layout', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    options.layout = 'side-nav-inner-toolbar';
    options.resolveConflicts = 'override';
    const tree = await runner.runSchematic('add-layout', options, appTree);
    const content = tree.readContent('/src/app/app.component.html');

    expect(content).toContain('app-side-nav-inner-toolbar title="{{appInfo.title}}"');
  });

  it('should consider the `project` option', async () => {
    appTree = await schematicRunner.runSchematic('application', {
      ...appOptions,
      name: 'testApp2',
      projectRoot: 'projects/testApp2',
      standalone: false
    }, appTree);

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-layout', {
      ...options,
      project: 'testApp2'
    }, appTree);

    expect(tree.files)
      .toContain('/devextreme.json');
    expect(tree.files)
      .toContain('/projects/testApp2/src/themes/metadata.base.json');
  });

  it('should merge build commands in devextreme.json file', async () => {
    appTree = await schematicRunner.runSchematic('application', {
      ...appOptions,
      name: 'testApp2',
      prefix: 'app2',
      projectRoot: 'projects/testApp2',
      standalone: false
    }, appTree);

    const runner = new SchematicTestRunner('schematics', collectionPath);
    let tree = await runner.runSchematic('add-layout', options, appTree);
    tree = await runner.runSchematic('add-layout', {
      ...options,
      project: 'testApp2'
    }, appTree);

    const appContent = tree.readContent('projects/testApp2/src/app/app.component.ts');
    expect(appContent).toContain('selector: \'app2-root\',');

    const content = tree.readContent('/devextreme.json');
    expect(content).toContain('"inputFile": "src/themes/metadata.base.json",');
    expect(content).toContain('"inputFile": "projects/testApp2/src/themes/metadata.base.json",');
  });
});
