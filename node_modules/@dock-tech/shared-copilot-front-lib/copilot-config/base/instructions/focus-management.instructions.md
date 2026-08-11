---
applyTo: "src/**/*.{vue,ts}"
description: >
  Focus management avançado: focus trap, focus restoration em navegação/conteúdo dinâmico,
  roving tabindex e aria-activedescendant para widgets compostos, skip links, ordem de foco,
  disciplina de autofocus. Aprofunda accessibility (WCAG focus) e component-anatomy (modal trap).
---

# Focus Management Avançado

## Princípio

**O foco é o cursor do usuário de teclado e de leitor de tela — perdê-lo é desorientá-lo completamente.**
A acessibilidade básica (focus ring visível, ordem de tab) já está em `accessibility.instructions.md`. Este documento cobre o nível avançado: o que acontece com o foco quando a UI **muda** — modal abre, item é deletado, rota troca, conteúdo carrega. Foco mal gerenciado é a falha de a11y mais comum e mais invisível para quem testa só com mouse.

> Regra mental: depois de QUALQUER mudança na UI, pergunte "onde está o foco agora?". Se a resposta for "não sei" ou "no `<body>`", há um bug.

---

## REGRA 1 — Focus Trap (modais, drawers, popovers)

Já especificado para Modal em `component-anatomy.instructions.md`. O composable reutilizável:

```ts
// src/composables/useFocusTrap.ts
import { onMounted, onBeforeUnmount, type Ref } from 'vue'

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useFocusTrap(container: Ref<HTMLElement | null>) {
  let previouslyFocused: HTMLElement | null = null

  function onKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab' || !container.value) return
    const nodes = Array.from(container.value.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (!nodes.length) return
    const first = nodes[0], last = nodes[nodes.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  }

  onMounted(() => {
    previouslyFocused = document.activeElement as HTMLElement
    // foco vai para o primeiro elemento focável (ou o container)
    const target = container.value?.querySelector<HTMLElement>(FOCUSABLE) ?? container.value
    target?.focus()
    document.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    previouslyFocused?.focus()   // ← FOCUS RESTORATION: volta para quem abriu
  })
}
```

### Regras de trap
- Tab e Shift+Tab circulam **dentro** do container — nunca escapam para o fundo.
- Ao abrir: foco vai para o primeiro focável (ou um alvo lógico, ex: campo de busca).
- Ao fechar: foco **retorna ao elemento que abriu** (botão trigger) — nunca cai no `<body>`.

**BLOCKER:** Modal/drawer sem trap, ou que não restaura o foco ao trigger ao fechar.

---

## REGRA 2 — Focus Restoration em Navegação (Vue Router)

Em SPA, trocar de rota **não move o foco** por padrão — leitores de tela continuam anunciando a tela antiga. Corrigir movendo o foco para o início do conteúdo novo.

```ts
// router — após navegação, foca o heading principal da nova tela
router.afterEach((to) => {
  nextTick(() => {
    const main = document.querySelector<HTMLElement>('main h1, [data-route-focus]')
    if (main) {
      main.setAttribute('tabindex', '-1')   // torna focável programaticamente
      main.focus()
    }
    // anuncia a nova tela para leitores de tela
    announce(`Navegou para ${to.meta.title ?? to.name?.toString() ?? 'nova página'}`)
  })
})
```

```ts
// src/composables/useAnnouncer.ts — live region global para anúncios
export function announce(message: string, assertive = false) {
  const region = document.getElementById(assertive ? 'sr-assertive' : 'sr-polite')
  if (region) { region.textContent = ''; requestAnimationFrame(() => region.textContent = message) }
}
```
```html
<!-- App.vue — live regions globais -->
<div id="sr-polite" aria-live="polite" class="sr-only" />
<div id="sr-assertive" aria-live="assertive" class="sr-only" />
```

**BLOCKER:** Troca de rota em SPA sem mover o foco nem anunciar a nova tela (usuário de leitor de tela fica perdido).

---

## REGRA 3 — Focus após Conteúdo Dinâmico (delete, async)

Quando um elemento focado é **removido** (deletar item da lista, fechar card), o foco cai no `<body>`. Gerenciar explicitamente:

```ts
function removeItem(index: number) {
  const list = items.value
  list.splice(index, 1)
  nextTick(() => {
    // foca o item seguinte, ou o anterior se era o último, ou o container vazio
    const next = list[index] ?? list[index - 1]
    const el = next
      ? listRef.value?.querySelector<HTMLElement>(`[data-item="${next.id}"]`)
      : emptyStateRef.value
    el?.focus()
    announce(`Item removido. ${list.length} itens restantes.`)
  })
}
```

### Regras
- Após remover o item focado: focar o **vizinho lógico** (próximo, ou anterior se era o último).
- Após carregar conteúdo assíncrono que substitui a tela: focar o início do novo conteúdo.
- Após submeter formulário com erro: focar o **primeiro campo com erro** (ver `form-patterns`).
- Anunciar mudanças relevantes via live region.

**BLOCKER:** Deletar o item focado deixando o foco órfão no `<body>`.

---

## REGRA 4 — Roving Tabindex (widgets compostos)

Em widgets com muitos itens navegáveis (menu, toolbar, tabs, radio group, grid), **NÃO** colocar todos no fluxo de Tab — isso força o usuário a tabular item por item. Usar **roving tabindex**: um único item tabável por vez, navegação interna com setas (padrão ARIA APG).

```ts
// src/composables/useRovingTabindex.ts
import { ref, type Ref } from 'vue'

export function useRovingTabindex(itemCount: Ref<number>, orientation: 'horizontal' | 'vertical' = 'horizontal') {
  const activeIndex = ref(0)
  const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
  const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'

  function onKeydown(e: KeyboardEvent) {
    if (e.key === nextKey)      { e.preventDefault(); activeIndex.value = (activeIndex.value + 1) % itemCount.value }
    else if (e.key === prevKey) { e.preventDefault(); activeIndex.value = (activeIndex.value - 1 + itemCount.value) % itemCount.value }
    else if (e.key === 'Home')  { e.preventDefault(); activeIndex.value = 0 }
    else if (e.key === 'End')   { e.preventDefault(); activeIndex.value = itemCount.value - 1 }
  }
  // item ativo: tabindex="0"; demais: tabindex="-1"
  const tabindexFor = (i: number) => (i === activeIndex.value ? 0 : -1)
  return { activeIndex, onKeydown, tabindexFor }
}
```

```vue
<!-- Toolbar com roving tabindex -->
<div role="toolbar" aria-label="Ações" @keydown="onKeydown">
  <button v-for="(action, i) in actions" :key="action.id"
          :tabindex="tabindexFor(i)" :ref="el => i === activeIndex && (el as HTMLElement)?.focus()">
    {{ action.label }}
  </button>
</div>
```

### Quando roving tabindex vs aria-activedescendant
| Padrão | Quando | Foco DOM real |
|--------|--------|---------------|
| **Roving tabindex** | Menu, toolbar, tabs, radio, tree | Move entre elementos |
| **aria-activedescendant** | Combobox, listbox com input de busca | Fica no input; item "ativo" via aria |

**BLOCKER:** Widget composto (menu/toolbar/tabs) que força Tab item por item em vez de roving tabindex + setas.

---

## REGRA 5 — Skip Links

Permitir pular navegação repetitiva e ir direto ao conteúdo (WCAG 2.4.1).

```vue
<!-- Primeiro elemento focável da página -->
<a href="#main-content"
   class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-toast
          focus:bg-surface focus:text-action focus:px-4 focus:py-2 focus:rounded-token-md">
  Pular para o conteúdo
</a>
<!-- ... nav ... -->
<main id="main-content" tabindex="-1">...</main>
```

Obrigatório em telas com navegação extensa (sidebar, header com muitos links).

---

## REGRA 6 — Disciplina de Autofocus

```
✅ Autofocus quando: campo único óbvio (busca em modal de busca, primeiro campo de formulário dedicado)
❌ Autofocus quando: a tela tem conteúdo a ler antes (rouba contexto), em mobile (abre teclado e empurra a tela)

Nunca autofocus em:
  - Telas de conteúdo/leitura
  - Mais de um elemento (impossível — último ganha, comportamento confuso)
  - Campo no meio da página (faz scroll inesperado)
```

---

## Checklist de Focus Management

```
TRAP & RESTORATION
  [ ] Modais/drawers com focus trap?
  [ ] Foco retorna ao trigger ao fechar overlay?
  [ ] Troca de rota move o foco + anuncia a nova tela?

DINÂMICO
  [ ] Deletar item focado move o foco para vizinho lógico?
  [ ] Submit com erro foca o primeiro campo com erro?
  [ ] Live region anuncia mudanças relevantes?

COMPOSTOS
  [ ] Menu/toolbar/tabs usam roving tabindex (não Tab item a item)?
  [ ] Combobox usa aria-activedescendant?
  [ ] Navegação por setas + Home/End implementada?

GERAL
  [ ] Skip link presente em navegação extensa?
  [ ] Autofocus usado com disciplina (não em mobile/telas de leitura)?
  [ ] Foco nunca cai órfão no <body> após mudança de UI?
```

## Anti-Patterns de Focus

```
❌ Modal que não restaura foco ao trigger ao fechar
❌ Troca de rota sem mover foco (leitor de tela preso na tela antiga)
❌ Deletar item focado deixando foco no <body>
❌ Widget composto forçando Tab item por item (faltou roving tabindex)
❌ Autofocus em mobile (abre teclado, empurra layout)
❌ Sem skip link em página com navegação extensa
❌ Remover outline de foco sem substituir por indicador visível
❌ tabindex positivo (tabindex="3") — quebra a ordem natural
❌ Foco em elemento invisível/fora de tela
```
