import { Tree } from '@angular-devkit/schematics';
import * as parse5 from 'parse5';
import picomatch from 'picomatch';

// Dynamically require TypeScript if available; skip inline template migration if not.
let ts: any = null;
let tsResolutionError: string | null = null;
try {
  // tslint:disable-next-line:no-var-requires
  ts = require('typescript');
} catch (err) {
  tsResolutionError = err?.message || String(err);
}

// Minimal parse5 types for our usage
interface P5Node { [k: string]: any; }
interface P5Element extends P5Node { tagName?: string; }
interface P5Document extends P5Node {
  documentElement?: P5Element;
}

export interface HostRule {
  hostSelector: string;
  configMap: Record<string, string>;
}

export interface RunnerOptions {
  includeGlobs: string[];
  rules: HostRule[];
}

export interface ExecOptions {
  dryRun: boolean;
  logger: { info: (s: string) => void; warn: (s: string) => void };
}

// Transform external HTML template files matched by includeGlobs.
export async function applyHostAwareTemplateMigrations(
  tree: Tree,
  runner: RunnerOptions,
  exec: ExecOptions
): Promise<void> {
  const matcher = picomatch(runner.includeGlobs.length ? runner.includeGlobs : ['**/*.html']);

  tree.visit(filePath => {
    if (!matcher(filePath)) {
      return;
    }
    if (!filePath.endsWith('.html')) {
      return;
    }

    const buffer = tree.read(filePath);
    if (!buffer) {
      return;
    }

    const source = buffer.toString('utf8');
    const { updated, changeCount } = transformTemplate(source, runner.rules);
    if (changeCount === 0) {
      return;
    }
    if (exec.dryRun) {
      exec.logger.info(`[dry] ${filePath} → ${changeCount} changes`);
    } else {
      exec.logger.info(`${filePath} → ${changeCount} changes`);
      tree.overwrite(filePath, updated);
    }
  });
}

// Apply migrations inside inline component templates found in TS/JS files.
export async function applyInlineComponentTemplateMigrations(
  tree: Tree,
  runner: RunnerOptions,
  exec: ExecOptions,
  scriptGlobs: string[]
): Promise<void> {
  if (!scriptGlobs.length) {
    return;
  }
  if (!ts) {
      exec.logger.warn(
        '[config-migrator] Failed to import TypeScript. Skipping inline template migration.\n' +
        (tsResolutionError ? `Error: ${tsResolutionError}\n` : '') +
        'Ensure the "typescript" package is installed in your project. Try to reinstall DevExtreme Schematics if the issue persists.'
      );
      return;
  }
  const matcher = picomatch(scriptGlobs);
  tree.visit(filePath => {
    if (!matcher(filePath)) {
      return;
    }
    if (!(filePath.endsWith('.ts') || filePath.endsWith('.js'))) {
      return;
    }

    const buffer = tree.read(filePath);
    if (!buffer) {
      return;
    }
    const sourceText = buffer.toString('utf8');

    const sf = ts.createSourceFile(
      filePath, sourceText, ts.ScriptTarget.ES2022, true,
      filePath.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS);

    interface TemplateEdit { start: number; end: number; text: string; changes: number; }
    const edits: TemplateEdit[] = [];

    function visit(node: any) {
      if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
        const call = node.expression;
        if (ts.isIdentifier(call.expression) && call.expression.text === 'Component' && call.arguments.length) {
          const arg = call.arguments[0];
          if (ts.isObjectLiteralExpression(arg)) {
            for (const prop of arg.properties) {
              if (!ts.isPropertyAssignment(prop)) {
                continue;
              }
              const name = prop.name;
              const propName = ts.isIdentifier(name) ? name.text : ts.isStringLiteral(name) ? name.text : undefined;
              if (propName !== 'template') {
                continue;
              }
              const init = prop.initializer;
              if (ts.isStringLiteral(init)) {
                const raw = init.text;
                const { updated, changeCount } = transformTemplate(raw, runner.rules);
                if (changeCount > 0) {
                  const quote = init.getText().startsWith("'") ? '"' : init.getText()[0];
                  const newLiteral = quote + updated.replace(new RegExp(quote, 'g'), '\\' + quote) + quote;
                  edits.push({ start: init.getStart(), end: init.getEnd(), text: newLiteral, changes: changeCount });
                }
              } else if (ts.isNoSubstitutionTemplateLiteral(init)) {
                const raw = init.text;
                const { updated, changeCount } = transformTemplate(raw, runner.rules);
                if (changeCount > 0) {
                  const newLiteral = '`' + escapeBackticks(updated) + '`';
                  edits.push({ start: init.getStart(), end: init.getEnd(), text: newLiteral, changes: changeCount });
                }
              } else if (ts.isTemplateExpression(init)) {
                const { placeholderContent, placeholders } = flattenTemplateExpression(init, sourceText);
                const { updated, changeCount } = transformTemplate(placeholderContent, runner.rules);
                if (changeCount > 0) {
                  let rebuilt = updated;
                  placeholders.forEach(placeholder => {
                    rebuilt = rebuilt.replace(new RegExp(placeholder.token, 'g'), placeholder.fullText);
                  });
                  const newLiteral = '`' + escapeBackticks(rebuilt) + '`';
                  edits.push({ start: init.getStart(), end: init.getEnd(), text: newLiteral, changes: changeCount });
                }
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);

    if (!edits.length) {
      return;
    }
    edits.sort((a, b) => b.start - a.start); // edits from last to first
    let updatedFile = sourceText;
    for (const edit of edits) {
      updatedFile = updatedFile.slice(0, edit.start) + edit.text + updatedFile.slice(edit.end);
    }
    const totalChanges = edits.reduce((acc, edit) => acc + edit.changes, 0);
    if (exec.dryRun) {
      exec.logger.info(
        `[dry] ${filePath} (inline templates) → ${totalChanges} changes in ${edits.length} template(s)`);
    } else {
      exec.logger.info(
        `${filePath} (inline templates) → ${totalChanges} changes in ${edits.length} template(s)`);
      tree.overwrite(filePath, updatedFile);
    }
  });
}

export function transformTemplate(
  source: string,
  rules: RunnerOptions['rules']
): { updated: string; changeCount: number } {
  const document = parse5.parse(source, { sourceCodeLocationInfo: true }) as unknown as P5Document;
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  const hostSelectorSet = new Set(rules.map(rule => rule.hostSelector));

  const seenOpens = new Set<number>();
  const seenCloses = new Set<number>();

  function walkHost(root: P5Element, visitFn: (node: P5Node) => void) {
    function recursiveWalk(node: P5Node) {
      visitFn(node);
      const childNodes = (node as any).childNodes as P5Node[] | undefined;
      if (!childNodes) {
        return;
      }
      for (const childNode of childNodes) {
        if (isElement(childNode) && hostSelectorSet.has((childNode as any).tagName) && childNode !== root) {
          continue;
        }
        recursiveWalk(childNode);
      }
    }
    recursiveWalk(root);
  }

  for (const rule of rules) {
    const hosts = findElementsByTag(document, rule.hostSelector);
    for (const host of hosts) {
      if (!(host as any).sourceCodeLocation) {
        continue;
      }
      walkHost(host, (node) => {
        if (!isElement(node)) {
          return;
        }
        const oldName: string | undefined = (node as any).tagName;
        if (!oldName) {
          return;
        }
        const newName = rule.configMap[oldName];
        if (!newName) {
          return;
        }
        const loc: any = (node as any).sourceCodeLocation;
        if (!loc) {
          return;
        }
        if (loc.startTag) {
          const openStart = loc.startTag.startOffset + 1;
          const openEnd = openStart + oldName.length;
          if (!seenOpens.has(openStart)) {
            seenOpens.add(openStart);
            replacements.push({ start: openStart, end: openEnd, text: newName });
          }
        }
        if (loc.endTag) {
          const endStart = loc.endTag.startOffset + 2;
          const endEnd = endStart + oldName.length;
          if (!seenCloses.has(endStart)) {
            seenCloses.add(endStart);
            replacements.push({ start: endStart, end: endEnd, text: newName });
          }
        }
      });
    }
  }

  if (!replacements.length) {
    return { updated: source, changeCount: 0 };
  }
  replacements.sort((a, b) => b.start - a.start);
  let updated = source;
  for (const replacement of replacements) {
    updated = updated.slice(0, replacement.start) + replacement.text + updated.slice(replacement.end);
  }
  return { updated, changeCount: replacements.length };
}

// Helpers

function flattenTemplateExpression(
  node: any,
  source: string
): { placeholderContent: string; placeholders: Array<{ token: string; fullText: string }> } {
  const placeholders: Array<{ token: string; fullText: string }> = [];
  let content = node.head.text;
  node.templateSpans.forEach((span: any, i: number) => {
    const token = `__NG_EXPR_PLACEHOLDER_${i}__`;
    const fullText = '${' + source.slice(span.expression.getStart(), span.expression.getEnd()) + '}';
    placeholders.push({ token, fullText });
    content += token + span.literal.text;
  });
  return { placeholderContent: content, placeholders };
}

function escapeBackticks(text: string): string {
  // First escape backslashes, then escape backticks
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
}

// Utilities

function isElement(n: P5Node): n is P5Element {
  return (n as any).tagName !== undefined;
}

function walk(node: P5Node, visit: (n: P5Node) => void) {
  visit(node);
  const childNodes = (node as any).childNodes as P5Node[] | undefined;
  if (!childNodes) {
    return;
  }
  for (const childNode of childNodes) {
    walk(childNode, visit);
  }
}

function findElementsByTag(doc: P5Document | P5Element, tag: string): P5Element[] {
  const result: P5Element[] = [];
  walk(doc as unknown as P5Node, (node) => {
    if (isElement(node) && node.tagName === tag) {
      result.push(node);
    }
  });
  return result;
}
