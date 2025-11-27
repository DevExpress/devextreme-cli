#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import semver from 'semver';

const bump = process.argv[2];
const validBumps = new Set(['patch', 'minor', 'major']);

if (!validBumps.has(bump)) {
  console.error(`Unknown bump type "${bump}". Use one of: ${[...validBumps].join(', ')}`);
  process.exit(1);
}

const workspaceRoot = process.cwd();
const packages = [
  path.join(workspaceRoot, 'packages', 'devextreme-cli', 'package.json'),
  path.join(workspaceRoot, 'packages', 'devextreme-schematics', 'package.json')
];

for (const packagePath of packages) {
  const contents = readFileSync(packagePath, 'utf8');
  const pkg = JSON.parse(contents);
  const nextVersion = semver.inc(pkg.version, bump);

  if (!nextVersion) {
    console.error(`Failed to increment version for ${pkg.name}`);
    process.exit(1);
  }

  pkg.version = nextVersion;
  writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`Bumped ${pkg.name} to ${nextVersion}`);
}
