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
    skipPackageJson: false,
    standalone: false
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
    appTree = await schematicRunner.runSchematic('workspace', workspaceOptions);
    appTree = await schematicRunner.runSchematic('application', appOptions, appTree);
  });

  it('should create new view', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    let tree = await runner.runSchematic('add-layout', { layout: 'side-nav-outer-toolbar' }, appTree);
    tree = await runner.runSchematic('add-view', componentOptions, appTree);

    expect(tree.files).toContain('/src/app/pages/test/test.component.ts');
    expect(tree.files).toContain('/src/app/pages/test/test.component.html');

    const contentHTML = tree.readContent('/src/app/pages/test/test.component.html');
    const contentTS = tree.readContent('/src/app/pages/test/test.component.ts');

    expect(contentHTML).toMatch(/<h2>Test<\/h2>/);
    expect(contentTS).toContain('standalone: false');
  });

  it('should add view to default routing module', async () => {
    const options = { ...componentOptions, addRoute: true };

    const runner = new SchematicTestRunner('schematics', collectionPath);
    let tree = await runner.runSchematic('add-layout', { layout: 'side-nav-outer-toolbar' }, appTree);
    tree = await runner.runSchematic('add-view', options, tree);
    tree = await runner.runSchematic('add-view', { ...options, name: 'test2' }, tree);
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
    let tree = await runner.runExternalSchematic('@schematics/angular', 'module', {
      name: 'test',
      routing: true,
      project: 'testApp'
    }, appTree);

    tree = await runner.runSchematic('add-layout', {
      layout: 'side-nav-outer-toolbar',
      project: 'testApp',
      name: 'test'
    }, tree);
    tree = await runner.runSchematic('add-view', options, tree);

    const moduleContent = tree.readContent('/src/app/test/test-routing.module.ts');

    expect(moduleContent).toMatch(/component: TestComponent/);
    expect(moduleContent).toMatch(/path: 'pages\/test'/);
    expect(moduleContent).toContain('canActivate: [ AuthGuardService ]');
  });

  it('should add view to navigation', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    let tree = await runner.runSchematic('add-layout', { layout: 'side-nav-outer-toolbar' }, appTree);
    tree = await runner.runSchematic('add-view', componentOptions, tree);

    componentOptions.name = 'some test';
    componentOptions.icon = 'home';
    tree = await runner.runSchematic('add-view', componentOptions, tree);

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
    expect(pageContent).toMatch(/<h2>Some Test<\/h2>/);
  });

  it('should create new view with path', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    componentOptions.name = 'folder/test';
    let tree = await runner.runSchematic('add-layout', { layout: 'side-nav-outer-toolbar' }, appTree);
    tree = await runner.runSchematic('add-view', componentOptions, appTree);

    expect(tree.files).toContain('/src/app/folder/test/test.component.ts');
    expect(tree.files).toContain('/src/app/folder/test/test.component.html');
  });
});
