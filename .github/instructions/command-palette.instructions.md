---
applyTo: "src/**/*.{vue,ts}"
description: >
  Command palette e atalhos de teclado para power-users (especialmente console-app):
  registro de ações, padrão ARIA combobox, fuzzy search, convenções de atalho, descoberta,
  escopo e prevenção de conflito. Integra com navigation-ia e focus-management.
---

# Command Palette & Atalhos de Teclado

## Princípio

**Power-users navegam por teclado; obrigá-los ao mouse é desperdiçar o tempo de quem mais usa o produto.**
Um console admin usado horas por dia por operadores se beneficia enormemente de atalhos e de um command palette (Cmd/Ctrl+K) — a forma mais escalável de expor ações sem poluir a UI. Mas atalhos mal feitos atrapalham mais que ajudam: conflitam com o browser, disparam dentro de inputs, ou são impossíveis de descobrir.

> Atalhos são aceleradores (Nielsen — "flexibilidade e eficiência de uso"): aceleram o experiente sem prejudicar o iniciante. O iniciante ignora; o experiente voa.

---

## REGRA 1 — Registro Central de Ações

Comandos e atalhos vêm de um **registry único** — fonte de verdade para palette, atalhos e dicas.

```ts
// src/commands/registry.ts
export interface Command {
  id: string
  label: string                 // "Nova proposta"
  keywords?: string[]           // sinônimos para a busca fuzzy ("criar", "adicionar")
  group: 'Navegação' | 'Ações' | 'Configurações'
  shortcut?: string[]           // ['g', 'p'] (sequência) ou ['mod', 'k'] (combo)
  icon?: string
  perform: () => void | Promise<void>
  isAvailable?: () => boolean   // contexto: esconder se não aplicável
}

export const commands: Command[] = [
  { id: 'nav-propostas', label: 'Ir para Propostas', group: 'Navegação',
    shortcut: ['g', 'p'], perform: () => router.push({ name: 'propostas' }) },
  { id: 'proposta-nova', label: 'Nova proposta', keywords: ['criar', 'adicionar'],
    group: 'Ações', shortcut: ['mod', 'shift', 'n'], perform: () => router.push({ name: 'proposta-nova' }) },
  { id: 'toggle-theme', label: 'Alternar tema', group: 'Configurações',
    perform: () => useTheme().cycle() },
]
```

### Regra
- Toda ação relevante de teclado/palette nasce no registry — nunca atalho hardcoded espalhado.
- `isAvailable` filtra por contexto (permissão, rota, estado) — não mostrar o que não cabe.

---

## REGRA 2 — Command Palette (padrão ARIA Combobox)

Cmd/Ctrl+K abre uma busca de ações. Deve seguir o padrão **combobox + listbox** do ARIA APG.

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import { commands } from '@/commands/registry'
import { fuzzyFilter } from '@/commands/fuzzy'

const open = ref(false)
const query = ref('')
const activeIndex = ref(0)

const results = computed(() =>
  fuzzyFilter(commands.filter(c => c.isAvailable?.() ?? true), query.value)
)

const { Meta_K, Ctrl_K } = useMagicKeys({ passive: false,
  onEventFired(e) { if ((e.metaKey || e.ctrlKey) && e.key === 'k') e.preventDefault() } })
whenever(() => Meta_K.value || Ctrl_K.value, () => { open.value = true })

function run(i: number) { results.value[i]?.perform(); open.value = false; query.value = '' }
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex.value = (activeIndex.value + 1) % results.value.length }
  else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length }
  else if (e.key === 'Enter') { e.preventDefault(); run(activeIndex.value) }
  else if (e.key === 'Escape') { open.value = false }
}
</script>

<template>
  <Dialog v-if="open" aria-label="Paleta de comandos" @close="open = false">
    <div role="combobox" aria-expanded="true" aria-haspopup="listbox" aria-controls="cmd-list">
      <input
        v-model="query" type="text" autofocus
        aria-label="Buscar comando" aria-autocomplete="list"
        :aria-activedescendant="`cmd-${activeIndex}`"
        placeholder="Buscar ação ou navegar…  (↑↓ para mover, ↵ para executar)"
        class="w-full h-12 px-4 bg-surface text-default"
        @keydown="onKeydown"
      />
      <ul id="cmd-list" role="listbox" class="max-h-80 overflow-y-auto">
        <li
          v-for="(cmd, i) in results" :key="cmd.id"
          :id="`cmd-${i}`" role="option" :aria-selected="i === activeIndex"
          class="flex items-center justify-between px-4 py-3 cursor-pointer min-h-[44px]"
          :class="i === activeIndex ? 'bg-surface-subtle text-action' : 'text-default'"
          @mouseenter="activeIndex = i" @click="run(i)"
        >
          <span class="flex items-center gap-2"><Icon :name="cmd.icon" aria-hidden="true" />{{ cmd.label }}</span>
          <Kbd v-if="cmd.shortcut" :keys="cmd.shortcut" />
        </li>
        <li v-if="!results.length" class="px-4 py-6 text-center text-muted">Nenhum comando encontrado</li>
      </ul>
    </div>
  </Dialog>
</template>
```

### Regras do palette
- Cmd+K (mac) / Ctrl+K (win/linux) — convenção universal, respeitar (Jakob).
- Foco vai para o input ao abrir; ESC fecha; foco retorna ao trigger (ver `focus-management`).
- Navegação ↑↓ + Enter; item ativo via `aria-activedescendant` (foco permanece no input).
- Fuzzy search sobre label + keywords; mostrar o atalho de cada comando (descoberta).
- Empty state ("Nenhum comando encontrado").

---

## REGRA 3 — Convenções de Atalho

```
COMBOS (modificador + tecla) — ações imediatas
  Mod+K          → command palette       (Mod = Cmd no mac, Ctrl em win/linux)
  Mod+S          → salvar
  Mod+Enter      → submeter formulário
  Mod+Shift+N    → criar novo
  /              → focar busca
  ?              → mostrar atalhos (cheatsheet)
  Esc            → fechar/cancelar (sempre)

SEQUÊNCIAS (g depois p) — navegação (estilo Gmail/Linear)
  g p            → ir para Propostas
  g d            → ir para Dashboard
```

### Regras de convenção
- `Mod` abstrai Cmd/Ctrl por plataforma — nunca hardcodar Ctrl no mac.
- **Não** sobrescrever atalhos reservados do browser (Mod+T, Mod+W, Mod+L, Mod+R, etc.).
- `Esc` sempre cancela/fecha o contexto atual — consistente em todo o app.
- `?` abre a cheatsheet de atalhos (descoberta).

**BLOCKER:** Atalho que sobrescreve um atalho reservado do browser (Mod+W fechar aba, etc.).

---

## REGRA 4 — Não Disparar Dentro de Inputs

O erro mais comum: atalho de tecla única dispara enquanto o usuário digita num campo.

```ts
// src/composables/useShortcuts.ts
function isTypingContext(target: EventTarget | null): boolean {
  const el = target as HTMLElement
  return !!el && (
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' || el.isContentEditable
  )
}

function onKeydown(e: KeyboardEvent) {
  // teclas únicas (/, ?, g) NÃO disparam enquanto digita; combos (Mod+S) podem
  const isCombo = e.metaKey || e.ctrlKey
  if (!isCombo && isTypingContext(e.target)) return
  // ... resolver atalho
}
```

**BLOCKER:** Atalho de tecla única que dispara enquanto o usuário digita em um campo de texto.

---

## REGRA 5 — Descoberta (Discoverability)

Atalhos invisíveis não existem para o usuário. Tornar descobríveis:

```
- Cheatsheet (Mod+? ou ?) listando todos os atalhos por grupo
- Atalho exibido ao lado do item no command palette e em menus/tooltips
- Hint sutil no rodapé/empty state ("Pressione ⌘K para buscar")
- Componente <Kbd> consistente para renderizar teclas (⌘ ⇧ K)
```

```vue
<!-- Item de menu mostrando seu atalho -->
<MenuItem @click="novaProposta">
  Nova proposta
  <Kbd :keys="['mod', 'shift', 'n']" class="ml-auto text-muted" />
</MenuItem>
```

---

## Acessibilidade & Escopo

```
ACESSIBILIDADE
  - Command palette segue ARIA combobox/listbox (input + role=listbox + aria-activedescendant)
  - Toda ação do palette também alcançável por mouse/navegação normal (atalho é acelerador, não único caminho)
  - Cheatsheet navegável por teclado e leitor de tela

ESCOPO
  - Atalhos globais (Mod+K) vs escopados (dentro de um modal/tabela)
  - Atalho escopado só ativo quando o contexto tem foco
  - Desregistrar listeners ao desmontar (sem vazamento)
```

**BLOCKER:** Ação disponível **apenas** por atalho/palette, sem caminho por mouse (exclui quem não usa teclado).

---

## Checklist de Command Palette & Atalhos

```
REGISTRY
  [ ] Comandos/atalhos vêm de registry central?
  [ ] isAvailable filtra por contexto/permissão?

PALETTE
  [ ] Mod+K abre; ESC fecha; foco no input ao abrir e retorna ao fechar?
  [ ] Padrão ARIA combobox/listbox + aria-activedescendant?
  [ ] Fuzzy search + atalhos exibidos + empty state?

ATALHOS
  [ ] Mod abstrai Cmd/Ctrl por plataforma?
  [ ] Não sobrescreve atalhos reservados do browser?
  [ ] Teclas únicas não disparam dentro de inputs?
  [ ] Esc sempre cancela/fecha?

DESCOBERTA & A11Y
  [ ] Cheatsheet (?) disponível?
  [ ] Atalhos exibidos em menus/tooltips?
  [ ] Toda ação também alcançável sem teclado?
```

## Anti-Patterns

```
❌ Atalho de tecla única disparando dentro de input
❌ Sobrescrever atalho reservado do browser (Mod+W/T/L/R)
❌ Hardcodar Ctrl no mac (ignorar Cmd)
❌ Ação só por atalho/palette, sem caminho de mouse (exclui usuários)
❌ Atalhos sem nenhuma forma de descoberta (cheatsheet/hints)
❌ Command palette sem padrão ARIA (listbox/activedescendant)
❌ Não restaurar foco ao fechar o palette
❌ Atalhos hardcoded espalhados em vez de registry central
❌ Listeners de atalho não removidos ao desmontar (vazamento/conflito)
```
