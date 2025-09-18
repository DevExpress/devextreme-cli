import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { applyHostAwareTemplateMigrations, applyInlineComponentTemplateMigrations } from './template-migrator';
import mapping from './mappings/deprecated-nested-map.json';

export interface Options {
  include?: string[];
  dry?: boolean;
  scriptInclude?: string[];
}

export function migrateNestedComponents(options: Options = {}): Rule {
  const include = options.include?.length ? options.include : ['**/*.html'];

  return async (tree: Tree, ctx: SchematicContext): Promise<void> => {
    ctx.logger.info(`[nested-migrator] Starting…`);

    type HostMap = Record<string, { _hostSelector?: string } & Record<string, string>>;
    const hostMap = mapping as unknown as HostMap;

    const processedMapping = Object.entries(hostMap).map(([hostComponentName, map]) => {
      const hostSelector = map._hostSelector ?? componentToSelectorGuess(hostComponentName);
      const nestedMap: Record<string, string> = Object.fromEntries(
        Object.entries(map).filter(([k]) => k !== '_hostSelector')
      );
      return { hostSelector, nestedMap };
    });

    // External HTML templates
    await applyHostAwareTemplateMigrations(tree, {
      includeGlobs: include,
      rules: processedMapping
    }, { dryRun: !!options.dry, logger: ctx.logger });

    // Inline templates inside component decorators (ts/js)
    const scriptGlobs = options.scriptInclude === undefined ? ['**/*.ts', '**/*.js'] : options.scriptInclude;
    await applyInlineComponentTemplateMigrations(tree, {
      includeGlobs: [], rules: processedMapping
    }, { dryRun: !!options.dry, logger: ctx.logger }, scriptGlobs);

    ctx.logger.info(`[nested-migrator] Done.`);
  };
}

// Fallback if _hostSelector is missing: "DxFooBarComponent" -> "dx-foo-bar"
function componentToSelectorGuess(componentName: string): string {
  const core = componentName.replace(/Component$/, '').replace(/^Dx/, 'dx-');
  return core.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
