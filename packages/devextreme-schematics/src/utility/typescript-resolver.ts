import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface TypeScriptResolutionResult {
  ts: any | null;
  resolutionMethod: 'project' | 'global' | 'temporary' | null;
  errors: string[];
}

/**
 * Resolves TypeScript with a 3-level fallback strategy:
 * 1. Project search - look in the user's project node_modules
 * 2. Global search - look in global node_modules
 * 3. Temporary install - use npx to temporarily install typescript
 */
export function resolveTypeScript(): TypeScriptResolutionResult {
  const errors: string[] = [];

  try {
    const projectTs = tryResolveFromProject();
    if (projectTs) {
      return {
        ts: projectTs,
        resolutionMethod: 'project',
        errors: []
      };
    }
  } catch (err) {
    errors.push(`Project resolution failed: ${err?.message || err}`);
  }

  try {
    const globalTs = tryResolveFromGlobal();
    if (globalTs) {
      return {
        ts: globalTs,
        resolutionMethod: 'global',
        errors: []
      };
    }
  } catch (err) {
    errors.push(`Global resolution failed: ${err?.message || err}`);
  }

  try {
    const tempTs = tryResolveViaTemporaryInstall();
    if (tempTs) {
      return {
        ts: tempTs,
        resolutionMethod: 'temporary',
        errors: []
      };
    }
  } catch (err) {
    errors.push(`Temporary install failed: ${err?.message || err}`);
  }

  return {
    ts: null,
    resolutionMethod: null,
    errors
  };
}

function tryResolveFromProject(): any {
  const searchPaths = [
    process.cwd(),
    path.dirname(require.main?.filename || ''),
  ];

  for (const searchPath of searchPaths) {
    try {
      const tsPath = require.resolve('typescript', { paths: [searchPath] });
      // tslint:disable-next-line:no-var-requires
      return require(tsPath);
    } catch {
      // Continue to next path
    }
  }

  return null;
}

function tryResolveFromGlobal(): any {
  try {
    const globalPath = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const typescriptPath = path.join(globalPath, 'typescript');

    if (fs.existsSync(typescriptPath)) {
      // tslint:disable-next-line:no-var-requires
      return require(typescriptPath);
    }
  } catch {
    // Fall through
  }

  return null;
}

function tryResolveViaTemporaryInstall(): any {
  try {
    const tmpDir = path.join(require('os').tmpdir(), 'devextreme-schematics-ts-' + Date.now());
    fs.mkdirSync(tmpDir, { recursive: true });

    const packageJson = {
      name: 'temp-typescript-resolver',
      version: '1.0.0',
      dependencies: {
        typescript: 'latest'
      }
    };
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    execSync('npm install --silent --no-progress', {
      cwd: tmpDir,
      stdio: 'ignore',
      timeout: 30000
    });

    const typescriptPath = path.join(tmpDir, 'node_modules', 'typescript');
    if (fs.existsSync(typescriptPath)) {
      // tslint:disable-next-line:no-var-requires
      const ts = require(typescriptPath);

      setTimeout(() => {
        try {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
      }, 5000);

      return ts;
    }
  } catch {
    // Fall through
  }

  return null;
}
