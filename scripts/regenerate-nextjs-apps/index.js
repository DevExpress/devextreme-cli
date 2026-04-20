#!/usr/bin/env node

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const scriptDir = __dirname;
const repoRoot = path.join(scriptDir, '..', '..');
const appsDir = path.join(repoRoot, 'apps', 'nextjs-testing');

const latestVersions = require('../../packages/devextreme-cli/src/utility/latest-versions');
const expectedVersion = latestVersions['create-next-app'];

// Verify the locked version matches latest-versions.js
const scriptPkg = require('./package.json');
const lockedVersion = scriptPkg.dependencies['create-next-app'];
if (lockedVersion !== expectedVersion) {
    console.error(`ERROR: create-next-app version mismatch`);
    console.error(`  latest-versions.js: ${expectedVersion}`);
    console.error(`  scripts/regenerate-nextjs-apps/package.json: ${lockedVersion}`);
    console.error(`\nUpdate package.json and run 'npm install' in scripts/regenerate-nextjs-apps/`);
    process.exit(1);
}

// Install create-next-app from lockfile
console.log('Installing create-next-app from lockfile...');
execFileSync('npm', ['ci'], { cwd: scriptDir, stdio: 'inherit' });

// Resolve the create-next-app binary from its package.json bin field
const createNextAppPkgPath = path.dirname(require.resolve('create-next-app/package.json', { paths: [scriptDir] }));
const createNextAppPkg = require('create-next-app/package.json');
const createNextAppBin = path.join(createNextAppPkgPath, createNextAppPkg.bin['create-next-app']);

// Parse min-release-age from .npmrc to pass as env var to create-next-app,
// so its internal npm commands also respect the setting
const npmrcPath = path.join(appsDir, '.npmrc');
const npmrcContent = fs.readFileSync(npmrcPath, 'utf8');
const minReleaseAgeMatch = npmrcContent.match(/^min-release-age=(.+)$/m);
const npmEnv = { ...process.env };
if (minReleaseAgeMatch) {
    npmEnv.npm_config_min_release_age = minReleaseAgeMatch[1];
}

const variants = [
    { name: 'ts-src-app', typescript: true, srcDir: true, appRouter: true },
    { name: 'ts-src-pages', typescript: true, srcDir: true, appRouter: false },
    { name: 'ts-nosrc-app', typescript: true, srcDir: false, appRouter: true },
    { name: 'ts-nosrc-pages', typescript: true, srcDir: false, appRouter: false },
    { name: 'js-src-app', typescript: false, srcDir: true, appRouter: true },
    { name: 'js-src-pages', typescript: false, srcDir: true, appRouter: false },
    { name: 'js-nosrc-app', typescript: false, srcDir: false, appRouter: true },
    { name: 'js-nosrc-pages', typescript: false, srcDir: false, appRouter: false },
];

console.log(`\nGenerating ${variants.length} Next.js test apps with create-next-app@${expectedVersion}\n`);

for (const variant of variants) {
    const appDir = path.join(appsDir, variant.name);

    if (fs.existsSync(appDir)) {
        fs.rmSync(appDir, { recursive: true, force: true });
    }

    const args = [
        variant.name,
        variant.typescript ? '--ts' : '--js',
        variant.srcDir ? '--src-dir' : '--no-src-dir',
        variant.appRouter ? '--app' : '--no-app',
        '--eslint',
        '--no-tailwind',
        '--no-react-compiler',
        '--import-alias', '@/*',
        '--no-git',
        '--use-npm'
    ];

    console.log(`Creating ${variant.name}...`);
    execFileSync(process.execPath, [createNextAppBin, ...args], {
        cwd: appsDir,
        stdio: 'inherit',
        env: npmEnv
    });

    fs.copyFileSync(npmrcPath, path.join(appDir, '.npmrc'));

    const nodeModulesDir = path.join(appDir, 'node_modules');
    if (fs.existsSync(nodeModulesDir)) {
        fs.rmSync(nodeModulesDir, { recursive: true, force: true });
    }

    const nextCacheDir = path.join(appDir, '.next');
    if (fs.existsSync(nextCacheDir)) {
        fs.rmSync(nextCacheDir, { recursive: true, force: true });
    }

    console.log(`  Done: ${variant.name}\n`);
}

const meta = {
    'create-next-app': expectedVersion
};

fs.writeFileSync(
    path.join(appsDir, '.generator-meta.json'),
    JSON.stringify(meta, null, 2) + '\n'
);

console.log(`Generated ${variants.length} variants with create-next-app@${expectedVersion}`);
console.log('Metadata written to .generator-meta.json');
console.log('\nCommit the generated apps and their package-lock.json files.');
