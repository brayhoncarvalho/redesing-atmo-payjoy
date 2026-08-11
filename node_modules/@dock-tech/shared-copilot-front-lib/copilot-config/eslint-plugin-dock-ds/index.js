/**
 * eslint-plugin-dock-ds
 *
 * Plugin ESLint para validação do Design System em tempo real no editor.
 * Detecta cores hardcoded, fontes proibidas, spacing/radius/shadow hardcoded,
 * cores de feedback usadas como decoração (anti-arco-íris), secrets em env,
 * fetch em components, validações manuais duplicadas, leaks de listeners e
 * sugere uso de componentes Ds* em vez de HTML nativo.
 *
 * v2.1.0: regras de template agora usam parserServices.defineTemplateBodyVisitor
 *         — antes, as regras que varriam <template> (cor, fonte, prefer-ds,
 *         aria-label) eram INERTES em arquivos .vue. Corrigido + 2 regras novas
 *         (no-hardcoded-design-values, no-decorative-feedback-colors).
 *
 * Uso no .eslintrc.cjs:
 *   const dockDs = require('@dock-tech/shared-copilot-front-lib/eslint-plugin')
 *   module.exports = {
 *     plugins: ['dock-ds'],
 *     extends: ['plugin:dock-ds/recommended'],
 *   }
 */

'use strict';

const noUnauthorizedColors = require('./rules/no-unauthorized-colors.js');
const noBannedFonts = require('./rules/no-banned-fonts.js');
const preferDsComponent = require('./rules/prefer-ds-component.js');
const noSecretsInViteEnv = require('./rules/no-secrets-in-vite-env.js');
const noFetchInComponents = require('./rules/no-fetch-in-components.js');
const preferDsFormValidation = require('./rules/prefer-ds-form-validation.js');
const requireCleanupInUnmount = require('./rules/require-cleanup-in-unmount.js');
const requireAriaLabelOnInteractive = require('./rules/require-aria-label-on-interactive.js');
const noHardcodedDesignValues = require('./rules/no-hardcoded-design-values.js');
const noDecorativeFeedbackColors = require('./rules/no-decorative-feedback-colors.js');

const plugin = {
  meta: {
    name: '@dock-tech/shared-copilot-front-lib-eslint-plugin',
    version: '2.2.0',
  },
  rules: {
    'no-unauthorized-colors': noUnauthorizedColors,
    'no-banned-fonts': noBannedFonts,
    'prefer-ds-component': preferDsComponent,
    'no-secrets-in-vite-env': noSecretsInViteEnv,
    'no-fetch-in-components': noFetchInComponents,
    'prefer-ds-form-validation': preferDsFormValidation,
    'require-cleanup-in-unmount': requireCleanupInUnmount,
    'require-aria-label-on-interactive': requireAriaLabelOnInteractive,
    'no-hardcoded-design-values': noHardcodedDesignValues,
    'no-decorative-feedback-colors': noDecorativeFeedbackColors,
  },
  configs: {},
};

// Config recomendada — error por padrão (governance enforcement)
plugin.configs.recommended = {
  plugins: ['dock-ds'],
  rules: {
    'dock-ds/no-unauthorized-colors': 'error',
    'dock-ds/no-banned-fonts': 'error',
    'dock-ds/prefer-ds-component': 'error',
    'dock-ds/no-secrets-in-vite-env': 'error',
    'dock-ds/no-fetch-in-components': 'error',
    'dock-ds/prefer-ds-form-validation': 'warn',
    'dock-ds/require-cleanup-in-unmount': 'error',
    'dock-ds/require-aria-label-on-interactive': 'warn', // warn até squads adaptarem templates existentes
    'dock-ds/no-hardcoded-design-values': 'error',
    'dock-ds/no-decorative-feedback-colors': 'warn', // heurística — warn para não emperrar estado legítimo
  },
};

// Config migration — para projetos legados adotando incrementalmente.
// Mantém HARD os tokens (cor/fonte/spacing) — baixo risco e alto valor — e
// rebaixa para warn o que gera ruído em código existente (prefer-ds, aria,
// harmonia). Permite ligar o enforcement sem o time desativar o plugin inteiro.
plugin.configs.migration = {
  plugins: ['dock-ds'],
  rules: {
    'dock-ds/no-unauthorized-colors': 'error',
    'dock-ds/no-banned-fonts': 'error',
    'dock-ds/no-hardcoded-design-values': 'error',
    'dock-ds/no-secrets-in-vite-env': 'error',
    'dock-ds/no-fetch-in-components': 'error',
    'dock-ds/prefer-ds-component': 'warn',
    'dock-ds/prefer-ds-form-validation': 'warn',
    'dock-ds/require-cleanup-in-unmount': 'warn',
    'dock-ds/require-aria-label-on-interactive': 'warn',
    'dock-ds/no-decorative-feedback-colors': 'warn',
  },
};

// Config strict — todas error, sem exceção (CI gate severo)
plugin.configs.strict = {
  plugins: ['dock-ds'],
  rules: {
    'dock-ds/no-unauthorized-colors': 'error',
    'dock-ds/no-banned-fonts': 'error',
    'dock-ds/prefer-ds-component': 'error',
    'dock-ds/no-secrets-in-vite-env': 'error',
    'dock-ds/no-fetch-in-components': 'error',
    'dock-ds/prefer-ds-form-validation': 'error',
    'dock-ds/require-cleanup-in-unmount': 'error',
    'dock-ds/require-aria-label-on-interactive': 'error',
    'dock-ds/no-hardcoded-design-values': 'error',
    'dock-ds/no-decorative-feedback-colors': 'error',
  },
};

module.exports = plugin;
