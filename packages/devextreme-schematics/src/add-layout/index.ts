import {
  type Rule,
  type SchematicContext,
  type Tree,
  apply,
  url,
  move,
  chain,
  filter,
  forEach,
  mergeWith,
  callRule,
  type FileEntry,
  template
} from '@angular-devkit/schematics';

import {
  type CallExpression,
  type Node,
  type SourceFile,
  type StringLiteral,
  forEachChild,
  isArrayLiteralExpression,
  isCallExpression,
  isImportDeclaration,
  isNamedImports,
  isObjectLiteralExpression,
  isPropertyAssignment,
  isSpreadElement,
  isVariableStatement
} from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';

import { strings } from '@angular-devkit/core';

import { join, basename } from 'path';

import { coerce } from 'semver';

import {
  getApplicationPath,
  getSourceRootPath,
  getProjectName
 } from '../utility/project';

import {
  humanize
} from '../utility/string';

import {
  addStylesToApp
 } from '../utility/styles';

import {
  modifyJSONFile,
 } from '../utility/modify-json-file';

import {
  NodeDependencyType,
  addPackageJsonDependency,
  getPackageJsonDependency,
} from '@schematics/angular/utility/dependencies';

import { getSourceFile } from '../utility/source';

import {
  applyChanges,
  insertItemToArray
} from '../utility/change';

import {
  hasComponentInRoutes,
  getRoute,
  findRoutesInSource
} from '../utility/routing';

import { insertImport } from '@schematics/angular/utility/ast-utils';

import { getWorkspace } from '@schematics/angular/utility/workspace';
import type { Change } from '@schematics/angular/utility/change';

import { isAngularVersionHigherThan } from '../utility/angular-version';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';

const routes = [
  {
    name: 'AuthGuardService',
    type: 'service',
    location: './shared/services'
  },
  {
    name: 'LoginFormComponent',
    path: 'login-form',
    type: 'component',
    location: './shared/components'
  },
  {
    name: 'ResetPasswordFormComponent',
    path: 'reset-password',
    type: 'component',
    location: './shared/components'
  },
  {
    name: 'CreateAccountFormComponent',
    path: 'create-account',
    type: 'component',
    location: './shared/components'
  },
  {
    name: 'ChangePasswordFormComponent',
    path: 'change-password/:recoveryCode',
    type: 'component',
    location: './shared/components'
  }
];

const projectFilesSource = './files/src';
const workspaceFilesSource = './files';

function addScriptSafe(scripts: any, name: string, value: string) {
  const currentValue = scripts[name];

  if (!currentValue) {
    scripts[name] = value;
    return;
  }

  const alterName = `origin-${name}`;
  const safeValue = `npm run ${alterName} && ${value}`;

  if (currentValue === value || currentValue === safeValue) {
    return;
  }

  scripts[alterName] = currentValue;
  scripts[name] = safeValue;
}

function addBuildThemeScript() {
  return (host: Tree) => {
    modifyJSONFile(host, './package.json', config => {
      const scripts = config['scripts'];

      addScriptSafe(scripts, 'build-themes', 'devextreme build');

      return config;
    });

    return host;
  };
}

async function addCustomThemeStyles(host: Tree, options: any, sourcePath: string = '') {
    const projectName = await getProjectName(host, options.project);
    modifyJSONFile(host, './angular.json', config => {
      const stylesList = [
        `${sourcePath}/variables.scss`,
        `${sourcePath}/dx-styles.scss`,
        `${sourcePath}/themes/generated/theme.additional.css`,
        `${sourcePath}/themes/generated/theme.additional.dark.css`,
        `${sourcePath}/themes/generated/theme.base.css`,
        `${sourcePath}/themes/generated/theme.base.dark.css`,
        'node_modules/devextreme/dist/css/dx.common.css'
      ];

      return addStylesToApp(projectName, config, stylesList);
    });

    return host;
}

async function updateBudgets(host: Tree, options: any) {
  const projectName = await getProjectName(host, options.project);
  modifyJSONFile(host, './angular.json', config => {
      const budgets: any[] = config.projects[projectName].architect.build.configurations.production.budgets;

      const budget = budgets.find((item) => item.type === 'initial');
      if (budget) {
        budget.maximumWarning = '4mb';
        budget.maximumError = '7mb';
      }

      return config;
  });

  return host;
}

function addViewportToBody(sourcePath: string = '') {
  return (host: Tree) => {
    const indexPath =  join(sourcePath, 'index.html');
    let indexContent = host.read(indexPath)!.toString();

    indexContent = indexContent.replace(/<body>/, '<body class="dx-viewport">');
    host.overwrite(indexPath, indexContent);

    return host;
  };
}

function modifyFileRule(path: string, callback: (source: SourceFile) => Change[]) {
  return (host: Tree) => {
    const source = getSourceFile(host, path);

    if (!source) {
      return host;
    }

    const changes = callback(source);

    return applyChanges(host, changes, path);
  };
}

function updateAppComponent(sourcePath: string, templateOptions: any = {}) {
  const appMComponentPath = sourcePath + templateOptions.name + '.ts';

  const importSetter = (importName: string, path: string, alias: string) => {
    return (source: SourceFile) => {
      return [insertImport(source, appMComponentPath, importName, path, false, alias)];
    };
  };

  const rules = [
    modifyFileRule(appMComponentPath, importSetter(
      templateOptions.layout === 'side-nav-outer-toolbar'
        ? 'SideNavOuterToolbarComponent'
        : 'SideNavInnerToolbarComponent',
      './layouts',
      'SideNavToolbarComponent',
      )),
  ];

  return chain(rules);
}

function getComponentName(host: Tree, sourcePath: string) {
  let name = '';
  let index = 0;

  if (!host.exists(sourcePath + 'app.component.ts') && !host.exists(sourcePath + 'app.ts')) {
    name = 'app';
  }

  while (!name) {
    index++;
    const componentName = `app${index}`;

    if (
      !host.exists(`${sourcePath}${componentName}.component.ts`)
      && !host.exists(`${sourcePath}${componentName}.ts`)
    ) {
      name = componentName;
    }
  }

  return name;
}

function hasRouting(host: Tree, sourcePath: string) {
  return host.exists(sourcePath + 'app.routes.ts');
}

const appRoutesLocation = './app.routes';
const routerProvider = 'provideRouter(routes, withHashLocation())';

function findCall(source: SourceFile, name: string) {
  let call: CallExpression | undefined;

  const visit = (node: Node) => {
    if (call) {
      return;
    }

    if (isCallExpression(node) && node.expression.getText() === name) {
      call = node;
      return;
    }

    forEachChild(node, visit);
  };

  visit(source);

  return call;
}

function findAppConfigProviders(source: SourceFile) {
  const declarations = source.statements
    .filter(isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations]);
  const appConfig = declarations.find((declaration) => declaration.type?.getText() === 'ApplicationConfig')
    ?? declarations.find((declaration) => declaration.name.getText() === 'appConfig');
  const config = appConfig?.initializer;

  if (!config || !isObjectLiteralExpression(config)) {
    return;
  }

  const providers = config.properties.find((property) =>
    isPropertyAssignment(property) && property.name.getText() === 'providers'
  );

  return providers && isPropertyAssignment(providers) && isArrayLiteralExpression(providers.initializer)
    ? providers.initializer
    : undefined;
}

function isImportedFrom(source: SourceFile, name: string, location: string) {
  return source.statements.some((statement) => {
    const bindings = isImportDeclaration(statement) && statement.importClause?.namedBindings;

    return !!bindings
      && isNamedImports(bindings)
      && (statement.moduleSpecifier as StringLiteral).text === location
      && bindings.elements.some((element) => element.name.text === name);
  });
}

function addImports(host: Tree, filePath: string, imports: { name: string, location: string }[]) {
  for (const { name, location } of imports) {
    applyChanges(host, [insertImport(getSourceFile(host, filePath)!, filePath, name, location)], filePath);
  }
}

function addHashLocation(host: Tree, filePath: string, router: CallExpression) {
  const lastArgument = router.arguments[router.arguments.length - 1];

  if (!lastArgument || router.getText().includes('withHashLocation')) {
    return;
  }

  const recorder = host.beginUpdate(filePath);
  recorder.insertLeft(lastArgument.end, ', withHashLocation()');
  host.commitUpdate(recorder);

  addImports(host, filePath, [{ name: 'withHashLocation', location: '@angular/router' }]);
}

function addRouterProvider(host: Tree, filePath: string, source: SourceFile) {
  const providers = findAppConfigProviders(source);
  const canAddRouter = providers
    && !providers.elements.some(isSpreadElement)
    && !/\broutes\b/.test(source.getText());

  if (!providers || !canAddRouter) {
    return false;
  }

  const elements = providers.elements;
  const lastElement = elements[elements.length - 1];
  const getPosition = (pos: number) => source.getLineAndCharacterOfPosition(pos);
  const recorder = host.beginUpdate(filePath);

  if (!lastElement) {
    recorder.insertLeft(providers.getStart() + 1, `\n    ${routerProvider}\n  `);
  } else if (getPosition(lastElement.getStart()).line === getPosition(providers.getStart()).line) {
    recorder.insertLeft(lastElement.end, `, ${routerProvider}`);
  } else {
    const indent = ' '.repeat(getPosition(lastElement.getStart()).character);
    recorder.insertLeft(lastElement.end, `,\n${indent}${routerProvider}`);
  }

  host.commitUpdate(recorder);

  addImports(host, filePath, [
    { name: 'provideRouter', location: '@angular/router' },
    { name: 'withHashLocation', location: '@angular/router' },
    { name: 'routes', location: appRoutesLocation },
  ]);

  return true;
}

function updateAppConfig(appPath: string): Rule {
  const filePath = join(appPath, 'app.config.ts');

  return (host: Tree, context: SchematicContext) => {
    const source = getSourceFile(host, filePath);

    if (!source) {
      return host;
    }

    const router = findCall(source, 'provideRouter');

    if (!router) {
      if (!addRouterProvider(host, filePath, source)) {
        context.logger.warn(
          `Could not register the router in ${filePath}. `
          + `Add "${routerProvider}" with "routes" imported from '${appRoutesLocation}' to the application providers.`
        );
      }

      return host;
    }

    addHashLocation(host, filePath, router);

    const routesArgument = router.arguments[0];

    if (!routesArgument || !isImportedFrom(source, routesArgument.getText(), appRoutesLocation)) {
      context.logger.warn(
        `DevExtreme layout routes were added to ${join(appPath, 'app.routes.ts')}, `
        + `but the router in ${filePath} uses other routes. Add the layout routes to the routes passed to provideRouter.`
      );
    }

    return host;
  };
}

function getCdkVersion(angularCoreVersion: string = '') {
  if (angularCoreVersion.includes('next')) {
    return 'next';
  }

  const version = coerce(angularCoreVersion);
  return version ? `^${version.major}.0.0` : 'latest';
}

function addPackagesToDependency() {
  return (host: Tree) => {
    const angularCore = getPackageJsonDependency(host, '@angular/core');

    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@angular/cdk',
      version: getCdkVersion(angularCore?.version)
    });

    return host;
  };
}

function modifyContentByTemplate(
  sourcePath: string = '',
  templateSourcePath: string,
  filePath: string | null,
  templateOptions: any = {},
  modifyContent?: (templateContent: string, currentContent: string, filePath: string ) => string)
: Rule {
  return (host: Tree, context: SchematicContext) => {
    const modifyIfExists = (fileEntry: FileEntry) => {
      const fileEntryPath = join(sourcePath, fileEntry.path.toString());
      if (!host.exists(fileEntryPath)) {
        return fileEntry;
      }

      const templateContent = fileEntry.content!.toString();
      let modifiedContent = templateContent;

      const currentContent = host.read(fileEntryPath)!.toString();
      if (modifyContent) {
        modifiedContent = modifyContent(templateContent, currentContent, fileEntryPath);
      }

      // NOTE: Workaround for https://github.com/angular/angular-cli/issues/11337
      if (modifiedContent !== currentContent) {
        host.overwrite(fileEntryPath,  modifiedContent);
      }
      return null;
    };

    const rules = [
      filter(path => {
        return !filePath || join('./', path) === join('./', filePath);
      }),
      template(templateOptions),
      forEach(modifyIfExists),
      move(sourcePath)
    ];

    const modifiedSource = apply(url(templateSourcePath), rules);
    const resultRule = mergeWith(modifiedSource);

    return callRule(resultRule, host, context);
  };
}

function updateDevextremeConfig(sourcePath: string = '') {
  const devextremeConfigPath = '/devextreme.json';
  const templateOptions = {
    sourcePath
  };

  const modifyConfig = (templateContent: string, currentContent: string) => {
    const oldConfig = JSON.parse(currentContent);
    const newConfig = JSON.parse(templateContent);

    [].push.apply(oldConfig.build.commands, newConfig.build.commands);

    return JSON.stringify(oldConfig, null, '  ');
  };

  return modifyContentByTemplate('./', workspaceFilesSource, devextremeConfigPath, templateOptions, modifyConfig);
}

const modifyRouting = (host: Tree, routingFilePath: string) => {
  // TODO: Try to use the isolated host to generate the result string
  let source = getSourceFile(host, routingFilePath)!;
  const importChanges = [];
  for (const route of routes) {
    importChanges.push(insertImport(source, routingFilePath, route.name, route.location));
  }

  applyChanges(host, importChanges, routingFilePath);
  for (const route of routes) {
    if (route.type === 'component' && route.path) {
      source = getSourceFile(host, routingFilePath)!;
      const routeInSource = findRoutesInSource(source)!;
      if (!hasComponentInRoutes(routeInSource, route.path)) {
        const routeToAdd = getRoute(route.name, route.name, route.path);
        insertItemToArray(host, routingFilePath, routeInSource, routeToAdd);
      }
    }
  }

};

function setPostfix(host: Tree, name: string) {
  return name + (isAngularVersionHigherThan(host, 20) ? '' : '.component');
}

export default function(options: any): Rule {
  return async (host: Tree) => {
    const project = await getProjectName(host, options.project);
    const workspace = await getWorkspace(host);
    const ngProject = workspace.projects.get(project);
    const prefix = ngProject?.prefix;
    const title = humanize(project);
    const appPath = await getApplicationPath(host, project);
    const sourcePath = await getSourceRootPath(host, project);
    const layout = options.layout;
    const override = options.resolveConflicts === 'override';
    const componentName = override ? 'app' : getComponentName(host, appPath);
    const pathToCss = sourcePath?.replace(/\/?(\w)+\/?/g, '../');
    const hasAppConfig = host.exists(join(appPath, 'app.config.ts'));

    const templateOptions = {
      name: setPostfix(host, componentName),
      layout,
      title,
      strings,
      path: pathToCss,
      prefix
    };

    const modifyContent = (templateContent: string, currentContent: string, filePath: string) => {
      if (basename(filePath) === 'styles.scss') {
        return `${currentContent}\n${templateContent}`;
      }

      if (basename(filePath) === 'app.routes.ts' && hasRouting(host, appPath)) {
        modifyRouting(host, filePath);
        return currentContent;
      }

      if (basename(filePath) === 'app.config.ts') {
        return currentContent;
      }

      return templateContent;
    };

    const rules = [
      modifyContentByTemplate(sourcePath, projectFilesSource, null, templateOptions, modifyContent),
      updateDevextremeConfig(sourcePath),
      updateAppComponent(appPath, templateOptions),
      addBuildThemeScript(),
      () => addCustomThemeStyles(host, options, sourcePath) as any,
      addViewportToBody(sourcePath),
      addPackagesToDependency(),
    ];

    if (hasAppConfig) {
      rules.push(updateAppConfig(appPath));
    }

    if (options.updateBudgets) {
      rules.push(() => updateBudgets(host, options) as any);
    }

    if (!options.skipInstall) {
      rules.push((_: Tree, context: SchematicContext) => {
        const installTaskId = context.addTask(new NodePackageInstallTask());
        context.addTask(new RunSchematicTask('build-themes', {}), [installTaskId]);
      });
    }

    return chain(rules);
  };
}
