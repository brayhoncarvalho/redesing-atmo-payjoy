---
applyTo: "src/**/*.vue"
description: "Padrões de motion design: transições, animações aprovadas, tokens de duração/easing e regras de acessibilidade para movimento."
---

# Motion Design — Padrões

## Princípio
**Movimento com propósito.** Animações comunicam estado, guiam atenção e dão feedback — nunca são decoração gratuita.

---

## 1. Tokens de Motion

### Duração
| Token | Valor | Uso |
|-------|-------|-----|
| `duration-instant` | 100ms | Hover, focus, estados micro |
| `duration-fast` | 200ms | Fade in/out, toggle |
| `duration-normal` | 300ms | Slide, expand/collapse |
| `duration-slow` | 500ms | Modais, overlays, page transitions |

### Easing
| Token | Valor | Uso |
|-------|-------|-----|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Padrão para a maioria |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elementos saindo da tela |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elementos entrando na tela |
| `ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Bouncing sutil (toasts, badges) |

### Configuração Tailwind
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      transitionDuration: {
        'instant': '100ms',
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
}
```

---

## 2. Transições Aprovadas

### Vue `<Transition>` — Padrões

```vue
<!-- Fade -->
<Transition name="fade">
  <div v-if="show">...</div>
</Transition>

<!-- Slide down (expand) -->
<Transition name="slide-down">
  <div v-if="expanded">...</div>
</Transition>
```

```css
/* src/style.css — transições globais */

/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide down */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Scale (modal/dialog) */
.scale-enter-active,
.scale-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
```

### `<TransitionGroup>` — Listas
```vue
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">{{ item.name }}</li>
</TransitionGroup>
```

```css
.list-enter-active,
.list-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
.list-move {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 3. Quando Usar Cada Tipo

| Situação | Tipo | Duração | Easing |
|----------|------|---------|--------|
| Hover em botão/link | CSS transition | instant (100ms) | default |
| Focus ring | CSS transition | instant (100ms) | default |
| Toast aparecendo | Vue Transition (fade) | fast (200ms) | ease-out |
| Toast saindo | Vue Transition (fade) | fast (200ms) | ease-in |
| Modal abrindo | Vue Transition (scale) | normal (300ms) | ease-out |
| Modal fechando | Vue Transition (scale) | fast (200ms) | ease-in |
| Accordion expand | Vue Transition (slide-down) | normal (300ms) | default |
| Troca de tela (stepper) | Vue Transition (fade) | normal (300ms) | default |
| Skeleton → conteúdo | Vue Transition (fade) | fast (200ms) | default |
| Erro inline aparecendo | Vue Transition (slide-down) | fast (200ms) | ease-out |
| Item adicionado à lista | TransitionGroup | normal (300ms) | ease-out |

---

## 4. Acessibilidade — `prefers-reduced-motion`

### Regra OBRIGATÓRIA (WCAG 2.2 AA — 2.3.3)
Usuários podem ter sensibilidade a movimento. **Toda animação DEVE ser desabilitável.**

### Implementação global
```css
/* src/style.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Detecção em JS (para lógica condicional)
```ts
// src/composables/useReducedMotion.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useReducedMotion() {
  const prefersReduced = ref(false)
  let mql: MediaQueryList

  onMounted(() => {
    mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReduced.value = mql.matches
    mql.addEventListener('change', update)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', update)
  })

  function update(e: MediaQueryListEvent) {
    prefersReduced.value = e.matches
  }

  return { prefersReduced }
}
```

### Uso
```vue
<script setup>
import { useReducedMotion } from '@/composables/useReducedMotion'
const { prefersReduced } = useReducedMotion()
</script>

<template>
  <!-- Sem animação de entrada se preferência ativa -->
  <Transition :name="prefersReduced ? '' : 'fade'">
    <div v-if="show">...</div>
  </Transition>
</template>
```

---

## 5. Performance de Animações

### Regras
- Animar APENAS propriedades baratas: `opacity`, `transform` (GPU-accelerated).
- **NUNCA** animar: `width`, `height`, `top`, `left`, `margin`, `padding` (causa reflow).
- Para expand/collapse de height: usar `max-height` com valor fixo ou `grid-template-rows: 0fr → 1fr`.
- `will-change` apenas quando medido que ajuda (não preventivamente).
- Animações em loop (spinner) devem usar `animation` CSS, não JS setInterval.

### Propriedades seguras para animar
```css
/* ✅ GPU-accelerated — barato */
transform: translateX(), translateY(), scale(), rotate()
opacity: 0 → 1

/* ❌ Causa layout/reflow — caro */
width, height, top, left, right, bottom, margin, padding, font-size
```

---

## Anti-Patterns (NUNCA fazer)

❌ Animação sem propósito (decoração pura, "porque fica bonito")
❌ Duração > 500ms para micro-interações (hover, focus)
❌ Ignorar `prefers-reduced-motion`
❌ Animar `width`/`height`/`margin` (usar transform)
❌ `will-change` em tudo (causa consumo de memória)
❌ Animação que bloqueia interação (usuário não pode clicar durante transição)
❌ Animação em loop infinito sem controle de pausa
❌ Transições diferentes para a mesma ação em partes diferentes da UI (inconsistência)
