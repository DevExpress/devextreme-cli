import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
    {
        ignores: [
            'src/*/files/**',
            '**/*.d.ts',
            '**/*.js'
        ]
    },
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: 'module'
        },
        plugins: {
            '@typescript-eslint': tsPlugin
        },
        rules: {
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }],
            '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
            '@typescript-eslint/member-ordering': 'error',
            '@typescript-eslint/no-empty-object-type': 'error',
            '@typescript-eslint/no-misused-new': 'error',
            '@typescript-eslint/no-namespace': 'error',
            '@typescript-eslint/no-require-imports': 'error',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/no-unsafe-function-type': 'error',
            '@typescript-eslint/no-unused-expressions': 'error',
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/prefer-function-type': 'error',
            '@typescript-eslint/triple-slash-reference': 'error',
            '@typescript-eslint/unified-signatures': 'error',
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: 'typeLike', format: ['PascalCase'] },
                { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] }
            ],
            'brace-style': ['error', '1tbs'],
            'comma-spacing': 'error',
            'constructor-super': 'error',
            'curly': 'error',
            'eol-last': 'error',
            'eqeqeq': ['error', 'always', { null: 'ignore' }],
            'guard-for-in': 'error',
            'keyword-spacing': 'error',
            'max-classes-per-file': ['error', 1],
            'max-len': ['error', { code: 120, ignoreTemplateLiterals: true }],
            'new-parens': 'error',
            'no-bitwise': 'error',
            'no-caller': 'error',
            'no-cond-assign': 'error',
            'no-console': 'error',
            'no-debugger': 'error',
            'no-empty': 'error',
            'no-eval': 'error',
            'no-multiple-empty-lines': ['error', { max: 1 }],
            'no-new-wrappers': 'error',
            'no-tabs': 'error',
            'no-throw-literal': 'error',
            'no-trailing-spaces': 'error',
            'no-undef-init': 'error',
            'no-unsafe-finally': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'one-var': ['error', 'never'],
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'quote-props': ['error', 'consistent-as-needed'],
            'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
            'radix': 'error',
            'semi': ['error', 'always'],
            'space-before-blocks': 'error',
            'space-before-function-paren': ['error', { anonymous: 'never', named: 'never', asyncArrow: 'always' }],
            'space-infix-ops': 'error',
            'spaced-comment': ['error', 'always'],
            'use-isnan': 'error'
        }
    }
];
