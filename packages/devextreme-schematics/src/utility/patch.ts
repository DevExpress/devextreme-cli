import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export class PatchNodePackageInstallTask extends NodePackageInstallTask {
    toConfiguration = (): any => {
        const rootConfigurations = super.toConfiguration();
        const customOptions = Object.assign({}, rootConfigurations.options, { allowScripts: true });

        return {
            name: rootConfigurations.name,
            dependencies: rootConfigurations.dependencies,
            options: customOptions
        };
    }
}
