// ============================================================
// ESLint Flat Config — Governance Enforcement (dock-ds)
// Defense-in-depth Layer 2
// ============================================================
//
// Carrega o plugin @dock-tech/shared-copilot-front-lib com 7 regras de governance
// que bloqueiam violações de regras inquebráveis do Manual de Product Design.
//
// Como rodar: ESLINT_USE_FLAT_CONFIG=true eslint .
// (ou via npm run lint:dock-ds)
// ============================================================
'use strict';

const dockDs = require('@dock-tech/shared-copilot-front-lib/eslint-plugin');
const vueParser = require('vue-eslint-parser');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  // ── Vue files ────────────────────────────────────────────
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: { 'dock-ds': dockDs },
    rules: {
      'dock-ds/no-unauthorized-colors': 'error',
      'dock-ds/no-banned-fonts': 'error',
      'dock-ds/prefer-ds-component': 'error',
      'dock-ds/no-secrets-in-vite-env': 'error',
      'dock-ds/no-fetch-in-components': 'error',
      'dock-ds/prefer-ds-form-validation': 'warn',
      'dock-ds/require-cleanup-in-unmount': 'error',
    },
  },

  // ── TS/JS files ──────────────────────────────────────────
  {
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: { 'dock-ds': dockDs },
    rules: {
      'dock-ds/no-unauthorized-colors': 'error',
      'dock-ds/no-secrets-in-vite-env': 'error',
      'dock-ds/prefer-ds-form-validation': 'warn',
      'dock-ds/require-cleanup-in-unmount': 'error',
    },
  },

  // ── Stories e testes podem ter exceções ─────────────────
  {
    files: ['**/*.stories.{ts,vue}', 'stories/**/*', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'dock-ds/prefer-ds-component': 'off',
      'dock-ds/no-fetch-in-components': 'off',
      'dock-ds/require-cleanup-in-unmount': 'off',
    },
  },

  // ── Scripts node não são components ─────────────────────
  {
    files: ['scripts/**/*'],
    rules: {
      'dock-ds/no-fetch-in-components': 'off',
      'dock-ds/require-cleanup-in-unmount': 'off',
    },
  },

  // ── Ignores ──────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      'storybook-static/**',
      '**/*.d.ts',
    ],
  },
];
