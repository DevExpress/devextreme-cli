import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import type { HostRule } from './template-migrator';
import { applyHostAwareTemplateMigrations, applyInlineComponentTemplateMigrations } from './template-migrator';
import mapping from './mappings/deprecated-config-map.json';

export interface Options {
  include?: string | string[];
  dry?: boolean | string;
  scriptInclude?: string | string[];
}

export function migrateConfigComponents(options: Options = {}): Rule {
  const include = normalizeGlobOption(options.include, ['**/*.html']);
  const dryFlag = normalizeBoolean(options.dry);
  const scriptGlobs = normalizeGlobOption(options.scriptInclude, ['**/*.ts', '**/*.js']);

  return async (tree: Tree, ctx: SchematicContext): Promise<void> => {
    ctx.logger.info(`[config-migrator] Starting…`);

    type HostMap = Record<string, { _hostSelector?: string } & Record<string, string>>;
    const hostMap = mapping as unknown as HostMap;

    const processedMapping = Object.entries(hostMap).map(([hostComponentName, map]) => {
      const hostSelector = map._hostSelector ?? componentToSelectorGuess(hostComponentName);
      const configMap: Record<string, string> = Object.fromEntries(
        Object.entries(map).filter(([k]) => k !== '_hostSelector')
      );
      return { hostSelector, configMap };
    }) as HostRule[];

    // External HTML templates
    await applyHostAwareTemplateMigrations(tree, {
      includeGlobs: include,
      rules: processedMapping
    }, { dryRun: dryFlag, logger: ctx.logger });

    // Inline templates inside component decorators (ts/js)
    await applyInlineComponentTemplateMigrations(tree, {
      includeGlobs: [], rules: processedMapping
    }, { dryRun: dryFlag, logger: ctx.logger }, scriptGlobs);

    ctx.logger.info(`[config-migrator] Done.`);
  };
}

// Fallback if _hostSelector is missing: "DxFooBarComponent" -> "dx-foo-bar"
function componentToSelectorGuess(componentName: string): string {
  const core = componentName.replace(/Component$/, '').replace(/^Dx/, 'dx-');
  return core.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function normalizeGlobOption(
  value: Options['include'] | Options['scriptInclude'],
  fallback: string[]
): string[] {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    const inner = trimmed.startsWith('[') && trimmed.endsWith(']')
      ? trimmed.slice(1, -1)
      : trimmed;
    return inner
      .split(',')
      .map(segment => segment.trim())
      .filter(Boolean);
  }
  return fallback.slice();
}

function normalizeBoolean(value: Options['dry']): boolean {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return !!value;
}
