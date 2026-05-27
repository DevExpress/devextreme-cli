import dxSecurityPlugin from '@devexpress/eslint-plugin-dx-security';
import tsParser from '@typescript-eslint/parser';

export default [
    ...dxSecurityPlugin.configs['required-exclusive'],
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
        },
    },
];
