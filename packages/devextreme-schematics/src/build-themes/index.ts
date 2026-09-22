import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
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
      const { error, status } = spawnSync('npm', ['run', 'build-themes'], {
        stdio: 'inherit',
        windowsVerbatimArguments: true,
        shell: true
      });

      if (error) {
        throw new SchematicsException(`The theme build failed to start: ${error.message}`);
      }

      if (status !== 0) {
        throw new SchematicsException(`The theme build exited with the code ${status}.`);
      }
    }

    return host;
  };
}
