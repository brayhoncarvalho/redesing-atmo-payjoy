/**
 * dock-ds/prefer-ds-form-validation
 *
 * Sugere o uso de validators do shared-design-system-vue-lib em vez de
 * regex manuais para CPF, CNPJ, email, telefone e CEP.
 *
 * Motivação:
 * - Validators do DS são testados (cobertura >95%)
 * - Atualizam automaticamente com mudanças regulatórias
 * - Garantem consistência cross-projeto
 * - Validators reais (algoritmo de dígito verificador), não só regex
 *
 * ❌ ERRADO:
 *   const isCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)  // só formato, não valida
 *   const isEmail = /^.+@.+\..+$/.test(email)                // regex frágil
 *
 * ✅ CORRETO:
 *   import { cpf, email, cnpj } from 'shared-design-system-vue-lib'
 *   const isCPF = cpf(value)
 *   const isEmail = email(value)
 */

'use strict';

// Padrões regex que sugerem validação manual de algo que o DS faz melhor
const KNOWN_PATTERNS = [
  {
    // CPF: 11 dígitos ou xxx.xxx.xxx-xx
    pattern: /\\d\{3\}\\.\\d\{3\}\\.\\d\{3\}-\\d\{2\}|\\d\{11\}/,
    validator: 'cpf',
    name: 'CPF',
  },
  {
    // CNPJ: 14 dígitos ou xx.xxx.xxx/xxxx-xx
    pattern: /\\d\{2\}\\.\\d\{3\}\\.\\d\{3\}\\\/\\d\{4\}-\\d\{2\}|\\d\{14\}/,
    validator: 'cnpj',
    name: 'CNPJ',
  },
  {
    // Email regex simples
    pattern: /\.[+*]@\.[+*]/,
    validator: 'email',
    name: 'email',
  },
  {
    // CEP: xxxxx-xxx ou 8 dígitos
    pattern: /\\d\{5\}-\\d\{3\}|\\d\{8\}/,
    validator: 'cep',
    name: 'CEP',
  },
];

// Nomes de variáveis/funções que sinalizam intenção de validar
const SUSPICIOUS_NAMES = /^(is|validate|check|verify)?(cpf|cnpj|email|cep|phone|telefone)$/i;

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer Design System validators over manual regex for CPF/CNPJ/email',
      category: 'Design System',
      recommended: true,
    },
    messages: {
      preferValidator:
        'Use `{{validator}}` de shared-design-system-vue-lib em vez de regex manual para {{name}}. ' +
        'O validator do DS faz checagem de dígito verificador e é testado.',
      suspiciousName:
        'Função "{{name}}" parece validar {{type}}. Considere usar o validator do DS: ' +
        '`import { {{validator}} } from "shared-design-system-vue-lib"`',
    },
    schema: [],
  },

  create(context) {
    function checkRegex(node, source) {
      for (const { pattern, validator, name } of KNOWN_PATTERNS) {
        if (pattern.test(source)) {
          context.report({
            node,
            messageId: 'preferValidator',
            data: { validator, name },
          });
          return;
        }
      }
    }

    return {
      // /regex/.test(value)
      Literal(node) {
        if (node.regex) {
          checkRegex(node, node.regex.pattern);
        }
      },
      // new RegExp('pattern')
      'NewExpression[callee.name="RegExp"]'(node) {
        const arg = node.arguments[0];
        if (arg?.type === 'Literal' && typeof arg.value === 'string') {
          checkRegex(node, arg.value);
        }
      },
      // function isCPF(...) { ... } sem importar do DS
      'FunctionDeclaration[id.name=/^(is|validate|check)?(cpf|cnpj|email|cep)$/i]'(node) {
        const name = node.id.name;
        const match = name.match(/(cpf|cnpj|email|cep)/i);
        if (!match) return;
        const validator = match[1].toLowerCase();
        if (SUSPICIOUS_NAMES.test(name)) {
          context.report({
            node: node.id,
            messageId: 'suspiciousName',
            data: { name, type: validator.toUpperCase(), validator },
          });
        }
      },
    };
  },
};
