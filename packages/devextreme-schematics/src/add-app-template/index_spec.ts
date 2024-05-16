import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

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

const angularSchematicsCollection = require.resolve('../../node_modules/@schematics/angular/collection.json');
const schematicRunner = new SchematicTestRunner('@schematics/angular', angularSchematicsCollection);
let appTree: UnitTestTree;

beforeEach(async () => {
  appTree = await schematicRunner.runSchematic('workspace', workspaceOptions);
  appTree = await schematicRunner.runSchematic('application', appOptions, appTree);
});

describe('add-app-template', () => {
  it('should add DevExtreme', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-app-template', { }, appTree);
    const packageConfig = JSON.parse(tree.readContent('package.json'));

    expect('devextreme' in packageConfig.dependencies).toBe(true);
  });

  it('should consider the `project` option', async () => {
    appTree = await schematicRunner.runSchematic('application', {
      name: 'testApp2',
      inlineStyle: false,
      inlineTemplate: false,
      routing: true,
      style: 'scss',
      projectRoot: 'projects/testApp2'
    }, appTree);

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-app-template', {
      project: 'testApp2'
    }, appTree);

    expect(tree.files)
      .toContain('/devextreme.json');
    expect(tree.files)
      .toContain('/projects/testApp2/src/themes/metadata.base.json');
    expect(tree.files)
      .toContain('/projects/testApp2/src/app/pages/home/home.component.ts');
  });

  it('should consider the `updateBudgets` option', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('add-app-template', { updateBudgets: true }, appTree);

    const angularContent = JSON.parse(tree.readContent('/angular.json'));
    const budgets = angularContent.projects.testApp.architect.build.configurations.production.budgets;

    expect(budgets[0].maximumWarning).toEqual('4mb');
  });
});
