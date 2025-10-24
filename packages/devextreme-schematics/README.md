# DevExtreme Schematics
DevExtreme schematics are workflow tools you can use in an Angular application created with [DevExtreme CLI](https://github.com/devexpress/DevExtreme-CLI) to add DevExtreme libraries or views and perform other DevExtreme-related tasks. Read [this article](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2) for more information on Angular Schematics.

## Included Schematics

This package includes the following schematics:

- [install](src/install)  
 Adds DevExtreme to an Angular application

- [add-layout](src/add-layout)  
 Adds a DevExtreme layout to a DevExtreme Angular application

- [add-app-template](src/add-app-template)  
 Adds a DevExtreme layout template to an Angular application

- [add-sample-views](src/add-sample-views)  
 Adds sample views to a DevExtreme Angular application

- [add-view](src/add-view)  
 Adds a view to a DevExtreme Angular application

## TypeScript Dependency & Global CLI Usage

Some DevExtreme migration schematics require TypeScript to process inline Angular templates. The CLI attempts to resolve TypeScript from multiple locations:

- The CLI's own node_modules
- Your project's node_modules
- The global node_modules

If TypeScript is not found, inline template migration will be skipped and a warning will be shown with resolution attempts and errors.

### How to Fix TypeScript Not Available

1. **Local Project:** Install TypeScript in your project root:
   ```sh
   npm install typescript --save-dev
   ```
2. **Global CLI:** If you use the CLI globally, also install TypeScript globally:
   ```sh
   npm install -g typescript
   ```
3. **npx Usage:** If you use npx, ensure TypeScript is available in your workspace or globally.
4. **Troubleshooting:**
   - Some npm global installs may not link dependencies as expected. If you see repeated TypeScript resolution errors, try running the CLI from a project where TypeScript is installed locally.
   - You can also manually link TypeScript to your global node_modules if needed.

If you continue to see errors, review the warning output for resolution attempts and check your npm/node installation paths.
