import { Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { join } from 'path';

function readFile(host: Tree, path?: string) {
  console.log('Reading file:', path);
  return path && host.exists(path) ? host.read(path)!.toString() : '';
}

export async function isZonelessApp(host: Tree, projectName: string, appPath: string) {
  const workspace = await getWorkspace(host);
  const buildOptions = workspace.projects.get(projectName)?.targets.get('build')?.options || {};
  const mainPath = (buildOptions.browser || buildOptions.main) as string | undefined;
  const bootstrapSource = readFile(host, join(appPath, 'app.config.ts')) + readFile(host, mainPath);

  if (/provideZoneChangeDetection\s*\(/.test(bootstrapSource)) {
    return false;
  }

  if (/provideZonelessChangeDetection\s*\(/.test(bootstrapSource)) {
    return true;
  }

  const polyfills = buildOptions.polyfills;
  const polyfillList = (Array.isArray(polyfills) ? polyfills : [polyfills]).filter(Boolean) as string[];

  return !polyfillList.some((polyfill) =>
    polyfill === 'zone.js' || /['"]zone\.js['"]/.test(readFile(host, polyfill))
  );
}
