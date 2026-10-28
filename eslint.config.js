import js from '@eslint/js';
import globals from 'globals';

// Clean Code limits: small functions, shallow nesting, few arguments, no clever tricks.
const cleanCode = {
  'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['error', { max: 20, skipBlankLines: true, skipComments: true }],
  'max-statements': ['error', 10],
  'max-params': ['error', 3],
  'max-depth': ['error', 2],
  'max-nested-callbacks': ['error', 3],
  complexity: ['error', 6],
  'max-len': ['error', { code: 130, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true }],
  'id-length': ['error', { min: 2, exceptions: ['_', 'a', 'b', 'x', 'y'] }],
  'no-nested-ternary': 'error',
  'no-param-reassign': 'error',
  'no-else-return': 'error',
  'no-var': 'error',
  'prefer-const': 'error',
  eqeqeq: 'error',
};

export default [
  { ignores: ['node_modules/', '.cache/', 'data/', 'icons/'] },
  js.configs.recommended,
  { rules: cleanCode },
  { files: ['js/**'], languageOptions: { globals: globals.browser } },
  { files: ['scripts/**', 'test/**', 'eslint.config.js'], languageOptions: { globals: globals.node } },
  { files: ['test/**'], rules: { 'max-lines-per-function': 'off', 'max-statements': 'off' } },
];
