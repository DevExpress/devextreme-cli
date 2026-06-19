import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import { fixupConfigRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const tsFiles = ['**/*.ts', '**/*.tsx'];

export default [
    ...fixupConfigRules(compat.extends('angular', 'plugin:angular/johnpapa')).map(config => ({
        ...config,
        files: tsFiles
    })),
    {
        files: tsFiles,
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2018,
            sourceType: 'module',
            globals: {
                ...globals.node
            }
        },
        rules: {
            'angular/log': 'off'
        }
    }
];
