import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export class PatchNodePackageInstallTask extends NodePackageInstallTask {
    // TODO: remove this patch before merge
    constructor() {
        super({
            packageManager: 'npm',
            packageName: '--legacy-peer-deps',
            allowScripts: true,
        });
    }

    toConfiguration(): any {
        const rootConfigurations = super.toConfiguration();
        const customOptions = Object.assign({}, rootConfigurations.options, { allowScripts: true });

        return {
            name: rootConfigurations.name,
            dependencies: rootConfigurations.dependencies,
            options: customOptions
        };
    }
}
