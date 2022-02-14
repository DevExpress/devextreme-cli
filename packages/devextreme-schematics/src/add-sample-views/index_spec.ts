import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('sample views', () => {
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

  const sampleViewsOptions: any = {
    project: 'testApp'
  };

  const angularSchematicsCollection = require.resolve('../../node_modules/@schematics/angular/collection.json');
  const schematicRunner = new SchematicTestRunner('@schematics/angular', angularSchematicsCollection);
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree =  await schematicRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
    appTree = await schematicRunner.runSchematicAsync('application', appOptions, appTree).toPromise();
  });

  it('should add sample views', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    let tree = await runner.runSchematicAsync('add-layout', { layout: 'side-nav-outer-toolbar' }, appTree).toPromise();
    tree = await runner.runSchematicAsync('add-sample-views', sampleViewsOptions, tree).toPromise();

    const moduleContent = tree.readContent('/src/app/app-routing.module.ts');

    expect(moduleContent).toMatch(/component: HomeComponent/);
    expect(moduleContent).toMatch(/path: 'home'/);

    expect(moduleContent).toMatch(/import { HomeComponent } from /);
    expect(moduleContent).toMatch(/declarations:\s\[\n*\s*HomeComponent/);

    const navigationContent = tree.readContent('/src/app/app-navigation.ts');
    expect(navigationContent).toMatch(/text: 'Home'/);
    expect(navigationContent).toContain(`export const navigation = [
  {
    text: 'Home',
    path: '/home',
    icon: 'home'
  },
  {
    text: 'Examples',
    icon: 'folder',
    items: [
      {
        text: 'Profile',
        path: '/profile'
      },
      {
        text: 'Tasks',
        path: '/tasks'
      }
    ]
  }
];`);
  });
});
