import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { applyHostAwareTemplateMigrations, applyInlineComponentTemplateMigrations } from './template-migrator';
import mapping from './mappings/deprecated-config-map.json';

export interface Options {
  include?: string[];
  dry?: boolean;
  scriptInclude?: string[];
}

export function migrateConfigComponents(options: Options = {}): Rule {
  // Accept --include as array or comma-separated string
  let include: string[] = ['**/*.html'];
  const rawInclude = options.include;
  if (Array.isArray(rawInclude) && rawInclude.length) {
    include = rawInclude;
  } else if (typeof rawInclude === 'string' && rawInclude) {
    let str = (rawInclude as string).trim();
    if (str.startsWith('[') && str.endsWith(']')) {
      str = str.slice(1, -1);
    }
    include = str.split(',').map((s: string) => s.trim()).filter((s: string) => !!s);
  }

  // Coerce string 'true'/'false' to boolean for dry option
  let dryFlag: boolean = false;
  if (typeof options.dry === 'string') {
    dryFlag = options.dry === 'true';
  } else {
    dryFlag = !!options.dry;
  }

  // Accept --script-include as array or comma-separated string
  let scriptGlobs: string[] = ['**/*.ts', '**/*.js'];
  const rawScriptInclude = options.scriptInclude;
  if (Array.isArray(rawScriptInclude) && rawScriptInclude.length) {
    scriptGlobs = rawScriptInclude;
  } else if (typeof rawScriptInclude === 'string' && rawScriptInclude) {
    let str = (rawScriptInclude as string).trim();
    if (str.startsWith('[') && str.endsWith(']')) {
      str = str.slice(1, -1);
    }
    scriptGlobs = str.split(',').map((s: string) => s.trim()).filter((s: string) => !!s);
  }

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
    }) as import('./template-migrator').HostRule[];

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
