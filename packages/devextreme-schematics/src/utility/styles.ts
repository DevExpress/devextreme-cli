import { Tree } from '@angular-devkit/schematics';
import { getProjectName } from './project';
import { makeArrayUnique } from './array';

function cleanStyles(projectStyles: Array<any>, defaultStyles: any) {
  return projectStyles.filter((style) => {
    return style !== defaultStyles[0] && style !== defaultStyles[1];
  });
}

export function addStylesToApp(host: Tree, project: string, config: any, styles?: Array<any>) {
  const projectName = getProjectName(host, project);
  const projectBuildOptopns = config['projects'][projectName]['architect']['build']['options'];
  const defaultStyles = [
    'node_modules/devextreme/dist/css/dx.light.css',
    'node_modules/devextreme/dist/css/dx.common.css'
  ];
  let projectStyles = projectBuildOptopns['styles'];

  if (!styles) {
    styles = defaultStyles;
  } else {
    projectStyles = cleanStyles(projectStyles, defaultStyles);
  }

  styles.forEach((style) => {
    projectStyles.unshift(style);
  });

  projectBuildOptopns['styles'] = makeArrayUnique(projectStyles);

  return config;
}
