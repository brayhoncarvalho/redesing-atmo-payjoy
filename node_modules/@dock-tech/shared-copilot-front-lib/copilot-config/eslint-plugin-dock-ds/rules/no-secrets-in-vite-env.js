/**
 * dock-ds/no-secrets-in-vite-env
 *
 * Bloqueia uso de import.meta.env.VITE_* contendo padrões de secret
 * (KEY, TOKEN, SECRET, PASSWORD, PRIVATE, CREDENTIAL).
 *
 * Vars VITE_* são EXPOSTAS no bundle do cliente. Secrets em VITE_*
 * vazam para qualquer usuário do site. Use server-side env vars ou
 * proxy backend para credenciais.
 *
 * ❌ ERRADO:
 *   const key = import.meta.env.VITE_API_KEY        // expõe no bundle
 *   const token = import.meta.env.VITE_AUTH_TOKEN   // expõe no bundle
 *
 * ✅ CORRETO:
 *   // Use prefixo NEXT_*, NUXT_*, ou env sem prefixo no servidor
 *   const key = process.env.API_KEY                 // server-side
 *
 *   // Ou proxy via backend:
 *   const result = await fetch('/api/proxy/external-service')
 */

'use strict';

const SECRET_PATTERNS = /^VITE_.*(KEY|TOKEN|SECRET|PASSWORD|PRIVATE|CREDENTIAL|AUTH|SIGN|CERT)$/i;

// Allowlist: vars que CONTÊM essas palavras mas são legítimas
// (ex: VITE_PUBLIC_KEY de Stripe é safe — é pública por design)
const ALLOWLIST = new Set([
  'VITE_PUBLIC_KEY',           // Stripe publishable key
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_PUBLIC_API_TOKEN',     // tokens marcados como public explicitamente
]);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow secrets in VITE_* env vars (they leak into client bundle)',
      category: 'Security',
      recommended: true,
    },
    messages: {
      secret:
        'VITE_{{name}} parece conter um secret e VAZA no bundle do cliente. ' +
        'Use server-side env (sem prefixo VITE_) ou backend proxy. ' +
        'Se for público por design, renomeie para VITE_PUBLIC_{{name}}.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowlist: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const opts = context.options[0] || {};
    const allowlist = new Set([...ALLOWLIST, ...(opts.allowlist || [])]);

    function check(node, propertyName) {
      const fullName = `VITE_${propertyName.replace(/^VITE_/, '')}`;
      if (allowlist.has(fullName)) return;
      if (SECRET_PATTERNS.test(fullName)) {
        context.report({
          node,
          messageId: 'secret',
          data: { name: propertyName.replace(/^VITE_/, '') },
        });
      }
    }

    return {
      // import.meta.env.VITE_API_KEY
      MemberExpression(node) {
        // detecta padrão: import.meta.env.VITE_*
        if (
          node.object?.type === 'MemberExpression' &&
          node.object.object?.type === 'MetaProperty' &&
          node.object.object.meta?.name === 'import' &&
          node.object.object.property?.name === 'meta' &&
          node.object.property?.name === 'env' &&
          node.property?.type === 'Identifier' &&
          node.property.name.startsWith('VITE_')
        ) {
          check(node, node.property.name);
        }
      },
      // import.meta.env['VITE_API_KEY']
      'MemberExpression[computed=true]'(node) {
        if (
          node.object?.type === 'MemberExpression' &&
          node.object.object?.type === 'MetaProperty' &&
          node.object.property?.name === 'env' &&
          node.property?.type === 'Literal' &&
          typeof node.property.value === 'string' &&
          node.property.value.startsWith('VITE_')
        ) {
          check(node, node.property.value);
        }
      },
    };
  },
};
