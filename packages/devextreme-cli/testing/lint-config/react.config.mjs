import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
    { ignores: ['node_modules/'] },
    js.configs.recommended,
    {
        files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
        ...reactPlugin.configs.flat.recommended,
        languageOptions: {
            ...reactPlugin.configs.flat.recommended.languageOptions,
            ecmaVersion: 2018,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true }
            },
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.jest
            }
        },
        plugins: {
            ...reactPlugin.configs.flat.recommended.plugins,
            'react-hooks': reactHooks,
            'unused-imports': unusedImports
        },
        settings: {
            react: { version: 'detect' }
        },
        rules: {
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
            'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^props' }],
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
