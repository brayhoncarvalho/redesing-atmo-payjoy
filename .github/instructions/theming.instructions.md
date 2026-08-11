---
applyTo: "src/**/*.{ts,vue,css}"
description: >
  Theming e Dark Mode via remapeamento da camada semantic de tokens.
  Define estratégia de troca de tema, persistência, FOUC prevention, system preference,
  contraste por tema e regras de acessibilidade (prefers-color-scheme, prefers-contrast).
  Depende de design-tokens.instructions.md (camada semantic).
---

# Theming & Dark Mode

## Princípio

**Tema é remapeamento da camada SEMANTIC — nada mais.**
Se a arquitetura de tokens está correta (ver `design-tokens.instructions.md`), adicionar dark mode ou um novo tema é trocar para onde os semantic tokens apontam. Componentes **nunca** sabem qual tema está ativo — eles só consomem semantic tokens.

> Se você precisa adicionar `dark:` em dezenas de componentes, sua arquitetura de tokens falhou. Dark mode correto vive na camada de tokens, não no markup.

---

## Estratégia — Semantic Remapping por `data-theme`

```css
/* src/styles/tokens/themes.css */

/* TEMA CLARO (default) — remapeia semantic → primitive */
:root,
[data-theme="light"] {
  --color-text-default:    var(--color-gray-900);
  --color-text-muted:      var(--color-gray-500);
  --color-surface-default: var(--color-white);
  --color-surface-subtle:  var(--color-gray-200);
  --color-border-default:  var(--color-gray-200);
  --color-action-on-primary: var(--color-white);
  /* feedback e action-primary geralmente não mudam de hue,
     mas podem ter variantes de luminosidade por tema */
}

/* TEMA ESCURO — só a camada semantic muda */
[data-theme="dark"] {
  --color-text-default:    var(--color-gray-200);
  --color-text-muted:      var(--color-gray-300);
  --color-surface-default: #1a1a1a;     /* primitive dark — adicionar à camada 1 */
  --color-surface-subtle:  #2a2a2a;
  --color-border-default:  #3a3a3a;
  --color-action-on-primary: var(--color-gray-900);  /* teal sobre escuro pede texto escuro */

  /* Sombras precisam ser mais sutis no dark (luz não funciona igual) */
  --shadow-1: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-2: 0 4px 12px rgba(0,0,0,0.6);
}
```

> **Importante:** primitives específicos de dark (ex: `#1a1a1a`) devem ser adicionados à camada primitive com nome próprio (`--color-gray-950`), não inline. A camada theme apenas **remapeia** semantic → primitive.

---

## Aplicação do Tema — Composable

```ts
// src/composables/useTheme.ts
import { ref, watch, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'system'
const STORAGE_KEY = 'dock-theme'

const theme = ref<Theme>('system')

function resolveTheme(t: Theme): 'light' | 'dark' {
  if (t === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return t
}

function applyTheme(t: Theme) {
  const resolved = resolveTheme(t)
  document.documentElement.setAttribute('data-theme', resolved)
  // Atualiza meta theme-color para browser chrome (mobile)
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', resolved === 'dark' ? '#1a1a1a' : '#ffffff')
}

export function useTheme() {
  function setTheme(t: Theme) {
    theme.value = t
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme(t)
  }

  onMounted(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
    theme.value = saved
    applyTheme(saved)

    // Reage a mudança da preferência do sistema (só se theme === 'system')
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (theme.value === 'system') applyTheme('system')
      })
  })

  return { theme, setTheme }
}
```

---

## FOUC Prevention — Crítico

**Flash of Unstyled Content** (tela pisca no tema errado ao carregar) é inaceitável. Aplicar o tema **antes** do Vue montar, via script inline no `<head>`:

```html
<!-- index.html — ANTES de qualquer CSS/JS da app -->
<head>
  <meta name="theme-color" content="#ffffff" />
  <script>
    // Bloqueante e mínimo — roda antes do paint
    (function () {
      var saved = localStorage.getItem('dock-theme') || 'system';
      var dark = saved === 'dark' ||
        (saved === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    })();
  </script>
</head>
```

**BLOCKER:** Aplicar tema só após o Vue montar (causa flash visível do tema errado).

---

## Toggle de Tema — Componente

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
const { theme, setTheme } = useTheme()

const options = [
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'dark', label: 'Escuro', icon: 'moon' },
  { value: 'system', label: 'Sistema', icon: 'monitor' },
] as const
</script>

<template>
  <fieldset role="radiogroup" aria-label="Tema da interface" class="flex gap-1 p-1 bg-surface-subtle rounded-token-md">
    <button
      v-for="opt in options"
      :key="opt.value"
      role="radio"
      :aria-checked="theme === opt.value"
      :aria-label="`Tema ${opt.label}`"
      class="min-h-[44px] min-w-[44px] px-3 rounded transition-colors duration-fast
             focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
      :class="theme === opt.value
        ? 'bg-surface text-action'
        : 'text-muted hover:text-default'"
      @click="setTheme(opt.value)"
    >
      <Icon :name="opt.icon" aria-hidden="true" />
      <span class="sr-only">{{ opt.label }}</span>
    </button>
  </fieldset>
</template>
```

---

## Acessibilidade de Theming

### `prefers-color-scheme` — respeitar a escolha do SO
O default DEVE ser `system` — respeitar a preferência do sistema operacional do usuário, não forçar claro.

### `prefers-contrast` — tema de alto contraste
```css
@media (prefers-contrast: more) {
  [data-theme="light"] {
    --color-text-muted: var(--color-gray-900);  /* sobe contraste */
    --color-border-default: var(--color-gray-600);
  }
  [data-theme="dark"] {
    --color-text-muted: var(--color-white);
    --color-border-default: var(--color-white);
  }
}
```

### Contraste por tema — validar SEMPRE os dois
**Cada tema é uma matriz de contraste independente.** Um par texto/fundo que passa AA no claro pode falhar no escuro.

```
REGRA: validar contraste ≥4.5:1 (texto normal) em CADA tema separadamente.
- Texto default sobre surface default → AA nos 2 temas?
- Texto muted sobre surface subtle → AA nos 2 temas?
- Texto on-primary sobre action-primary → AA nos 2 temas?
- Borda de foco visível nos 2 temas?
```

**BLOCKER:** Par de cores que passa AA num tema mas falha no outro.

### `color-scheme` — controles nativos
```css
:root { color-scheme: light; }
[data-theme="dark"] { color-scheme: dark; }
```
Isso faz scrollbars, inputs nativos e `<select>` adotarem o esquema correto.

---

## Imagens e Assets por Tema

```vue
<!-- Logo/ilustração que muda por tema -->
<picture>
  <source srcset="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
  <img src="/logo-light.svg" alt="Dock" />
</picture>

<!-- OU controlado por data-theme via CSS -->
<style scoped>
.logo { content: url('/logo-light.svg'); }
[data-theme="dark"] .logo { content: url('/logo-dark.svg'); }
</style>
```

Para SVG inline, usar `currentColor` e tokens — o ícone herda a cor do tema automaticamente.

---

## Checklist de Theming

```
ARQUITETURA
  [ ] Dark mode vive na camada semantic (não em dezenas de dark: no markup)?
  [ ] Primitives de dark têm nome próprio (não hex inline na camada theme)?
  [ ] Componentes consomem semantic tokens (agnósticos de tema)?

COMPORTAMENTO
  [ ] Default é 'system' (respeita SO)?
  [ ] Escolha persiste em localStorage?
  [ ] Reage a mudança de prefers-color-scheme quando em 'system'?
  [ ] meta theme-color atualiza com o tema?

FOUC
  [ ] Tema aplicado via script inline no <head> antes do paint?
  [ ] Sem flash de tema errado no reload?

ACESSIBILIDADE
  [ ] Contraste ≥4.5:1 validado em CADA tema separadamente?
  [ ] prefers-contrast tratado?
  [ ] color-scheme declarado (controles nativos)?
  [ ] Toggle navegável por teclado com aria-checked?
  [ ] Foco visível nos dois temas?
```

## Anti-Patterns de Theming

```
❌ Dark mode via dark: espalhado no markup de cada componente
❌ Forçar tema claro ignorando prefers-color-scheme do usuário
❌ Aplicar tema só após Vue montar (FOUC)
❌ Hex de dark inline na camada theme (deve ser primitive nomeado)
❌ Validar contraste só no tema claro
❌ Componente que checa o tema ativo via JS para decidir cor (deve usar token)
❌ Esquecer scrollbars/inputs nativos (faltou color-scheme)
❌ Toggle de tema sem estado acessível (aria-checked/radiogroup)
```
