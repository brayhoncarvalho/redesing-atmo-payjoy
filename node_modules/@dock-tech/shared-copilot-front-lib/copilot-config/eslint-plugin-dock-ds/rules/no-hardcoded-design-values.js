/**
 * dock-ds/no-hardcoded-design-values
 *
 * Estende o enforcement de tokens ALÉM de cor: pega valores hardcoded de
 * SPACING, RADIUS e SHADOW — que antes só eram cobertos por instruction
 * (soft), nunca pelo ESLint. Fecha o gap C.3 do PRD: a documentação
 * afirmava que spacing/radius eram bloqueados, mas nenhuma regra fazia isso.
 *
 * Conservadora por design (baixo falso-positivo): só pega os casos claros.
 *
 * Detecta:
 *  - Tailwind arbitrary values de espaçamento: p-[18px], mx-[10px], gap-[6px]
 *  - Tailwind arbitrary radius: rounded-[5px], rounded-tl-[3px]
 *  - Tailwind arbitrary shadow: shadow-[0_2px_8px_...]
 *  - Inline style px em padding/margin/gap/border-radius
 *
 * Sempre permite:
 *  - var(--*) tokens
 *  - 0, auto, %, fr, calc()
 *  - width/height/top/left/inset (layout — frequentemente legítimo, fora de escopo)
 */

'use strict';

// Prefixos Tailwind de espaçamento que devem vir de token.
const SPACING_PREFIXES = [
  'p', 'px', 'py', 'pt', 'pb', 'pl', 'pr', 'ps', 'pe',
  'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr', 'ms', 'me',
  'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
];

// p-[18px] | gap-[6px] | space-x-[10px]
const SPACING_ARBITRARY = new RegExp(
  `\\b(${SPACING_PREFIXES.join('|').replace(/-/g, '\\-')})-\\[([^\\]]+)\\]`,
  'g'
);
// rounded-[5px] | rounded-tl-[3px]
const RADIUS_ARBITRARY = /\brounded(?:-[a-z]{1,2})?-\[([^\]]+)\]/g;
// shadow-[...]
const SHADOW_ARBITRARY = /\bshadow-\[([^\]]+)\]/g;

// Valores aceitáveis dentro de um arbitrary (não são "design value" hardcoded)
function isAllowedArbitrary(value) {
  const v = value.trim().toLowerCase();
  return (
    v === '0' ||
    v === 'auto' ||
    v.startsWith('var(') ||
    v.startsWith('calc(') ||
    v.endsWith('%') ||
    v.endsWith('fr') ||
    v.endsWith('vh') ||
    v.endsWith('vw')
  );
}

// Inline style: padding: 18px;  border-radius: 5px;  gap: 6px;
const INLINE_STYLE = /\b(padding|margin|gap|border-radius|box-shadow)(?:-[a-z]+)?\s*:\s*([^;}"']+)/gi;

function checkText(context, node, text) {
  let m;

  SPACING_ARBITRARY.lastIndex = 0;
  while ((m = SPACING_ARBITRARY.exec(text)) !== null) {
    if (!isAllowedArbitrary(m[2])) {
      context.report({ node, messageId: 'spacing', data: { value: m[0] } });
    }
  }

  RADIUS_ARBITRARY.lastIndex = 0;
  while ((m = RADIUS_ARBITRARY.exec(text)) !== null) {
    if (!isAllowedArbitrary(m[1])) {
      context.report({ node, messageId: 'radius', data: { value: m[0] } });
    }
  }

  SHADOW_ARBITRARY.lastIndex = 0;
  while ((m = SHADOW_ARBITRARY.exec(text)) !== null) {
    if (!isAllowedArbitrary(m[1])) {
      context.report({ node, messageId: 'shadow', data: { value: m[0] } });
    }
  }

  INLINE_STYLE.lastIndex = 0;
  while ((m = INLINE_STYLE.exec(text)) !== null) {
    const prop = m[1].toLowerCase();
    const value = m[2].trim();
    if (isAllowedArbitrary(value)) continue;
    // px / em / rem cru = hardcoded
    if (/\b\d*\.?\d+(px|em|rem)\b/.test(value)) {
      const messageId = prop === 'box-shadow' ? 'shadow' : prop === 'border-radius' ? 'radius' : 'spacing';
      context.report({ node, messageId, data: { value: `${prop}: ${value}` } });
    }
  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded spacing/radius/shadow — use tokens (var(--space-*), var(--radius-*), var(--shadow-*)).',
      category: 'Design System',
      recommended: true,
    },
    messages: {
      spacing:
        'Espaçamento hardcoded "{{value}}". Use a escala de 4px via token: var(--space-*) ou utilitário Tailwind mapeado (p-field, gap-group).',
      radius:
        'Raio hardcoded "{{value}}". Use token: var(--radius-sm|md|lg) ou rounded-token-md.',
      shadow:
        'Sombra hardcoded "{{value}}". Use token: var(--shadow-1|2) — não proliferar níveis de elevação.',
    },
    schema: [],
  },

  create(context) {
    const templateVisitor = {
      'VAttribute[key.name="class"]'(node) {
        if (node.value && node.value.value) checkText(context, node, node.value.value);
      },
      'VAttribute[key.name="style"]'(node) {
        if (node.value && node.value.value) checkText(context, node, node.value.value);
      },
      'VExpressionContainer Literal'(node) {
        if (typeof node.value === 'string' && /\[|:/.test(node.value)) {
          checkText(context, node, node.value);
        }
      },
    };

    const scriptVisitor = {
      Literal(node) {
        if (typeof node.value === 'string' && /\[|:/.test(node.value)) {
          checkText(context, node, node.value);
        }
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          checkText(context, node, quasi.value.raw);
        }
      },
    };

    // .vue → varre <template> via parserServices; .ts/.js → só script
    if (context.parserServices && context.parserServices.defineTemplateBodyVisitor) {
      return context.parserServices.defineTemplateBodyVisitor(templateVisitor, scriptVisitor);
    }
    return scriptVisitor;
  },
};
