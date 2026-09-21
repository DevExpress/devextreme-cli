import { Rule, Tree } from '@angular-devkit/schematics';
import { spawnSync } from 'child_process';

function hasBuildThemesScript(host: Tree) {
  const packageJson = host.read('./package.json');

  if (!packageJson) {
    return false;
  }

  const scripts = JSON.parse(packageJson.toString())['scripts'];

  return !!scripts && !!scripts['build-themes'];
}

export default function(): Rule {
  return (host: Tree) => {
    if (hasBuildThemesScript(host)) {
      const isWin = /^win/.test(process.platform);

      spawnSync('npm', ['run', 'build-themes'], {
        stdio: 'inherit',
        windowsVerbatimArguments: true,
        shell: !isWin
      });
    }

    return host;
  };
}
