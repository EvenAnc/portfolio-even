/**
 * ESLint configuration: catches bugs first, then keeps one style.
 * ecmaVersion 2021 also reports any syntax too recent for Safari 15.
 */

import js from '@eslint/js';
import globals from 'globals';

const bugRules = {
    'array-callback-return': 'error',
    'consistent-return': 'error',
    'default-param-last': 'error',
    'eqeqeq': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-constructor-return': 'error',
    'no-implicit-globals': 'error',
    'no-param-reassign': 'error',
    'no-promise-executor-return': 'error',
    'no-self-compare': 'error',
    'no-shadow': 'error',
    'no-template-curly-in-string': 'error',
    'no-unreachable-loop': 'error',
    'no-unused-expressions': 'error',
    'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'all' }],
    'no-use-before-define': ['error', { functions: false }],
    'no-var': 'error',
    'prefer-const': 'error',
    'radix': 'error',
};

const styleRules = {
    'arrow-parens': ['error', 'as-needed'],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'camelcase': ['error', { properties: 'never' }],
    'comma-dangle': ['error', 'always-multiline'],
    'curly': ['error', 'multi-line'],
    'dot-notation': 'error',
    'eol-last': 'error',
    'indent': ['error', 4, { SwitchCase: 1 }],
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
    'no-else-return': 'error',
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
    'space-infix-ops': 'error',
};

export default [
    { ignores: ['vendor/**'] },
    js.configs.recommended,
    {
        linterOptions: { reportUnusedDisableDirectives: 'error' },
        rules: { ...bugRules, ...styleRules },
    },
    {
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                // Classic scripts loaded before the modules.
                gsap: 'readonly',
                ScrollTrigger: 'readonly',
                Lenis: 'readonly',
                pdfjsLib: 'readonly',
            },
        },
    },
    {
        // Prose full of apostrophes: double quotes avoid escaping them.
        files: ['js/i18n/dictionary.js'],
        rules: { quotes: ['error', 'double'] },
    },
    {
        files: ['sw.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'script',
            globals: globals.serviceworker,
        },
        // The worker script owns its global scope.
        rules: { 'no-implicit-globals': 'off' },
    },
    {
        files: ['eslint.config.js'],
        languageOptions: { ecmaVersion: 2021, sourceType: 'module' },
    },
];
