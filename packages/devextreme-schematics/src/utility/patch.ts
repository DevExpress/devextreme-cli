import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export class PatchNodePackageInstallTask extends NodePackageInstallTask {
    toConfiguration = (): any => {
        const rootOptions = super.toConfiguration();
        const resultObject = {
            name: rootOptions.name,
            dependencies: rootOptions.dependencies,
            options: Object.assign({}, rootOptions.options, { allowScripts: true })
        };

        return resultObject;
    }
}
