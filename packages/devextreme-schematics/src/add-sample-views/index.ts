import {
  Rule,
  Tree,
  chain,
  apply,
  template,
  move,
  url,
  mergeWith
} from '@angular-devkit/schematics';

import {
  addDeclarationToModule,
  addImportToModule
} from '@schematics/angular/utility/ast-utils';

import { addViewToRouting } from '../add-view';

import {
  getApplicationPath,
  getProjectName
 } from '../utility/project';

import { humanize } from '../utility/string';

import {
   applyChanges,
   insertItemToArray
 } from '../utility/change';

import { getSourceFile } from '../utility/source';

const sampleViewOptions = [
  {
    name: 'home',
    componentName: 'HomeComponent',
    relativePath: './pages/home/home.component'
  }, {
    name: 'profile',
    componentName: 'ProfileComponent',
    relativePath: './pages/profile/profile.component'
  }, {
    name: 'tasks',
    componentName: 'TasksComponent',
    relativePath: './pages/tasks/tasks.component'
}];

const devextremeOptions = [
  {
    componentName: 'DxDataGridModule',
    relativePath: 'devextreme-angular'
  }, {
    componentName: 'DxFormModule',
    relativePath: 'devextreme-angular'
}];

const navigations = [
  `  {
    text: 'Home',
    path: '/home',
    icon: 'home'
  }`,
  `  {
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
  }`
];

function addImportsToRoutingModule(isView: boolean, routingPath: string, options: any) {
  return (host: Tree) => {
    const source = getSourceFile(host, routingPath);

    if (!source) {
      return host;
    }

    let changes;

    if (isView) {
      changes = addDeclarationToModule(source, routingPath, options.componentName, options.relativePath);
    } else {
      changes = addImportToModule(source, routingPath, options.componentName, options.relativePath);
    }

    return applyChanges(host, changes, routingPath);
  };
}

function addDefaultNavigation(rootPath: string) {
  return (host: Tree) => {
    const navigationPath = rootPath + 'app-navigation.ts';

    navigations.forEach((navigation) => {
      const navigationSource = getSourceFile(host, navigationPath)!;
      insertItemToArray(host, navigationPath, navigationSource, navigation, { location: 'end' });
    });

    return host;
  };
}

export default function(options: any): Rule {
  return async (host: Tree) => {
    const project = await getProjectName(host, options.project);
    const rootPath = await getApplicationPath(host, project);
    const routingPath = rootPath + 'app-routing.module.ts';
    const rules: any[] = [];

    const templateSource = apply(url('./files'), [
      template({
        project: humanize(project)
      }),
      move(rootPath)
    ]);

    rules.push(mergeWith(templateSource));

    sampleViewOptions.forEach((viewOptions) => {
      rules.push(addViewToRouting({ name: viewOptions.name, project, module: 'app-routing' }));
      rules.push(addImportsToRoutingModule(true, routingPath, viewOptions));
    });

    devextremeOptions.forEach((moduleOptions) => {
      rules.push(addImportsToRoutingModule(false, routingPath, moduleOptions));
    });

    rules.push(addDefaultNavigation(rootPath));

    return chain(rules);
  };
}
