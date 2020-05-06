import { strings } from '@angular-devkit/core';

export function humanize(str: string) {
  return str.split('-').map((part: string) => strings.capitalize(part)).join(' ');
}
