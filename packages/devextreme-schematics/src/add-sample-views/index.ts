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

import { addViewToRouting } from '../add-view';

import {
  getApplicationPath,
  getProjectName
 } from '../utility/project';

import { humanize } from '../utility/string';

import {
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
    const rules: any[] = [];

    const templateSource = apply(url('./files'), [
      template({
        project: humanize(project)
      }),
      move(rootPath)
    ]);

    rules.push(mergeWith(templateSource));

    sampleViewOptions.forEach((viewOptions) => {
      rules.push(addViewToRouting({ name: viewOptions.name, project, module: 'app.routes' }));
    });

    rules.push(addDefaultNavigation(rootPath));

    return chain(rules);
  };
}
