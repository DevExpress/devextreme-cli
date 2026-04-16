#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const latestVersions = require('../../packages/devextreme-cli/src/utility/latest-versions');
const version = latestVersions['create-next-app'];

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

const scriptDir = __dirname;

// Parse min-release-age from .npmrc to pass as env var to create-next-app,
// so its internal npm install also respects the setting
const npmrcPath = path.join(scriptDir, '.npmrc');
const npmrcContent = fs.readFileSync(npmrcPath, 'utf8');
const minReleaseAgeMatch = npmrcContent.match(/^min-release-age=(.+)$/m);
const npmEnv = { ...process.env };
if (minReleaseAgeMatch) {
    npmEnv.npm_config_min_release_age = minReleaseAgeMatch[1];
}

console.log(`Generating ${variants.length} Next.js test apps with create-next-app@${version}\n`);

for (const variant of variants) {
    const appDir = path.join(scriptDir, variant.name);

    if (fs.existsSync(appDir)) {
        fs.rmSync(appDir, { recursive: true, force: true });
    }

    const args = [
        `create-next-app@${version}`,
        variant.name,
        variant.typescript ? '--ts' : '--js',
        variant.srcDir ? '--src-dir' : '--no-src-dir',
        variant.appRouter ? '--app' : '--no-app',
        '--eslint',
        '--no-tailwind',
        '--no-react-compiler',
        '--import-alias="@/*"',
        '--no-git',
        '--use-npm'
    ];

    console.log(`Creating ${variant.name}...`);
    execSync(`npx ${args.join(' ')}`, {
        cwd: scriptDir,
        stdio: 'inherit',
        env: npmEnv
    });

    fs.copyFileSync(path.join(scriptDir, '.npmrc'), path.join(appDir, '.npmrc'));

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
    'create-next-app': version,
    generatedAt: new Date().toISOString(),
    variants: variants.map(v => v.name)
};

fs.writeFileSync(
    path.join(scriptDir, '.generator-meta.json'),
    JSON.stringify(meta, null, 2) + '\n'
);

console.log(`Generated ${variants.length} variants with create-next-app@${version}`);
console.log('Metadata written to .generator-meta.json');
console.log('\nCommit the generated apps and their package-lock.json files.');
