import globals from 'globals';

export default [
    {
        ignores: [
            'src/templates/**',
            'testing/sandbox/**'
        ]
    },
    {
        linterOptions: {
            reportUnusedDisableDirectives: 'off'
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    globalReturn: true
                }
            },
            globals: {
                ...globals.node,
                ...globals.es2022,
                setInterval: 'readonly',
                setTimeout: 'readonly',
                clearInterval: 'readonly',
                clearTimeout: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly'
            }
        },
        rules: {
            'block-spacing': 'error',
            'comma-spacing': 'error',
            'computed-property-spacing': 'error',
            'comma-style': ['error', 'last'],
            'eqeqeq': ['error', 'allow-null'],
            'strict': 'error',
            'func-call-spacing': 'error',
            'key-spacing': 'error',
            'keyword-spacing': [
                'error',
                {
                    overrides: {
                        catch: { after: false },
                        for: { after: false },
                        if: { after: false },
                        switch: { after: false },
                        while: { after: false }
                    }
                }
            ],
            'linebreak-style': ['error', 'unix'],
            'no-multiple-empty-lines': ['error', { max: 2 }],
            'no-irregular-whitespace': 'error',
            'no-multi-spaces': 'error',
            'no-trailing-spaces': 'error',
            'no-new-func': 'error',
            'no-eval': 'error',
            'no-undef': 'error',
            'no-unused-expressions': 'off',
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
            'no-extend-native': 'error',
            'no-alert': 'error',
            'no-whitespace-before-property': 'error',
            'object-curly-spacing': ['error', 'always'],
            'semi-spacing': 'error',
            'semi': 'error',
            'space-before-blocks': 'error',
            'space-before-function-paren': ['error', 'never'],
            'space-in-parens': 'error',
            'space-infix-ops': 'error',
            'space-unary-ops': 'error',
            'spaced-comment': ['error', 'always', { markers: ['/'] }],
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            'curly': ['error', 'multi-line', 'consistent'],
            'unicode-bom': ['error', 'never'],
            'eol-last': ['error', 'always'],
            'indent': [
                'error',
                4,
                {
                    SwitchCase: 1,
                    MemberExpression: 1,
                    CallExpression: {
                        arguments: 1
                    }
                }
            ],
            'quotes': ['error', 'single']
        }
    },
    {
        files: ['testing/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.jest
            }
        }
    }
];
