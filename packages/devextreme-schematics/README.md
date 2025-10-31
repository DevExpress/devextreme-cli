# DevExtreme Schematics
DevExtreme Schematics are Angular workflow tools for applications created with [DevExtreme CLI](https://github.com/devexpress/DevExtreme-CLI). You can use these tools to add application views and layouts to your apps or to perform other tasks related to DevExtreme and the DevExtreme [Angular Application Template](https://devexpress.github.io/devextreme-angular-template). For more information on Angular Schematics, refer to the following topic: [Introduction to Angular Schematics](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2).

## Included Schematics

This package includes the following schematics:

- [install](src/install)  
 Adds DevExtreme to an Angular application.

- [add-layout](src/add-layout)  
 Adds a DevExtreme layout to an Angular application.

- [add-app-template](src/add-app-template)  
 Adds a DevExtreme app template to an Angular application.

- [add-sample-views](src/add-sample-views)  
 Adds sample views to an Angular application.

- [add-view](src/add-view)  
 Adds a view to an Angular application.

## TypeScript Dependency & Global CLI Usage

Some DevExtreme migration schematics require TypeScript to process inline Angular templates. The CLI attempts to resolve TypeScript from multiple locations:

- The CLI's own node_modules
- Your project's node_modules
- The global node_modules

If the CLI fails to find TypeScript, it skips inline template migration and displays a warning message that contains resolution attempts and errors.

### How to Install TypeScript

1. **Local Project:** To install TypeScript in a project, run the following command:
   ```sh
   npm install typescript --save-dev
   ```
2. **Global CLI:** To install TypeScript globally on your machine, run the following command:
   ```sh
   npm install -g typescript
   ```

**Troubleshooting**

   - Some npm global installs may not link dependencies as expected. If you experience repeated TypeScript resolution errors, try running CLI commands from a project where TypeScript is installed locally.
   - You can also manually link TypeScript to your global node_modules if needed.

If you continue to see errors, review the warning output for resolution attempts and check your npm/node installation paths.
