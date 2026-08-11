'use strict';

/**
 * require-aria-label-on-interactive — Regra ESLint (dock-ds)
 *
 * Detecta elementos interativos (button, a, input[type=button/submit/reset],
 * [role=button]) em templates Vue que não possuem nenhum mecanismo de
 * nome acessível: aria-label, aria-labelledby, aria-describedby ou conteúdo
 * de texto visível estimado (slot não-vazio).
 *
 * WCAG: 4.1.2 (Name, Role, Value) — Nível A
 *       2.4.6 (Headings and Labels) — Nível AA
 *
 * Exemplos inválidos:
 *   <button><icon-edit /></button>
 *   <a href="/settings"><DsIcon name="gear" /></a>
 *
 * Exemplos válidos:
 *   <button aria-label="Editar item">…</button>
 *   <button>Editar</button>
 *   <a href="/settings" aria-label="Configurações"><DsIcon name="gear" /></a>
 */

/** Elementos que necessariamente precisam de nome acessível */
const INTERACTIVE_ELEMENTS = new Set([
  'button', 'a', 'summary',
]);

/** Roles que implicam interatividade */
const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'menuitem', 'tab', 'option', 'treeitem', 'gridcell',
]);

/** Atributos que fornecem nome acessível por si só */
const LABEL_ATTRS = new Set([
  'aria-label', 'aria-labelledby', 'aria-describedby', 'title',
]);

/**
 * Verifica se o array de atributos do nó VElement contém ao menos um atributo
 * de nome acessível com valor não-vazio.
 */
function hasLabelAttr(startTag) {
  return startTag.attributes.some((attr) => {
    if (!attr.key) return false;
    const name = attr.key.name || (attr.key.argument && attr.key.argument.name);
    if (!LABEL_ATTRS.has(name)) return false;
    // aria-label="" vazio não conta
    const val = attr.value?.value;
    return val == null || val.trim().length > 0;
  });
}

/**
 * Verifica se o nó tem conteúdo textual visível direto (texto literal não-vazio)
 * ou se parece ter slot com texto (conservador: qualquer filho texto).
 */
function hasTextContent(node) {
  if (!node.children) return false;
  return node.children.some(
    (child) => child.type === 'VText' && child.value.trim().length > 0,
  );
}

/**
 * Retorna o role declarado via :role ou role= se for interativo.
 */
function getDeclaredRole(startTag) {
  const roleAttr = startTag.attributes.find((attr) => {
    const name = attr.key?.name || attr.key?.argument?.name;
    return name === 'role';
  });
  if (!roleAttr || !roleAttr.value) return null;
  return roleAttr.value.value;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Exige nome acessível (aria-label, aria-labelledby ou texto visível) em elementos interativos',
      category: 'Accessibility',
      recommended: true,
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value',
    },
    messages: {
      missingLabel:
        'Elemento interativo <{{ element }}> não possui nome acessível. ' +
        'Adicione aria-label, aria-labelledby ou conteúdo de texto visível. (WCAG 4.1.2)',
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Permite declarar exceções por seletor (ex: elementos que sempre têm slot com texto)
          ignore: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const ignore = new Set(options.ignore || []);

    const templateVisitor = {
      'VElement'(node) {
        const tagName = node.rawName || node.name;

        // Verifica se é interativo por tag ou por role declarado
        const isInteractiveTag = INTERACTIVE_ELEMENTS.has(tagName);
        const declaredRole = getDeclaredRole(node.startTag);
        const isInteractiveRole = declaredRole && INTERACTIVE_ROLES.has(declaredRole);

        if (!isInteractiveTag && !isInteractiveRole) return;
        if (ignore.has(tagName)) return;

        // <a> sem href não é interativo
        if (tagName === 'a') {
          const hasHref = node.startTag.attributes.some((a) => {
            const n = a.key?.name || a.key?.argument?.name;
            return n === 'href' || n === 'to'; // Vue Router
          });
          if (!hasHref) return;
        }

        // Verifica nome acessível
        if (hasLabelAttr(node.startTag)) return;
        if (hasTextContent(node)) return;

        // Elemento interativo sem nome acessível detectável
        context.report({
          node: node.startTag,
          messageId: 'missingLabel',
          data: { element: tagName },
        });
      },
    };

    if (context.parserServices && context.parserServices.defineTemplateBodyVisitor) {
      return context.parserServices.defineTemplateBodyVisitor(templateVisitor, {});
    }
    return {};
  },
};
