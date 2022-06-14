import {
  Rule,
  chain,
  schematic,
} from '@angular-devkit/schematics';

export default function(options: any): Rule {
  const rules = [
    schematic('install', {
      dxversion: options.dxversion,
      project: options.project
    }),
    schematic('add-layout', {
      layout: options.layout,
      resolveConflicts: options['resolve-conflicts'],
      project: options.project,
      skipInstall: true,
      updateBudgets: options['update-budgets'],
      globalNgCliVersion: options['global-ng-cli-version']
    })
  ];

  if (!options.empty) {
    rules.push(schematic('add-sample-views', {
      project: options.project
    }));
  }

  return chain(rules);
}
