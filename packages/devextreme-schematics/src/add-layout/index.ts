import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  url,
  move,
  chain,
  filter,
  forEach,
  mergeWith,
  callRule,
  FileEntry,
  template
} from '@angular-devkit/schematics';

import {
  SourceFile
} from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';

import { strings } from '@angular-devkit/core';

import { join, basename } from 'path';

import { SemVer } from 'semver';

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
  parseJson
 } from '../utility/modify-json-file';

import {
  NodeDependencyType,
  addPackageJsonDependency
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

import {
  addImportToModule, addProviderToModule, insertImport
} from '@schematics/angular/utility/ast-utils';

import { getWorkspace } from '@schematics/angular/utility/workspace';
import { Change } from '@schematics/angular/utility/change';

import { PatchNodePackageInstallTask } from '../utility/patch';

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
      addScriptSafe(scripts, 'postinstall', 'npm run build-themes');

      return config;
    });

    return host;
  };
}

async function addCustomThemeStyles(host: Tree, options: any, sourcePath: string = '') {
    const projectName = await getProjectName(host, options.project);
    modifyJSONFile(host, './angular.json', config => {
      const stylesList = [
        `${sourcePath}/dx-styles.scss`,
        `${sourcePath}/themes/generated/theme.additional.css`,
        `${sourcePath}/themes/generated/theme.base.css`,
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

function updateAppModule(host: Tree, sourcePath: string) {
  const appModulePath = sourcePath + 'app.module.ts';

  const importSetter = (importName: string, path: string) => {
    return (source: SourceFile) => {
      return addImportToModule(source, appModulePath, importName, path);
    };
  };

  const providerSetter = (importName: string, path: string) => {
    return (source: SourceFile) => {
      return addProviderToModule(source, appModulePath, importName, path);
    };
  };

  const rules = [
    modifyFileRule(appModulePath, importSetter('SideNavOuterToolbarModule', './layouts')),
    modifyFileRule(appModulePath, importSetter('SideNavInnerToolbarModule', './layouts')),
    modifyFileRule(appModulePath, importSetter('SingleCardModule', './layouts')),
    modifyFileRule(appModulePath, importSetter('FooterModule', './shared/components')),
    modifyFileRule(appModulePath, importSetter('ResetPasswordFormModule', './shared/components')),
    modifyFileRule(appModulePath, importSetter('CreateAccountFormModule', './shared/components')),
    modifyFileRule(appModulePath, importSetter('ChangePasswordFormModule', './shared/components')),
    modifyFileRule(appModulePath, importSetter('LoginFormModule', './shared/components')),
    modifyFileRule(appModulePath, providerSetter('AuthService', './shared/services')),
    modifyFileRule(appModulePath, providerSetter('ScreenService', './shared/services')),
    modifyFileRule(appModulePath, providerSetter('AppInfoService', './shared/services')),
    modifyFileRule(appModulePath, importSetter('UnauthenticatedContentModule', './unauthenticated-content')),
  ];

  if (!hasRoutingModule(host, sourcePath)) {
    rules.push(modifyFileRule(appModulePath, importSetter('AppRoutingModule', './app-routing.module')));
  }

  return chain(rules);
}

function getComponentName(host: Tree, sourcePath: string) {
  let name = '';
  const index = 1;

  if (!host.exists(sourcePath + 'app.component.ts')) {
    name = 'app';
  }

  while (!name) {
    const componentName = `app${index}`;
    if (!host.exists(`${sourcePath}${componentName}.component.ts`)) {
      name = componentName;
    }
  }

  return name;
}

function hasRoutingModule(host: Tree, sourcePath: string) {
  return host.exists(sourcePath + 'app-routing.module.ts');
}

function addPackagesToDependency(globalNgCliVersion: string) {
  const version = new SemVer(globalNgCliVersion.replace(/\^|\~/g, ''));
  return (host: Tree) => {
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@angular/cdk',
      version: `~${version.major}.${version.minor}.0`
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

const modifyRoutingModule = (host: Tree, routingModulePath: string) => {
  // TODO: Try to use the isolated host to generate the result string
  let source = getSourceFile(host, routingModulePath)!;
  const importChange = insertImport(source, routingModulePath, 'LoginFormComponent', './shared/components');
  const providerChanges = addProviderToModule(source, routingModulePath, 'AuthGuardService', './shared/services');
  applyChanges(host, [ importChange, ...providerChanges], routingModulePath);

  source = getSourceFile(host, routingModulePath)!;
  const routes = findRoutesInSource(source)!;
  if (!hasComponentInRoutes(routes, 'login-form')) {
    const loginFormRoute = getRoute('login-form');
    insertItemToArray(host, routingModulePath, routes, loginFormRoute);
  }
};

export default function(options: any): Rule {
  return async (host: Tree) => {
    const ngConfig = host.read('./angular.json')!.toString();
    const defaultProjectName = parseJson(ngConfig).defaultProject;
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
    const templateOptions = {
      name: componentName,
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

      if (basename(filePath) === 'app-routing.module.ts' && hasRoutingModule(host, appPath)) {
        modifyRoutingModule(host, filePath);
        return currentContent;
      }

      return templateContent;
    };

    const rules = [
      modifyContentByTemplate(sourcePath, projectFilesSource, null, templateOptions, modifyContent),
      updateDevextremeConfig(sourcePath),
      updateAppModule(host, appPath),
      addBuildThemeScript(),
      () => addCustomThemeStyles(host, options, sourcePath) as any,
      addViewportToBody(sourcePath),
      addPackagesToDependency(options.globalNgCliVersion)
    ];

    if (options.updateBudgets) {
      rules.push(() => updateBudgets(host, options) as any);
    }

    if (!options.skipInstall) {
      rules.push((_: Tree, context: SchematicContext) => {
        context.addTask(new PatchNodePackageInstallTask());
      });
    }

    if (override) {
      if (project === defaultProjectName) {
        rules.push(modifyContentByTemplate('./', workspaceFilesSource, 'e2e/src/app.e2e-spec.ts', { title }));
        rules.push(modifyContentByTemplate('./', workspaceFilesSource, 'e2e/src/app.po.ts'));
      }
    }

    return chain(rules);
  };
}
