import {
  Rule,
  Tree,
  SchematicContext,
  chain
} from '@angular-devkit/schematics';

import { addStylesToApp } from '../utility/styles';

import {
  NodeDependencyType,
  addPackageJsonDependency,
} from '@schematics/angular/utility/dependencies';

import { latestVersions } from '../utility/latest-versions';
import { modifyJSONFile } from '../utility/modify-json-file';
import { getProjectName } from '../utility/project';

import { PatchNodePackageInstallTask } from '../utility/patch';

export default function(options: any): Rule {

  return chain([
    (host: Tree) => addDevExtremeDependency(host, { dxversion: options.dxversion }),
    (host: Tree) => addDevExtremeCSS(host, { project: options.project }),
    (host: Tree) => reqisterJSZip(host),
    (_, context: SchematicContext) => {
      context.addTask(new PatchNodePackageInstallTask());
    },
  ]);
}

function addDevExtremeDependency(host: Tree, options: any) {
  addPackageJsonDependency(host, {
    type: NodeDependencyType.Default,
    name: 'devextreme',
    version: options.dxversion || latestVersions['devextreme']
  });
  addPackageJsonDependency(host, {
    type: NodeDependencyType.Default,
    name: 'devextreme-angular',
    version: options.dxversion || latestVersions['devextreme-angular']
  });
  addPackageJsonDependency(host, {
    type: NodeDependencyType.Dev,
    name: 'devextreme-cli',
    version: latestVersions['devextreme-cli']
  });
  addPackageJsonDependency(host, {
    type: NodeDependencyType.Dev,
    name: 'devextreme-themebuilder',
    version: options.dxversion || latestVersions['devextreme']
  });

  return host;
}

async function addDevExtremeCSS(host: Tree, options: any) {
  const projectName = await getProjectName(host, options.project);
  modifyJSONFile(host, './angular.json', config => {

    return addStylesToApp(projectName, config);
  });

  return host;
}

function reqisterJSZip(host: Tree) {
  modifyJSONFile(host, './tsconfig.app.json', config => {
    const compilerOptions = config['compilerOptions'];
    let paths = compilerOptions['paths'];

    if (!paths) {
      paths = {};
    }

    if (!paths['jszip']) {
      paths['jszip'] = ['node_modules/jszip/dist/jszip.min.js'];
    }

    compilerOptions['paths'] = paths;

    return config;
  });

  return host;
}
