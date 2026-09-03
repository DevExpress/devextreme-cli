import { Tree } from '@angular-devkit/schematics';
import {
  createSourceFile,
  ScriptTarget,
  SourceFile
} from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';

export function getSourceFile(host: Tree, filePath: string): SourceFile | undefined {
  const buffer = host.read(filePath);

  if (!buffer) {
    return;
  }
  const serializedFile = host.read(filePath)!.toString();
  return createSourceFile(filePath, serializedFile, ScriptTarget.Latest, true);
}
