import {
  Rule,
  chain,
  schematic,
  Tree,
} from '@angular-devkit/schematics';

import { resolve, join } from 'path';

import { execSync } from 'child_process';

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
    (host: Tree) => {
      // schematics installed packages with flag --ignore-scripts
      const resPath = resolve(join('.', 'node_modules', 'sass-embedded'));
      execSync('-c npm run postinstall', {
        cwd: resPath,
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
