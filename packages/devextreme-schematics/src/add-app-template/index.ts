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
      resolveConflicts: options.resolveConflicts,
      project: options.project,
      skipInstall: true,
      updateBudgets: options.updateBudgets,
      globalNgCliVersion: options.globalNgCliVersion
    })
  ];

  if (!options.empty) {
    rules.push(schematic('add-sample-views', {
      project: options.project
    }));
  }

  return chain(rules);
}
