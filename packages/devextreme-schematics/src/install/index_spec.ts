import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import * as path from 'path';
import { latestVersions } from '../utility/latest-versions';

const collectionPath = path.join(__dirname, '../collection.json');

describe('install', () => {
  // TODO: Extract workspase preparing somewhere
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
    // TODO: use angular latest-versions module
    version: '12.0.0'
  };

  const angularSchematicsCollection = require.resolve('../../node_modules/@schematics/angular/collection.json');
  const schematicRunner = new SchematicTestRunner('@schematics/angular', angularSchematicsCollection);
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await schematicRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
    appTree = await schematicRunner.runSchematicAsync('application', appOptions, appTree).toPromise();
  });

  it('should add devextreme dependency (default)', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematicAsync('install', {}, appTree).toPromise();
    const packageConfig = JSON.parse(tree.readContent('package.json'));

    expect(packageConfig.dependencies['devextreme']).toBe(latestVersions['devextreme']);
    expect(packageConfig.dependencies['devextreme-angular']).toBe(latestVersions['devextreme-angular']);
    expect(packageConfig.devDependencies['devextreme-themebuilder']).toBe(latestVersions['devextreme']);
  });

  it('should add devextreme dependency (custom)', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematicAsync('install', { dxversion: '18.2.5' }, appTree).toPromise();
    const packageConfig = JSON.parse(tree.readContent('package.json'));

    expect(packageConfig.dependencies.devextreme).toBe('18.2.5');
    expect(packageConfig.devDependencies['devextreme-themebuilder']).toBe('18.2.5');
  });

  it('should add devextreme cli devDependency', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematicAsync('install', { dxversion: '18.2.5' }, appTree).toPromise();
    const packageConfig = JSON.parse(tree.readContent('package.json'));

    expect(packageConfig.devDependencies['devextreme-cli']).toBeDefined();
  });

  it('should add devextreme styles', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematicAsync('install', {}, appTree).toPromise();
    const angularConfig = JSON.parse(tree.readContent('angular.json'));
    const styles = angularConfig['projects']['testApp']['architect']['build']['options']['styles'];

    expect(styles[0]).toBe('node_modules/devextreme/dist/css/dx.common.css');
    expect(styles[1]).toBe('node_modules/devextreme/dist/css/dx.light.css');
  });

  it('should register jszip', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematicAsync('install', {}, appTree).toPromise();
    const tsconfig = JSON.parse(tree.readContent('tsconfig.app.json'));
    const jszip = tsconfig['compilerOptions']['paths']['jszip'];

    expect(jszip[0]).toBe('node_modules/jszip/dist/jszip.min.js');
  });

  it('should add devextreme styles to the specified project', async () => {
    const secondAppOptions: any = {
      name: 'testApp2',
      inlineStyle: false,
      inlineTemplate: false,
      projectRoot: 'src2',
      routing: true,
      style: 'css',
      skipTests: false,
      skipPackageJson: false
    };

    appTree = await schematicRunner.runSchematicAsync('application', secondAppOptions, appTree).toPromise();

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematicAsync('install', { project: 'testApp2' }, appTree).toPromise();
    const angularConfig = JSON.parse(tree.readContent('angular.json'));
    const styles = angularConfig['projects']['testApp2']['architect']['build']['options']['styles'];

    expect(styles[0]).toBe('node_modules/devextreme/dist/css/dx.common.css');
    expect(styles[1]).toBe('node_modules/devextreme/dist/css/dx.light.css');

    expect(angularConfig['projects']['testApp']['architect']['build']['options']['styles'].length).toBe(1);
  });
});
