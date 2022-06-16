import {
  Node,
  SourceFile,
  SyntaxKind
} from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';

import {
  strings,
  basename,
  normalize
} from '@angular-devkit/core';

function getRouteComponentName(pageName: string) {
  return `${strings.classify(basename(normalize(pageName)))}Component`;
}

export function hasComponentInRoutes(routes: Node, name: string) {
  const routesText = routes.getText();
  const componentName = getRouteComponentName(name);
  return routesText.indexOf(componentName) !== -1;
}

export function getRoute(name: string) {
  return `  {
    path: '${strings.dasherize(name)}',
    component: ${getRouteComponentName(name)},
    canActivate: [ AuthGuardService ]
  }`;
}

function isRouteVariable(node: Node, text: string) {
    return node.kind === SyntaxKind.VariableStatement &&
      text.search(/\:\s*Routes/) !== -1;
  }

export function findRoutesInSource(source: SourceFile) {
  // TODO: try to use ast-utils/findNodes
  return source.forEachChild((node) => {
    const text = node.getText();
    if (isRouteVariable(node, text)) {
      return node;
    }
  });
}
