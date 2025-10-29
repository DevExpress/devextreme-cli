# migrate-config-components

A schematic that migrates deprecated DevExtreme configuration components.

## Description

This schematic automatically migrates deprecated DevExtreme Angular configuration components. The migration command is available as a top-level DevExtreme CLI command that you can run from any directory.

## Usage

### Via DevExtreme CLI (Recommended)

The migration command can be run from any directory and will work both inside and outside Angular workspaces:

```bash
devextreme migrate angular-config-components
```

### Options (All Optional)

- `--include`: Glob patterns of template files to include (default: `**/*.html`). Separate multiple patterns with commas.
- `--script-include`: Glob patterns for TypeScript/JavaScript files to scan for inline `@Component({ template })` (default: `**/*.ts,**/*.js`). Set to empty to disable.
- `--dry`: Run in dry mode to preview changes without applying them (default: `false`)

### Examples

```bash
# Migrate all HTML templates and inline templates (using defaults)
devextreme migrate angular-config-components

# Migrate only specific files
devextreme migrate angular-config-components --include="src/app/**/*.html,src/shared/**/*.html"

# Preview changes without applying them
devextreme migrate angular-config-components --dry

# Migrate only HTML templates, skip inline templates
devextreme migrate angular-config-components --script-include=""

# Combine multiple options
devextreme migrate angular-config-components --include="*.html,*.ts" --dry
```

### Via Angular CLI

Alternatively, you can run the schematic directly with Angular CLI:

```bash
ng g devextreme-schematics:migrate-config-components
```

## What it does

This schematic automatically updates your templates to replace deprecated nested components with the new config-based component structure. For example:

**Before (deprecated nested):**
```html
<dx-data-grid>
  <dxi-column field="name"></dxi-column>
  <dxi-column field="age"></dxi-column>
</dx-data-grid>
```

**After (config-based):**
```html
<dx-data-grid>
  <dxi-data-grid-column field="name"></dxi-data-grid-column>
  <dxi-data-grid-column field="age"></dxi-data-grid-column>
</dx-data-grid>
```

### Why migrate?

DevExtreme Angular components are moving from a nested structure (e.g., `<dxi-column>`) to a config-based structure (e.g., `<dxi-data-grid-column>`) for improved clarity, maintainability, and future compatibility. This schematic automates the migration process to help you keep your codebase up to date with the latest DevExtreme standards.

## Requirements

- Node.js and npm/yarn installed
- Angular application with DevExtreme components (when running inside a workspace)
- DevExtreme Angular version that supports the new component structure

## Notes

- The command can be run from any directory, not just Angular workspaces
- When run outside an Angular workspace, the underlying Angular CLI will show appropriate error messages
- All options are optional and have sensible defaults
- The command uses the latest version of `devextreme-schematics` automatically
