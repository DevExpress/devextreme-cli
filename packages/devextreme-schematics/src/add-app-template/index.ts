import {
  Rule,
  chain,
  schematic,
  Tree,
} from '@angular-devkit/schematics';

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
    (host: Tree) => {
      const isWin = /^win/.test(process.platform);
      const resPath = resolve(join('.', 'node_modules', 'sass-embedded'));

      spawnSync('npm', ['run', 'postinstall'], {
        cwd: resPath,
        windowsVerbatimArguments: true,
        shell: isWin ? false : true
      });

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
