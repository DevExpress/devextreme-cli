import { Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

export async function getProjectName(host: Tree, projectName: string) {
  const projects: string[] = [];
  const workspace = await getWorkspace(host);
  /* tslint:disable-next-line:variable-name */
  workspace.projects.forEach((_v, k) => {
    projects.push(k);
  });

  return projectName && projects.includes(projectName) ? projectName : projects[0];
}

export async function getApplicationPath(host: Tree, projectName: string) {
  const sourcePath = await getSourceRootPath(host, projectName);
  return sourcePath ? `${sourcePath}/app/` : 'src/app/';
}

export async function getSourceRootPath(host: Tree, projectName: string) {
  const workspace = await getWorkspace(host);
  const project = workspace.projects.get(projectName);
  return project && (project.sourceRoot || project.root);
}

export async function getRootPath(host: Tree, projectName: string) {
  const workspace = await getWorkspace(host);
  const project = workspace.projects.get(projectName);
  return project && project.root;
}
