import {
  Rule,
  chain,
  schematic,
  Tree,
} from '@angular-devkit/schematics';

import { existsSync } from 'fs';
import { resolve, join } from 'path';

import { spawnSync } from 'child_process';

export default function(options: any): Rule {
  const rules = [
    schematic('install', {
      dxversion: options.dxversion,
      project: options.project
    }),
    schematic('add-layout', {
      layout: options.layout,
      resolveConflicts: options.resolveConflicts,
      project: options.project,
      skipInstall: true,
      updateBudgets: options.updateBudgets,
      globalNgCliVersion: options.globalNgCliVersion
    }),
    // schematics installed packages with flag --ignore-scripts
    // @angular/cli@14 add option allowScript to NodePackageInstallTask
    (host: Tree) => {
      postinstallScripts();
      return host;
    }
  ];

  if (!options.empty) {
    rules.push(schematic('add-sample-views', {
      project: options.project
    }));
  }

  return chain(rules);
}

const postinstallScripts = () => {
  const isWin = /^win/.test(process.platform);

  const sassEmbeddedPath = resolve('node_modules', 'sass-embedded');
  const sassVendorPath = join(sassEmbeddedPath, 'dist', 'lib', 'src', 'vendor', 'dart-sass-embedded');
  if (!existsSync(sassVendorPath)) {
    spawnSync('npm', ['run', 'postinstall'], {
      cwd: resolve(join('node_modules', 'sass-embedded')),
      windowsVerbatimArguments: true,
      shell: isWin ? false : true
    });
  }
};
