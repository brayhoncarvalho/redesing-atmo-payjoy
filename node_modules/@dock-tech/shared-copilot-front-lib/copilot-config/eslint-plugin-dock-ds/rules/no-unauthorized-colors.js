/**
 * dock-ds/no-unauthorized-colors
 *
 * Detecta cores hardcoded (hex, rgb, rgba, hsl, hsla, named colors) em
 * templates Vue, blocos <style> e código JS/TS. Cores DEVEM vir de tokens
 * CSS (var(--ds-*)) ou estar no allowlist de dock-ds.config.json.
 *
 * Funciona em:
 * - Atributos de template (class, style)
 * - Blocos <style> e <style scoped>
 * - Tailwind arbitrary values (bg-[#ff0000])
 * - Strings em JS/TS (style objects, template literals)
 *
 * Detecta:
 * - Hex: #fff, #ffffff, #ffffffff
 * - RGB/RGBA: rgb(255, 0, 0), rgba(0, 0, 0, 0.5)
 * - HSL/HSLA: hsl(120, 100%, 50%), hsla(...)
 * - Named (CSS named colors comuns): red, blue, etc.
 *
 * Sempre permite:
 * - var(--*) — tokens CSS
 * - transparent, currentColor, inherit, initial, unset
 * - Hex 3-char isolados (provável id/ref, não cor)
 */

'use strict';

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

let allowedColors = null;

function loadAllowedColors(cwd) {
  if (allowedColors !== null) return allowedColors;

  const configPath = join(cwd || process.cwd(), 'dock-ds.config.json');
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      allowedColors = new Set(
        (config.tokens?.colors || []).map((c) => c.replace('#', '').toLowerCase())
      );
    } catch {
      allowedColors = new Set();
    }
  } else {
    allowedColors = new Set();
  }
  return allowedColors;
}

// Regex patterns para detectar cores hardcoded
const HEX_REGEX = /#([0-9a-fA-F]{3,8})\b/g;
const RGB_REGEX = /\brgba?\s*\([^)]+\)/g;
const HSL_REGEX = /\bhsla?\s*\([^)]+\)/g;

// CSS named colors mais comuns (não exaustivo — foca nos suspeitos)
const NAMED_COLORS = new Set([
  'red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'grey',
  'orange', 'purple', 'pink', 'brown', 'cyan', 'magenta', 'lime', 'navy',
  'maroon', 'olive', 'teal', 'silver', 'aqua', 'fuchsia',
]);
// CSS color names que SEMPRE são permitidos (palavras-chave técnicas)
const SAFE_KEYWORDS = new Set([
  'transparent', 'currentcolor', 'inherit', 'initial', 'unset', 'revert',
  'auto', 'none',
]);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded colors (hex, rgb, hsl, named) — use var(--ds-*) tokens',
      category: 'Design System',
      recommended: true,
    },
    messages: {
      unauthorizedHex:
        'Cor #{{color}} hardcoded. Use token CSS: var(--color-*) ou adicione ao allowlist em dock-ds.config.json.',
      unauthorizedRgb:
        '{{value}} hardcoded. Use token CSS: var(--color-*) em vez de rgb/rgba/hsl direto.',
      unauthorizedNamed:
        'Named color "{{color}}" hardcoded. Use token CSS: var(--color-*) — named colors não passam por design tokens.',
    },
    schema: [],
  },

  create(context) {
    const allowed = loadAllowedColors(context.cwd);

    function checkText(node, text) {
      // 1. Hex colors
      HEX_REGEX.lastIndex = 0;
      let match;
      while ((match = HEX_REGEX.exec(text)) !== null) {
        const color = match[1].toLowerCase();
        // Ignorar shorthand 3-char isolado (provável id/ref ou hash, não cor)
        if (color.length === 3) continue;
        // Se há allowlist e a cor está autorizada, ok
        if (allowed.size > 0 && allowed.has(color)) continue;
        // Se não há allowlist, qualquer hex em CSS é violação (use tokens)
        context.report({
          node,
          messageId: 'unauthorizedHex',
          data: { color },
        });
      }

      // 2. RGB/RGBA
      RGB_REGEX.lastIndex = 0;
      while ((match = RGB_REGEX.exec(text)) !== null) {
        context.report({
          node,
          messageId: 'unauthorizedRgb',
          data: { value: match[0] },
        });
      }

      // 3. HSL/HSLA
      HSL_REGEX.lastIndex = 0;
      while ((match = HSL_REGEX.exec(text)) !== null) {
        context.report({
          node,
          messageId: 'unauthorizedRgb',
          data: { value: match[0] },
        });
      }
    }

    // Checa se uma string é uma named color isolada (color: red)
    function checkNamedColor(node, text) {
      const trimmed = text.trim().toLowerCase();
      if (SAFE_KEYWORDS.has(trimmed)) return;
      if (NAMED_COLORS.has(trimmed)) {
        context.report({
          node,
          messageId: 'unauthorizedNamed',
          data: { color: trimmed },
        });
      }
    }

    // Visitors do <template> (.vue) — só disparam via parserServices.
    const templateVisitor = {
      'VAttribute[key.name="style"]'(node) {
        if (node.value && node.value.value) checkText(node, node.value.value);
      },
      'VAttribute[key.name="class"]'(node) {
        if (node.value && node.value.value) checkText(node, node.value.value);
      },
      // :style="'...'" / :class="'...'" — literais dentro de expressões do template
      'VExpressionContainer Literal'(node) {
        if (typeof node.value === 'string' && (node.value.includes('#') || /rgb|hsl/i.test(node.value))) {
          checkText(node, node.value);
        }
      },
    };

    // Visitors do <script> / arquivos .ts/.js
    const scriptVisitor = {
      Literal(node) {
        if (typeof node.value === 'string') {
          if (node.value.includes('#') || /rgb|hsl/i.test(node.value)) {
            checkText(node, node.value);
          }
        }
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          const raw = quasi.value.raw;
          if (raw.includes('#') || /rgb|hsl/i.test(raw)) {
            checkText(node, raw);
          }
        }
      },
      // Object expressions: { color: 'red', background: '#fff' }
      'Property[key.name=/^(color|background|backgroundColor|borderColor|fill|stroke)$/]'(node) {
        if (node.value?.type === 'Literal' && typeof node.value.value === 'string') {
          checkText(node.value, node.value.value);
          checkNamedColor(node.value, node.value.value);
        }
      },
    };

    if (context.parserServices && context.parserServices.defineTemplateBodyVisitor) {
      return context.parserServices.defineTemplateBodyVisitor(templateVisitor, scriptVisitor);
    }
    return scriptVisitor;
  },
};
