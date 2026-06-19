import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import jestPlugin from 'eslint-plugin-jest';
import prettierConfig from 'eslint-config-prettier';

export default [
    { ignores: ['node_modules/'] },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2018,
            sourceType: 'module',
            parserOptions: {
                project: './testing/sandbox/react-ts/my-app/tsconfig.json',
                ecmaFeatures: { jsx: true, useJSXTextNode: true }
            },
            globals: {
                ...globals.browser,
                ...globals.es2017,
                ...globals.jest
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'react-hooks': reactHooks,
            'unused-imports': unusedImports,
            jest: jestPlugin
        },
        settings: {
            react: { version: 'detect' },
            'import/resolver': {
                node: { extensions: ['.ts', '.tsx'] }
            }
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            ...jestPlugin.configs.recommended.rules,
            ...prettierConfig.rules,
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error'],
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    varsIgnorePattern: '^props',
                    args: 'after-used',
                    argsIgnorePattern: '^props'
                }
            ],
            'react/display-name': 'off',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off'
        }
    }
];
