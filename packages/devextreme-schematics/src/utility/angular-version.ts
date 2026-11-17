import { Tree } from '@angular-devkit/schematics';
import { coerce } from 'semver';

export function getAngularVersion(host: Tree): number {
  const packageJson = JSON.parse(host.read('package.json')?.toString() || '{}');
  const angularCore = packageJson.dependencies?.['@angular/core'];

  const version = coerce(angularCore);
  if (version) {
    return version.major;
  }

  throw new Error('Angular version not found');
}

export function isAngularVersionHigherThan(host: Tree, version: number): boolean {
  return getAngularVersion(host) >= version;
}
