import { fixupPluginRules } from '@eslint/compat';
import angularConfig from 'eslint-config-angular';
import angularPlugin from 'eslint-plugin-angular';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

const tsFiles = ['**/*.ts', '**/*.tsx'];

export default [
    {
        files: tsFiles,
        plugins: {
            angular: fixupPluginRules(angularPlugin)
        },
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2018,
            sourceType: 'module',
            globals: {
                ...angularConfig.globals,
                ...globals.node
            }
        },
        rules: {
            ...angularConfig.rules,
            ...angularPlugin.configs.johnpapa.rules,
            'angular/log': 'off'
        }
    }
];
