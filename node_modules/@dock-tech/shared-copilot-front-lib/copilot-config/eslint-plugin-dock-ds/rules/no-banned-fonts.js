/**
 * dock-ds/no-banned-fonts
 *
 * Detecta uso de fontes proibidas (Poppins, Inter, Arial, etc.) em:
 * - Atributos class (font-[Poppins], font-poppins)
 * - Blocos <style> (font-family: Poppins)
 * - Strings literais que referenciam fonts
 *
 * Lê a lista de fontes proibidas de dock-ds.config.json.
 */

'use strict';

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

let bannedFonts = null;

function loadBannedFonts(cwd) {
  if (bannedFonts !== null) return bannedFonts;

  const configPath = join(cwd || process.cwd(), 'dock-ds.config.json');
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      bannedFonts = (config.tokens?.fonts?.banned || []).map((f) => f.toLowerCase());
    } catch {
      bannedFonts = [];
    }
  } else {
    bannedFonts = [];
  }
  return bannedFonts;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow banned font families not in the Design System',
      category: 'Design System',
    },
    messages: {
      banned:
        'Fonte "{{font}}" é proibida pelo Design System. Use apenas: {{allowed}}.',
    },
    schema: [],
  },

  create(context) {
    const banned = loadBannedFonts(context.cwd);

    if (banned.length === 0) return {};

    // Carrega fontes permitidas para a mensagem de erro
    let allowedFonts = '';
    const configPath = join(context.cwd || process.cwd(), 'dock-ds.config.json');
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        allowedFonts = (config.tokens?.fonts?.allowed || []).join(', ');
      } catch { /* noop */ }
    }

    function checkText(node, text) {
      const lower = text.toLowerCase();
      for (const font of banned) {
        if (lower.includes(font)) {
          context.report({
            node,
            messageId: 'banned',
            data: { font, allowed: allowedFonts || 'ver dock-ds.config.json' },
          });
          break; // Um report por node é suficiente
        }
      }
    }

    const templateVisitor = {
      'VAttribute[key.name="class"]'(node) {
        if (node.value && node.value.value) checkText(node, node.value.value);
      },
      'VAttribute[key.name="style"]'(node) {
        if (node.value && node.value.value) checkText(node, node.value.value);
      },
      'VExpressionContainer Literal'(node) {
        if (typeof node.value === 'string' && node.value.length > 3) {
          checkText(node, node.value);
        }
      },
    };

    const scriptVisitor = {
      Literal(node) {
        if (typeof node.value === 'string' && node.value.length > 3) {
          checkText(node, node.value);
        }
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          if (quasi.value.raw.length > 3) {
            checkText(node, quasi.value.raw);
          }
        }
      },
    };

    if (context.parserServices && context.parserServices.defineTemplateBodyVisitor) {
      return context.parserServices.defineTemplateBodyVisitor(templateVisitor, scriptVisitor);
    }
    return scriptVisitor;
  },
};
