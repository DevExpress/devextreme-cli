import { Tree } from '@angular-devkit/schematics';

export const parseJson = (str: string) => {
  return JSON.parse(str.replace(/\/\*[\S\s]+?\*\/\r?\n/g, ''));
};

export function modifyJSONFile(host: Tree, path: string, callback: (obj: any) => any) {
  const serializedConfig = host.read(path)!.toString();
  let obj = parseJson(serializedConfig);

  obj = callback(obj);

  host.overwrite(path, `${JSON.stringify(obj, null, 2)}\n`);

  return host;
}
