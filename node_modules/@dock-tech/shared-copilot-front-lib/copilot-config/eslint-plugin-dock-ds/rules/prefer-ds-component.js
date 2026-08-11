/**
 * dock-ds/prefer-ds-component
 *
 * Detecta uso de elementos HTML nativos (<button>, <input>, <select>) em templates Vue
 * quando o Design System oferece componentes equivalentes (shared-design-system-vue-lib).
 *
 * Emite warning sugerindo uso do componente do DS.
 * Lê preferImport de dock-ds.config.json para saber quais componentes sugerir.
 */

'use strict';

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

let dsComponents = null;

// Mapeamento de elementos HTML → componente DS sugerido
const ELEMENT_TO_DS = {
  button: 'DsButton',
  input: 'DsInput',
  select: 'DsSelect',
  textarea: 'DsTextarea',
  table: 'DsTable',
  form: 'DsForm',
};

function loadDsComponents(cwd) {
  if (dsComponents !== null) return dsComponents;

  const configPath = join(cwd || process.cwd(), 'dock-ds.config.json');
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      dsComponents = new Set(
        (config.components?.preferImport || []).map((c) => c.toLowerCase())
      );
    } catch {
      dsComponents = new Set();
    }
  } else {
    dsComponents = new Set();
  }
  return dsComponents;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer Design System components over native HTML elements',
      category: 'Design System',
    },
    messages: {
      prefer:
        'Considere usar <{{dsComponent}}> do shared-design-system-vue-lib em vez de <{{element}}>. O DS já oferece este componente.',
    },
    schema: [],
  },

  create(context) {
    const components = loadDsComponents(context.cwd);
    if (components.size === 0) return {};

    const templateVisitor = {
      VElement(node) {
        const tagName = node.rawName?.toLowerCase();
        if (!tagName) return;

        const dsComponent = ELEMENT_TO_DS[tagName];
        if (!dsComponent) return;

        // Só sugerir se o componente DS está na lista de preferImport
        if (!components.has(dsComponent.toLowerCase())) return;

        // Exceções: input[type="range"] (DS pode não ter slider), input[type="hidden"], input[type="file"]
        if (tagName === 'input') {
          const typeAttr = node.startTag?.attributes?.find(
            (attr) => attr.key?.name === 'type'
          );
          const typeValue = typeAttr?.value?.value;
          if (['range', 'hidden', 'file', 'date', 'color'].includes(typeValue)) {
            return; // Estes tipos não têm equivalente no DS
          }
        }

        // Exceção: botões de +/- dentro de sliders (uso legítimo de <button>)
        if (tagName === 'button') {
          const textContent = node.children?.[0]?.value?.trim();
          if (textContent === '+' || textContent === '-' || textContent === '−') {
            return;
          }
        }

        context.report({
          node: node.startTag || node,
          messageId: 'prefer',
          data: { dsComponent, element: tagName },
        });
      },
    };

    if (context.parserServices && context.parserServices.defineTemplateBodyVisitor) {
      return context.parserServices.defineTemplateBodyVisitor(templateVisitor, {});
    }
    return {};
  },
};
