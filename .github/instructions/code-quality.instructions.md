---
applyTo: "src/**/*.{ts,vue}"
description: "Padrões de qualidade de código: Composition API, TypeScript, Tailwind, estrutura de componentes Vue 3."
---

# Qualidade de Código — Padrões Obrigatórios

## Vue 3 — Composition API
- Usar `<script setup lang="ts">` em todo componente.
- Não usar Options API.
- Props tipadas com `defineProps<{}>()`.
- Emits tipados com `defineEmits<{}>()`.

## TypeScript
- Strict mode habilitado.
- Tipar props, emits, refs e computed.
- Evitar `any` — usar tipos específicos ou genéricos.
- Interfaces/types em arquivo separado quando compartilhados.

## Tailwind CSS
- Priorizar classes Tailwind sobre `<style>` inline.
- Usar tokens do `tailwind.config.js` (cores, fontes, espaçamentos customizados).
- `<style scoped>` apenas quando CSS impossível via Tailwind (pseudo-elements, range thumb).
- Nunca usar `!important` sem justificativa.

## Estrutura de Arquivos
- Componentes de tela: `src/components/{Nome}Screen.vue`
- Componentes de seção: `src/components/{Nome}Section.vue`
- Componentes compartilhados: `src/components/shared/{Nome}.vue`
- Utils: `src/utils/{nome}.ts`
- Testes: `src/{pasta}/__tests__/{nome}.spec.ts`

## Imports
- Imports absolutos com alias `@/` quando configurado.
- Agrupar: Vue imports → DS imports → local imports → utils.
- Não deixar imports não utilizados.

## Performance
- Usar `v-show` para toggle frequente (mantém no DOM).
- Usar `v-if` para condicional raro (remove do DOM).
- Lazy load de telas com `defineAsyncComponent` quando aplicável.
- Não criar watchers desnecessários — preferir `computed`.
