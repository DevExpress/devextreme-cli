import {
  Rule,
  chain,
  Tree,
  SchematicsException,
  externalSchematic
} from '@angular-devkit/schematics';

import {
  findModuleFromOptions
} from '@schematics/angular/utility/find-module';

import {
  insertItemToArray
} from '../utility/change';

import {
  hasComponentInRoutes,
  getRoute,
  findRoutesInSource
} from '../utility/routing';

import { getSourceFile } from '../utility/source';

import { strings, basename, normalize, dirname } from '@angular-devkit/core';

import {
  getProjectName,
  getApplicationPath
} from '../utility/project';
import { humanize } from '../utility/string';

async function getPathToFile(host: Tree, projectName: string, moduleName: string) {
  const rootPath = await getApplicationPath(host, projectName);

  try {
    return findModuleFromOptions(host, { name: moduleName, path: rootPath, module: moduleName });
  } catch (error) {
    return;
  }
}

function addViewToNavigation(options: any) {
  return async (host: Tree) => {
    const navigationName = 'app-navigation';
    const navigationFilePath = await getPathToFile(host, options.project, navigationName);

    if (!navigationFilePath) {
      return;
    }

    const source = getSourceFile(host, navigationFilePath)!;
    const pagePath = strings.dasherize(options.name);
    const name = strings.dasherize(basename(normalize(options.name)));
    const title = humanize(name);
    const navigationItem = `  {
    text: '${title}',
    path: '/${pagePath}',
    icon: '${options.icon}'
  }`;

    insertItemToArray(host, navigationFilePath, source, navigationItem, { location: 'end' });

    return host;
  };
}

function addRedirectRoute(host: Tree, routingModulePath: string, page: string) {
  const source = getSourceFile(host, routingModulePath)!;
  const content = source.getText();
  if (content.match(/path:\s*'\*\*'/g)) {
    return;
  }

  const routes = findRoutesInSource(source)!;
  const redirectRoute = `  {
    path: '**',
    redirectTo: '${strings.dasherize(page)}'
  }`;

  insertItemToArray(host, routingModulePath, routes, redirectRoute, { location: 'end' });
}

export function addViewToRouting(options: any) {
  return async (host: Tree) => {
    const routingModulePath = await getPathToFile(host, options.project, options.module);

    if (!routingModulePath) {
      throw new SchematicsException('Specified module does not exist.');
    }

    addRedirectRoute(host, routingModulePath, options.name);

    const source = getSourceFile(host, routingModulePath)!;
    const routes = findRoutesInSource(source);

    if (!routes) {
      throw new SchematicsException('No routes found.');
    }

    if (!hasComponentInRoutes(routes, options.name)) {
      const route = getRoute(options.name);
      insertItemToArray(host, routingModulePath, routes, route);
    }
    return host;
  };
}

function getPathForView(name: string) {
  if (name.includes('/')) {
    return name;
  }
  return 'pages/' + name;
}

function getModuleName(addRoute: boolean, moduleName: string) {
  if (!moduleName && addRoute) {
    return 'app-routing';
  }
  return moduleName;
}

function addContentToView(options: any) {
  return async (host: Tree) => {
    const name = strings.dasherize(basename(normalize(options.name)));
    const path = `${dirname(options.name)}/${name}`;
    const title = humanize(name);
    const componentPath = `/${await getApplicationPath(host, options.project)}${path}/${name}.component.html`;
    if (host.exists(componentPath)) {
      host.overwrite(
        componentPath,
        `<h2 class="content-block">${title}</h2>
<div class="content-block">
    <div class="dx-card responsive-paddings">Put your content here</div>
</div>
`);
    }
    return host;
  };
}

export default function(options: any): Rule {
  return async (host: Tree) => {
    const addRoute = options.addRoute;
    const project = await getProjectName(host, options.project);
    const module = getModuleName(addRoute, options.module);
    const name = getPathForView(options.name);

    const rules = [externalSchematic('@schematics/angular', 'component', {
        name,
        project,
        module,
        skipTests: options.skipTests,
        inlineStyle: options.inlineStyle,
        prefix: options.prefix
      }),
      addContentToView({ name, project }) as any
    ];

    if (addRoute) {
      rules.push(addViewToRouting({ name, project, module }) as any);
      rules.push(addViewToNavigation({ name, icon: options.icon, project }) as any);
    }
    return chain(rules);
  };
}
