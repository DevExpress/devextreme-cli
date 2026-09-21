import { Rule, Tree } from '@angular-devkit/schematics';
import { spawnSync } from 'child_process';

export default function(): Rule {
  return (host: Tree) => {
    const isWin = /^win/.test(process.platform);
    spawnSync('npm', ['run', 'build-themes'], {
      stdio: 'inherit',
      windowsVerbatimArguments: true,
      shell: !isWin ? true : false
    });
    return host;
  };
}