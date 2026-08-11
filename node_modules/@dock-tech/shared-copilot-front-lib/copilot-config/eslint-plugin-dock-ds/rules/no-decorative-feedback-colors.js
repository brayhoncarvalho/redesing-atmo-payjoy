/**
 * dock-ds/no-decorative-feedback-colors
 *
 * Protege a HARMONIA DA PALETA. As cores de feedback/estado
 * (danger/success/warning/info) existem para comunicar ESTADO — não para
 * decorar. Usá-las decorativamente produz o "arco-íris" que quebra a
 * hierarquia visual e confunde o usuário.
 *
 * Detecta dois problemas:
 *
 *  1. RAINBOW (acúmulo): mais de 1 hue de feedback distinto no mesmo arquivo.
 *     Cores de estado pontuais (um erro, um sucesso) são esperadas; várias
 *     cores de estado juntas quase sempre é decoração disfarçada.
 *
 *  2. DECORATIVE BG: cor de feedback como background/borda de um elemento que
 *     não é container de estado (sem role="alert"/"status", aria-live, ou
 *     classe de status reconhecida).
 *
 * Heurística, por design: severidade `warn` por padrão.
 *
 * IMPORTANTE: usa parserServices.defineTemplateBodyVisitor para varrer o
 * <template> de arquivos .vue. Sem isso, o vue-eslint-parser NÃO visita os
 * nós do template e a regra fica inerte (era o bug das regras antigas).
 */

'use strict';

const FEEDBACK_HEX = {
  dc3545: 'danger',
  '10b981': 'success',
  f59e0b: 'warning',
  '3b82f6': 'info',
};

function normalizeHue(raw) {
  if (raw === 'error' || raw === 'negative') return 'danger';
  if (raw === 'positive') return 'success';
  return raw;
}

function feedbackHuesFromText(text) {
  const found = new Set();
  const lower = text.toLowerCase();

  for (const [hex, hue] of Object.entries(FEEDBACK_HEX)) {
    if (lower.includes('#' + hex)) found.add(hue);
  }
  const tokenRegex = /--color-(?:feedback|status)-(danger|success|warning|info|error|positive|negative)/g;
  let m;
  while ((m = tokenRegex.exec(lower)) !== null) found.add(normalizeHue(m[1]));

  const twRegex = /\b(?:bg|text|border|ring|fill|stroke|from|to|via)-(danger|success|warning|info|error|positive|negative)\b/g;
  while ((m = twRegex.exec(lower)) !== null) found.add(normalizeHue(m[1]));

  return found;
}

function hasFeedbackBackground(text) {
  const lower = text.toLowerCase();
  if (/\bbg-(danger|success|warning|info|error|positive|negative)\b/.test(lower)) return true;
  if (/background[^;]*--color-(?:feedback|status)-/.test(lower)) return true;
  return false;
}

function isStateContext(text) {
  const lower = text.toLowerCase();
  return (
    /role\s*=\s*["'](alert|status)["']/.test(lower) ||
    /aria-live/.test(lower) ||
    /\b(alert|toast|badge|banner|status|feedback)\b/.test(lower)
  );
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Cores de feedback (danger/success/warning/info) só para estado — não decorativas. Protege a harmonia da paleta.',
      category: 'Design System',
      recommended: true,
    },
    messages: {
      rainbow:
        'Mistura de cores de feedback ({{hues}}) no mesmo arquivo. Cores de estado não são decorativas — use neutros + 1 acento e reserve danger/success/warning/info para estado real. Ver color-harmony.instructions.md.',
      decorativeBg:
        'Cor de feedback usada como background decorativo, sem contexto de estado (role="alert"/"status"/aria-live). Use uma superfície neutra ou um componente de estado (DsAlert/DsBadge).',
    },
    schema: [],
  },

  create(context) {
    const hues = new Set();
    let rainbowReported = false;

    function scan(node, text) {
      if (!text) return;

      feedbackHuesFromText(text).forEach((h) => hues.add(h));
      if (hues.size >= 2 && !rainbowReported) {
        rainbowReported = true;
        context.report({
          node,
          messageId: 'rainbow',
          data: { hues: Array.from(hues).join(', ') },
        });
      }

      if (hasFeedbackBackground(text) && !isStateContext(text)) {
        context.report({ node, messageId: 'decorativeBg' });
      }
    }

    const templateVisitor = {
      'VAttribute[key.name="class"]'(node) {
        if (node.value && node.value.value) scan(node, node.value.value);
      },
      'VAttribute[key.name="style"]'(node) {
        if (node.value && node.value.value) scan(node, node.value.value);
      },
      // :class="'...'" / :style — literais dentro de expressões
      'VExpressionContainer Literal'(node) {
        if (typeof node.value === 'string') scan(node, node.value);
      },
    };

    const scriptVisitor = {
      Literal(node) {
        if (
          typeof node.value === 'string' &&
          /--color-(feedback|status)|bg-(danger|success|warning|info)|#(dc3545|10b981|f59e0b|3b82f6)/i.test(node.value)
        ) {
          scan(node, node.value);
        }
      },
    };

    if (context.parserServices && context.parserServices.defineTemplateBodyVisitor) {
      return context.parserServices.defineTemplateBodyVisitor(templateVisitor, scriptVisitor);
    }
    return scriptVisitor;
  },
};
