import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('view', () => {
  const appOptions: any = {
    name: 'testApp',
    projectRoot: '',
    inlineStyle: false,
    inlineTemplate: false,
    routing: true,
    style: 'css',
    skipTests: false,
    skipPackageJson: false
  };

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    version: '6.0.0'
  };

  const componentOptions: any = {
    name: 'test',
    inlineStyle: false,
    inlineTemplate: false,
    changeDetection: 'Default',
    styleext: 'css',
    skipImport: true,
    module: undefined,
    export: false,
    project: 'testApp'
  };

  const angularSchematicsCollection = require.resolve('../../node_modules/@schematics/angular/collection.json');
  const schematicRunner = new SchematicTestRunner('@schematics/angular', angularSchematicsCollection);
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await schematicRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
    appTree = await schematicRunner.runSchematicAsync('application', appOptions, appTree).toPromise();
  });

  it('should create new view', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    let tree = await runner.runSchematicAsync('add-layout', { layout: 'side-nav-outer-toolbar' }, appTree).toPromise();
    tree = await runner.runSchematicAsync('add-view', componentOptions, appTree).toPromise();

    expect(tree.files).toContain('/src/app/pages/test/test.component.ts');
    expect(tree.files).toContain('/src/app/pages/test/test.component.html');

    const content = tree.readContent('/src/app/pages/test/test.component.html');

    expect(content).toMatch(/<h2 class="content-block">Test<\/h2>/);
  });

  it('should add view to default routing module', async () => {
    const options = { ...componentOptions, addRoute: true };

    const runner = new SchematicTestRunner('schematics', collectionPath);
    let tree = await runner.runSchematicAsync('add-layout', { layout: 'side-nav-outer-toolbar' }, appTree).toPromise();
    tree = await runner.runSchematicAsync('add-view', options, tree).toPromise();
    tree = await runner.runSchematicAsync('add-view', { ...options, name: 'test2' }, tree).toPromise();
    const moduleContent = tree.readContent('/src/app/app-routing.module.ts');

    expect(moduleContent).toContain(`const routes: Routes = [
  {
    path: 'pages/test2',
    component: Test2Component,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'pages/test',
    component: TestComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: '**',
    redirectTo: 'pages/test'
  }
];`);
  });

  it('should add view to other routing module', async () => {
    const options = { ...componentOptions, addRoute: true, module: 'test/test-routing' };

    const runner = new SchematicTestRunner('schematics', collectionPath);
    let tree = await runner.runExternalSchematicAsync('@schematics/angular', 'module', {
      name: 'test',
      routing: true,
      project: 'testApp'
    }, appTree).toPromise();

    tree = await runner.runSchematicAsync('add-layout', {
      layout: 'side-nav-outer-toolbar',
      project: 'testApp',
      name: 'test'
    }, tree).toPromise();
    tree = await runner.runSchematicAsync('add-view', options, tree).toPromise();

    const moduleContent = tree.readContent('/src/app/test/test-routing.module.ts');

    expect(moduleContent).toMatch(/component: TestComponent/);
    expect(moduleContent).toMatch(/path: 'pages\/test'/);
    expect(moduleContent).toContain('canActivate: [ AuthGuardService ]');
  });

  it('should add view to navigation', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    let tree = await runner.runSchematicAsync('add-layout', { layout: 'side-nav-outer-toolbar' }, appTree).toPromise();
    tree = await runner.runSchematicAsync('add-view', componentOptions, tree).toPromise();

    componentOptions.name = 'some test';
    componentOptions.icon = 'home';
    tree = await runner.runSchematicAsync('add-view', componentOptions, tree).toPromise();

    const moduleContent = tree.readContent('/src/app/app-navigation.ts');

    expect(moduleContent).toMatch(/text: 'Some Test'/);
    expect(moduleContent).toMatch(/icon: 'home'/);
    expect(moduleContent).toMatch(/text: 'Test'/);
    expect(moduleContent).toMatch(/icon: 'folder'/);

    expect(moduleContent).toContain(`navigation = [
  {
    text: 'Test',
    path: '/pages/test',
    icon: 'folder'
  },
  {
    text: 'Some Test',
    path: '/pages/some-test',
    icon: 'home'
  }
];`);
    const pageContent = tree.readContent('/src/app/pages/some-test/some-test.component.html');
    expect(pageContent).toMatch(/<h2 class="content-block">Some Test<\/h2>/);
  });

  it('should create new view with path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    componentOptions.name = 'folder/test';
    let tree = await runner.runSchematicAsync('add-layout', { layout: 'side-nav-outer-toolbar' }, appTree).toPromise();
    tree = await runner.runSchematicAsync('add-view', componentOptions, appTree).toPromise();

    expect(tree.files).toContain('/src/app/folder/test/test.component.ts');
    expect(tree.files).toContain('/src/app/folder/test/test.component.html');
  });
});
