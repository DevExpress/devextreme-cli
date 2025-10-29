# migrate-config-components

A schematic that migrates old DevExtreme configuration components.

## Description

This schematic automatically migrates old DevExtreme Angular configuration components. The migration command is available as a top-level DevExtreme CLI command that you can run from any directory.

## Usage

### Via DevExtreme CLI (Recommended)

You can run the migration command from any directory, including both inside and outside Angular workspaces:

```bash
devextreme migrate angular-config-components
```

### Options (All Optional)

- `--include`: Glob patterns of template files to include (default: `**/*.html`). Separate multiple patterns with commas.
- `--script-include`: Glob patterns for TypeScript/JavaScript files to scan for inline templates (default: `**/*.ts,**/*.js`). Set empty ('' or []) to disable.
- `--dry`: Run in dry mode to preview changes without applying them (default: `false`).

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

You can also use the Angular CLI to run the schematic:

```bash
ng g devextreme-schematics:migrate-config-components
```

## Sample results

**Old configuration components:**
```html
<dx-data-grid>
  <dxi-column field="name"></dxi-column>
  <dxi-column field="age"></dxi-column>
</dx-data-grid>
```

**New configuration components:**
```html
<dx-data-grid>
  <dxi-data-grid-column field="name"></dxi-data-grid-column>
  <dxi-data-grid-column field="age"></dxi-data-grid-column>
</dx-data-grid>
```

## Requirements

- Node.js and npm or yarn
- Angular application with DevExtreme components
- DevExtreme Angular version that supports new configuration components structure
