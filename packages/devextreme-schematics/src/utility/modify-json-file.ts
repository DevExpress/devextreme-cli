import { Tree } from '@angular-devkit/schematics';

export function modifyJSONFile(host: Tree, path: string, callback: (obj: any) => any) {
  let serializedConfig = host.read(path)!.toString();
  serializedConfig = serializedConfig.replace(/\/\*[\S\s]+?\*\/\r?\n/g, '');
  let obj = JSON.parse(serializedConfig);

  obj = callback(obj);

  host.overwrite(path, `${JSON.stringify(obj, null, 2)}\n`);

  return host;
}
