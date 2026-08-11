---
applyTo: "src/**/*.{ts,vue,css,js}"
description: >
  Arquitetura de Design Tokens em 3 camadas (primitive → semantic → component).
  Define naming conventions, fluxo de consumo, proibição de valores hardcoded e
  a ponte entre tokens do DS Dock, Tailwind e CSS custom properties.
  Complementa figma-bidirectional (sync) e theming (consumo por tema).
---

# Design Tokens — Arquitetura em 3 Camadas

## Princípio Fundamental

**Nenhum valor visual (cor, espaço, tipografia, sombra, raio) pode ser hardcoded em componente.**
Todo valor visual nasce de um token. Tokens são a fonte única de verdade que conecta Figma → CSS → Tailwind → componente. Isso é o que torna a UI sistematicamente consistente em vez de consistente "por esforço manual".

> Se você está digitando um hex, um px de espaço ou um valor de sombra direto no componente, está criando dívida de design. Use um token.

---

## A Arquitetura — 3 Camadas

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 1 — PRIMITIVE (Global / Raw)                         │
│  Valores brutos, sem semântica. "O quê existe."              │
│  Ex: --color-teal-500: #00d8d8;  --space-4: 16px;            │
│         ↓ referenciado por                                    │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 2 — SEMANTIC (Alias / Intent)                        │
│  Significado de uso. "Para que serve." MUDA POR TEMA.        │
│  Ex: --color-action-primary: var(--color-teal-500);          │
│       --color-text-default: var(--color-gray-900);           │
│         ↓ referenciado por                                    │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 3 — COMPONENT (Scoped)                               │
│  Específico do componente. "Onde se aplica."                 │
│  Ex: --button-primary-bg: var(--color-action-primary);       │
│       --input-border-error: var(--color-feedback-danger);    │
└─────────────────────────────────────────────────────────────┘
                          ↓ consumido por
              Tailwind classes / componente Vue
```

### Regra de ouro do fluxo
```
Componente → CONSOME camada SEMANTIC ou COMPONENT (nunca PRIMITIVE direto)
Semantic   → REFERENCIA Primitive (nunca outro hex)
Primitive  → É o único lugar com valores brutos (hex, px)
```

**BLOCKER:** Componente que referencia diretamente um token primitive (`var(--color-teal-500)` em vez de `var(--color-action-primary)`). A semântica é a interface; o primitive é a implementação.

---

## CAMADA 1 — Primitive Tokens

Valores brutos da marca Dock. **Nunca mudam por tema.** São o vocabulário fechado.

```css
/* src/styles/tokens/primitive.css */
:root {
  /* ── Cores de marca (hex exatos do DESIGN_SYSTEM.md) ── */
  --color-teal-300: #1cc0c0;
  --color-teal-500: #00d8d8;
  --color-yellow-300: #eeff88;

  /* ── Escala neutra ── */
  --color-gray-900: #242424;  /* texto escuro */
  --color-gray-700: #444746;  /* botão escuro */
  --color-gray-600: #5c5c5c;  /* texto cinza */
  --color-gray-500: #777777;  /* texto muted */
  --color-gray-300: #b9b9b9;  /* track/disabled */
  --color-gray-200: #e6e6e6;  /* fundo claro */
  --color-white:    #ffffff;
  --color-black:    #000000;

  /* ── Cores de feedback (semáforo) ── */
  --color-red-500:    #dc3545;  /* danger */
  --color-green-500:  #10b981;  /* success */
  --color-amber-500:  #f59e0b;  /* warning */
  --color-blue-500:   #3b82f6;  /* info */

  /* ── Espaçamento (grade de 4px) ── */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-5: 24px;  --space-6: 32px;  --space-8: 40px;  --space-10: 48px;
  --space-16: 64px; --space-24: 96px;

  /* ── Tipografia ── */
  --font-family-base: 'Roboto', system-ui, sans-serif;
  --font-family-cta:  'Red Hat Display', sans-serif;
  --font-weight-light: 300;   --font-weight-regular: 400;
  --font-weight-medium: 500;  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-size-micro: 11px;  --font-size-caption: 12px; --font-size-body: 14px;
  --font-size-body-lg: 16px; --font-size-h4: 16px; --font-size-h3: 20px;
  --font-size-h2: 24px; --font-size-h1: 32px; --font-size-display: 44px;

  /* ── Raio ── */
  --radius-none: 0; --radius-sm: 4px; --radius-md: 8px;
  --radius-lg: 12px; --radius-full: 9999px;

  /* ── Elevação (apenas 2 níveis — não proliferar) ── */
  --shadow-1: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-2: 0 4px 12px rgba(0,0,0,0.12);

  /* ── Z-index (escala fechada) ── */
  --z-base: 0; --z-dropdown: 100; --z-sticky: 200;
  --z-overlay: 300; --z-modal: 400; --z-toast: 500;
}
```

### Naming Convention — Primitive
```
--{categoria}-{escala}
--color-teal-500    ✅
--space-4           ✅
--font-size-h1      ✅

--color-primary     ❌ (isso é semântica, não primitive)
--teal              ❌ (sem escala)
--meu-azul-legal    ❌ (não sistemático)
```

---

## CAMADA 2 — Semantic Tokens

O **intent** de uso. É o que os componentes consomem. **Muda por tema** (ver `theming.instructions.md`).

```css
/* src/styles/tokens/semantic.css */
:root {
  /* ── Ação ── */
  --color-action-primary:        var(--color-teal-500);
  --color-action-primary-hover:  var(--color-teal-300);
  --color-action-on-primary:     var(--color-white);
  --color-action-secondary:      var(--color-gray-700);

  /* ── Texto ── */
  --color-text-default:    var(--color-gray-900);
  --color-text-muted:      var(--color-gray-500);
  --color-text-on-dark:    var(--color-white);
  --color-text-link:       var(--color-teal-500);
  --color-text-disabled:   var(--color-gray-300);

  /* ── Superfície / fundo ── */
  --color-surface-default: var(--color-white);
  --color-surface-subtle:  var(--color-gray-200);
  --color-surface-inverse: var(--color-black);

  /* ── Borda ── */
  --color-border-default:  var(--color-gray-200);
  --color-border-strong:   var(--color-gray-300);
  --color-border-focus:    var(--color-teal-500);

  /* ── Feedback (papéis semânticos — ver ux-principles §8) ── */
  --color-feedback-danger:   var(--color-red-500);
  --color-feedback-success:  var(--color-green-500);
  --color-feedback-warning:  var(--color-amber-500);
  --color-feedback-info:     var(--color-blue-500);

  /* ── Espaço semântico (intent, não valor) ── */
  --space-inline-tight:   var(--space-1);  /* ícone ↔ label */
  --space-stack-field:    var(--space-2);  /* label ↔ input */
  --space-stack-group:    var(--space-5);  /* campo ↔ campo */
  --space-stack-section:  var(--space-16); /* seção ↔ seção */
}
```

### Naming Convention — Semantic
```
--color-{papel}-{variante?}
--color-action-primary       ✅
--color-text-muted           ✅
--color-feedback-danger      ✅
--color-border-focus         ✅

--color-teal-button          ❌ (mistura primitive com uso)
--color-azul-do-botao        ❌
```

### Regra crítica de semantic tokens
- Semantic tokens **sempre** referenciam primitive via `var()` — nunca repetem um hex.
- O nome descreve o **papel**, não a aparência. `--color-action-primary` (não `--color-teal`).
- Quando o tema muda, **só a camada semantic é remapeada** — primitives e componentes não mudam.

---

## CAMADA 3 — Component Tokens

Específicos do componente. Opcional, mas recomendado para componentes complexos. Referenciam semantic.

```css
/* src/styles/tokens/components.css */
:root {
  /* Button */
  --button-primary-bg:        var(--color-action-primary);
  --button-primary-bg-hover:  var(--color-action-primary-hover);
  --button-primary-text:      var(--color-action-on-primary);
  --button-height:            var(--space-10);  /* 48px — Fitts */
  --button-radius:            var(--radius-md);

  /* Input */
  --input-border:             var(--color-border-default);
  --input-border-focus:       var(--color-border-focus);
  --input-border-error:       var(--color-feedback-danger);
  --input-height:             var(--space-10);

  /* Card */
  --card-bg:        var(--color-surface-default);
  --card-shadow:    var(--shadow-1);
  --card-shadow-hover: var(--shadow-2);
  --card-radius:    var(--radius-lg);
}
```

---

## Ponte com Tailwind

O `tailwind.config.js` deve mapear para os tokens semantic via CSS variables — **não duplicar valores**.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Aponta para semantic tokens (permite theming automático)
        'action': {
          DEFAULT: 'var(--color-action-primary)',
          hover: 'var(--color-action-primary-hover)',
        },
        'text': {
          DEFAULT: 'var(--color-text-default)',
          muted: 'var(--color-text-muted)',
        },
        'surface': {
          DEFAULT: 'var(--color-surface-default)',
          subtle: 'var(--color-surface-subtle)',
        },
        'danger': 'var(--color-feedback-danger)',
        'success': 'var(--color-feedback-success)',
        'warning': 'var(--color-feedback-warning)',
      },
      spacing: {
        'field': 'var(--space-stack-field)',
        'group': 'var(--space-stack-group)',
        'section': 'var(--space-stack-section)',
      },
      borderRadius: {
        'token-md': 'var(--radius-md)',
        'token-lg': 'var(--radius-lg)',
      },
    },
  },
}
```

### Uso em componente — antes vs depois

```vue
<!-- ❌ ERRADO: valores hardcoded -->
<button class="bg-[#00d8d8] hover:bg-[#1cc0c0] text-white h-12 rounded-lg px-6">
  Enviar
</button>

<!-- ✅ CORRETO: tokens semânticos via Tailwind -->
<button class="bg-action hover:bg-action-hover text-[var(--color-action-on-primary)] h-[var(--button-height)] rounded-token-md px-6">
  Enviar
</button>

<!-- ✅ MELHOR AINDA: usar componente do DS que já consome tokens -->
<DsButton variant="primary">Enviar</DsButton>
```

---

## Fluxo de Decisão — Que Token Usar?

```
Preciso de um valor visual
  ↓
Existe componente do DS que já resolve? → USE O COMPONENTE (DsButton, DsInput...)
  ↓ não
Existe component token para isso? → USE component token (--button-primary-bg)
  ↓ não
Existe semantic token para o papel? → USE semantic token (--color-action-primary)
  ↓ não
É um caso de marca genuinamente novo? → PROPONHA novo semantic token + primitive
  ↓ nunca
Hardcode o hex/px → ❌ PROIBIDO. Pare e crie o token.
```

---

## Integração com Figma (sync)

Tokens devem espelhar o Figma via DTCG export (ver `figma-bidirectional.instructions.md`):

```
Figma Variables (fonte de verdade visual)
  ↓ figma:sync → exporta DTCG JSON
tokens/dock-tokens.json (formato DTCG)
  ↓ build script
src/styles/tokens/primitive.css + semantic.css
  ↓ consumido por
Tailwind + componentes
```

- O `figma:sync` atualiza **primitives e semantics**, nunca component tokens (esses são decisão de engenharia).
- Mudança de primitive sem passar por sync = drift. Sempre validar com `npm run validate:design`.

---

## Validação (ESLint plugin dock-ds)

O plugin custom já valida cores não autorizadas. Estender mentalmente para tokens:

```
✅ Permitido:  var(--color-action-primary), bg-action, text-muted
❌ BLOCKER:    bg-[#00d8d8], color: #242424, padding: 18px (fora da grade)
⚠️ WARNING:    var(--color-teal-500) em componente (primitive vazado)
```

---

## Anti-Patterns de Tokens

```
❌ Hex hardcoded em componente (bg-[#00d8d8])
❌ Componente consumindo primitive direto (var(--color-teal-500))
❌ Semantic token repetindo hex em vez de referenciar primitive
❌ Criar token sob demanda com nome não sistemático (--meu-azul)
❌ Duplicar valores entre tailwind.config e CSS vars (drift garantido)
❌ Espaçamento fora da escala (--space arbitrário de 18px)
❌ Mais de 2 níveis de shadow (proliferação de elevação)
❌ Z-index mágico (z-[9999]) em vez de --z-modal
❌ Mudar primitive para resolver necessidade de tema (use semantic remapping)
```

## Checklist de Tokens

```
[ ] Nenhum hex hardcoded no componente?
[ ] Componente consome semantic/component tokens (não primitive)?
[ ] Semantic tokens referenciam primitives via var()?
[ ] Espaçamentos usam a escala de 4px?
[ ] Tailwind aponta para CSS vars (sem duplicar valores)?
[ ] Z-index usa a escala fechada (--z-*)?
[ ] Novo token segue a naming convention da sua camada?
```
