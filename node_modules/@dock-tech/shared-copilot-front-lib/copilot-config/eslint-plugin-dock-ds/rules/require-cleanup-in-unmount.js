/**
 * dock-ds/require-cleanup-in-unmount
 *
 * Detecta uso de setInterval, setTimeout (longo) ou addEventListener
 * em componentes Vue sem o respectivo cleanup em onUnmounted/onBeforeUnmount.
 *
 * Causa memory leaks, listeners zombies e bugs em SPAs onde componentes
 * são montados/desmontados frequentemente.
 *
 * ❌ ERRADO:
 *   <script setup>
 *   onMounted(() => {
 *     setInterval(() => poll(), 5000)      // nunca cleared
 *     window.addEventListener('resize', h) // nunca removed
 *   })
 *   </script>
 *
 * ✅ CORRETO:
 *   <script setup>
 *   const intervalId = ref(null)
 *   const handleResize = () => { ... }
 *
 *   onMounted(() => {
 *     intervalId.value = setInterval(() => poll(), 5000)
 *     window.addEventListener('resize', handleResize)
 *   })
 *
 *   onUnmounted(() => {
 *     if (intervalId.value) clearInterval(intervalId.value)
 *     window.removeEventListener('resize', handleResize)
 *   })
 *   </script>
 *
 *   // OU melhor ainda: useEventListener / useIntervalFn do VueUse / DS
 */

'use strict';

// Object.create(null) evita prototype pollution:
// um objeto literal herda Object.prototype, então REGISTER_FNS['toString']
// retornaria a função nativa toString — causando falso positivo em qualquer
// código que chame .toString() ou .toLocaleString().
const REGISTER_FNS = Object.assign(Object.create(null), {
  setInterval: 'clearInterval',
  addEventListener: 'removeEventListener',
});

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require cleanup of intervals/listeners in onUnmounted',
      category: 'Memory Safety',
      recommended: true,
    },
    messages: {
      missingCleanup:
        '{{register}} chamado sem {{cleanup}} correspondente em onUnmounted. ' +
        'Memory leak. Use a função de cleanup ou um composable (useEventListener / useIntervalFn).',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Aplica em .vue e .ts/.js que provavelmente são composables
    const isVue = filename.endsWith('.vue');
    const isComposable = /\/composables\//.test(filename) || /\/use[A-Z]/.test(filename);
    if (!isVue && !isComposable) return {};

    // Rastreia registers e cleanups vistos no arquivo
    const registers = []; // { node, fn, cleanup }
    const cleanups = new Set();

    return {
      // detecta registers: setInterval(...), window.addEventListener(...)
      CallExpression(node) {
        const callee = node.callee;
        let fnName = null;

        if (callee.type === 'Identifier') {
          fnName = callee.name;
        } else if (callee.type === 'MemberExpression' && callee.property?.name) {
          fnName = callee.property.name;
        }

        if (fnName && REGISTER_FNS[fnName]) {
          registers.push({
            node,
            fn: fnName,
            cleanup: REGISTER_FNS[fnName],
          });
        }

        // detecta cleanups
        if (
          fnName === 'clearInterval' ||
          fnName === 'clearTimeout' ||
          fnName === 'removeEventListener'
        ) {
          cleanups.add(fnName);
        }
      },

      'Program:exit'() {
        for (const reg of registers) {
          if (!cleanups.has(reg.cleanup)) {
            context.report({
              node: reg.node,
              messageId: 'missingCleanup',
              data: {
                register: reg.fn,
                cleanup: reg.cleanup,
              },
            });
          }
        }
      },
    };
  },
};
