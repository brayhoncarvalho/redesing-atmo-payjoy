/**
 * dock-ds/no-fetch-in-components
 *
 * Bloqueia uso de fetch() ou axios direto em componentes Vue.
 * Toda chamada HTTP DEVE passar pela camada de services/api.ts.
 *
 * Motivação:
 * - Centraliza interceptors (auth token, error handling, retry)
 * - Permite mock em testes
 * - Garante timeout, telemetria e tratamento consistente
 * - Evita duplicação de lógica de erro em cada componente
 *
 * ❌ ERRADO:
 *   <script setup>
 *   const data = await fetch('/api/users')          // sem timeout, sem retry
 *   const result = await axios.get('/api/orders')   // sem interceptor
 *   </script>
 *
 * ✅ CORRETO:
 *   <script setup>
 *   import { userService } from '@/services/user-service'
 *   const data = await userService.list()
 *   </script>
 */

'use strict';

const HTTP_CLIENTS = new Set(['fetch', 'axios']);
const ALLOWED_PATHS_REGEX = /\/services\/|\/api\/|\/composables\/|\.test\.|\.spec\./;

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct fetch/axios in Vue components (use service layer)',
      category: 'Architecture',
      recommended: true,
    },
    messages: {
      fetch:
        '{{client}}() direto em componente .vue. Mova para services/api.ts ' +
        'para garantir interceptors, timeout, retry e testabilidade.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedPaths: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Só aplica em .vue files
    if (!filename.endsWith('.vue')) return {};

    // Exceções: paths permitidos (services, composables compartilhados, testes)
    const opts = context.options[0] || {};
    const allowedPatterns = [
      ALLOWED_PATHS_REGEX,
      ...(opts.allowedPaths || []).map((p) => new RegExp(p)),
    ];
    if (allowedPatterns.some((re) => re.test(filename))) return {};

    function reportIfHttpClient(node, name) {
      if (HTTP_CLIENTS.has(name)) {
        context.report({
          node,
          messageId: 'fetch',
          data: { client: name },
        });
      }
    }

    return {
      // fetch('/api/...')
      'CallExpression[callee.type="Identifier"]'(node) {
        reportIfHttpClient(node, node.callee.name);
      },
      // axios.get(), axios.post()
      'CallExpression[callee.type="MemberExpression"][callee.object.name="axios"]'(node) {
        context.report({
          node,
          messageId: 'fetch',
          data: { client: 'axios' },
        });
      },
      // window.fetch(...)
      'CallExpression[callee.type="MemberExpression"][callee.object.name="window"][callee.property.name="fetch"]'(node) {
        context.report({
          node,
          messageId: 'fetch',
          data: { client: 'fetch' },
        });
      },
    };
  },
};
