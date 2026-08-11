---
applyTo: "src/**/*.vue"
description: >
  Anatomia obrigatória de componentes: estados completos, tamanhos mínimos, estrutura interna,
  microcopy e padrões de feedback. Complementa ux-principles com especificações por tipo de componente.
---

# Component Anatomy — Anatomia Obrigatória de Componentes

## Princípio

**Um componente incompleto é um bug de UX.**
Estados faltando = usuário confuso. Feedback ausente = usuário em dúvida. Label faltando = usuário perdido.

Este documento define a anatomia mínima aceitável de cada tipo de componente. Todo componente entregue DEVE passar no checklist de sua categoria.

---

## COMPONENTE: Botão

### Anatomia Visual
```
[  ícone? + rótulo + ícone?  ]
   └── min 48px height ──┘
   └── min 100px width ──┘
```

### Estados Obrigatórios
```vue
<!-- Implementação de referência -->
<button
  :disabled="isLoading || isDisabled"
  :aria-busy="isLoading"
  :aria-label="iconOnly ? label : undefined"
  class="
    btn-base
    hover:btn-hover      /* escurecer 10% ou translateY(-1px) */
    focus-visible:ring-2 /* focus ring para teclado */
    active:scale-[0.97]  /* feedback de clique */
    disabled:opacity-40  /* desabilitado */
    disabled:cursor-not-allowed
  "
>
  <svg v-if="isLoading" class="animate-spin h-4 w-4" aria-hidden="true" />
  <span v-if="isLoading">{{ loadingLabel ?? 'Aguarde...' }}</span>
  <span v-else>{{ label }}</span>
</button>
```

### Checklist de Entrega
- [ ] `idle` → cor base, cursor:pointer
- [ ] `hover` → 10-15% mais escuro OU elevação sutil
- [ ] `focus` → ring 2px offset (WCAG obrigatório)
- [ ] `active` → scale(0.97) ou sem elevação
- [ ] `loading` → spinner + texto + `disabled`
- [ ] `disabled` → `opacity-40`, `cursor-not-allowed`, `aria-disabled`
- [ ] Mínimo `min-h-[48px]` (desktop) / `min-h-[56px]` (mobile primário)
- [ ] Ícones têm `aria-hidden="true"`
- [ ] Botão icon-only tem `aria-label`

### Anti-patterns de Botão
```
❌ Botão primary com mesma cor que botão secondary
❌ Loading state sem desabilitar o botão (permite double-submit)
❌ Botão desabilitado sem feedback visual de por que está desabilitado
❌ Texto do botão que não comunica a ação ("Clique aqui", "OK")
❌ Botão de ação destrutiva sem cor ou ícone de alerta
```

---

## COMPONENTE: Campo de Texto / Input

### Anatomia Visual
```
[Label *]                 ← 14px medium, cor #242424
[____________________]    ← borda, 48px height, padding 12px
[ Texto de ajuda ]        ← 12px, cor #777777 (opcional)
[ ⚠ Mensagem de erro ]    ← 12px, cor #dc3545 (condicional)
```

### Estados Obrigatórios
```vue
<div class="flex flex-col gap-1.5">
  <!-- Label sempre visível, mesmo com placeholder -->
  <label
    :for="id"
    class="text-sm font-medium text-[#242424]"
  >
    {{ label }}
    <span v-if="required" class="text-[#dc3545] ml-0.5" aria-label="obrigatório">*</span>
  </label>

  <input
    :id="id"
    v-model="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :aria-invalid="!!error"
    :aria-describedby="[error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ')"
    class="
      h-12 px-3 rounded border
      border-[#e6e6e6]          /* idle */
      focus:border-[#00d8d8]    /* focus */
      focus:outline-none
      focus:ring-2
      focus:ring-[#00d8d8]/20
      placeholder:text-[#b9b9b9]
      disabled:bg-[#e6e6e6]     /* disabled */
      disabled:cursor-not-allowed
      disabled:text-[#777777]
      read-only:bg-[#f5f5f5]
      transition-colors duration-100
    "
    :class="{
      'border-[#dc3545] focus:border-[#dc3545] focus:ring-[#dc3545]/20': !!error,
      'border-[#10b981] focus:border-[#10b981]': isValid && modelValue
    }"
    @blur="$emit('blur', $event)"
  />

  <!-- Hint text -->
  <p v-if="hint && !error" :id="`${id}-hint`" class="text-xs text-[#777777]">
    {{ hint }}
  </p>

  <!-- Erro inline -->
  <p
    v-if="error"
    :id="`${id}-error`"
    role="alert"
    class="text-xs text-[#dc3545] flex items-center gap-1"
  >
    <svg class="w-3 h-3 shrink-0" aria-hidden="true"><!-- ícone de erro --></svg>
    {{ error }}
  </p>
</div>
```

### Checklist de Entrega
- [ ] `empty` → placeholder visível, borda padrão
- [ ] `focus` → borda primary, ring sutil
- [ ] `filled` → valor visível, borda padrão
- [ ] `error` → borda vermelha, ícone de erro, mensagem abaixo
- [ ] `valid` → borda verde, ícone de check (se fluxo exige confirmação)
- [ ] `disabled` → bg cinza, cursor:not-allowed
- [ ] `readonly` → bg levemente diferente, sem cursor de edição
- [ ] Label sempre visível (NUNCA usar placeholder como único label)
- [ ] `aria-invalid`, `aria-describedby` presentes quando há erro
- [ ] Mensagem de erro com `role="alert"`

### Anti-patterns de Input
```
❌ Placeholder como substituto de label (desaparece ao digitar)
❌ Mensagem de erro sem ícone (depende só de cor)
❌ Validação no keystroke (mostra erro enquanto usuário ainda digita)
❌ Campo sem máscara para dados com formato conhecido (CPF, data, moeda)
❌ Input sem height mínimo (deve ter pelo menos 48px)
❌ Erro de servidor misturado com erro de validação (mensagens diferentes)
```

---

## COMPONENTE: Select / Dropdown

### Anatomia Visual
```
[Label]
[  Selecione...  ▾  ]    ← trigger, 48px height
[ Opção 1           ]
[ Opção 2 ✓         ]    ← opção selecionada com ícone
[ Opção 3           ]
```

### Checklist de Entrega
- [ ] `closed/default` → seta ▾ visível
- [ ] `focused` → borda primary, seta ▴ (open)
- [ ] `open` → lista visível, item com hover destacado
- [ ] `selected` → valor exibido no trigger, seta ▾
- [ ] `error` → borda vermelha, mensagem abaixo
- [ ] `disabled` → opacity-40, cursor:not-allowed
- [ ] Opção selecionada com ícone de check dentro da lista
- [ ] Lista com scroll quando >7 opções
- [ ] Acessível por teclado (arrows + Enter)
- [ ] `aria-expanded`, `aria-haspopup="listbox"` no trigger

### Anti-patterns de Select
```
❌ Select nativo estilizado por cima (comportamento inconsistente)
❌ Lista que sai do viewport sem scroll
❌ Opção selecionada sem indicação visual dentro da lista
❌ Placeholder como label (sumir ao selecionar deixa contexto sem label)
```

---

## COMPONENTE: Modal / Dialog

### Anatomia Visual
```
┌─────────────────────────────┐
│ Título do Modal         [×] │  ← header, fechar sempre visível
├─────────────────────────────┤
│                             │
│  Conteúdo principal         │  ← body com scroll se necessário
│                             │
├─────────────────────────────┤
│ [Cancelar]  [Ação Primária] │  ← footer, ações à direita
└─────────────────────────────┘
```

### Regras Obrigatórias de Modal
```vue
<dialog
  :open="isOpen"
  aria-modal="true"
  :aria-labelledby="`${id}-title`"
  :aria-describedby="`${id}-desc`"
  @keydown.esc="close"
  ref="dialogRef"
>
  <header>
    <h2 :id="`${id}-title`">{{ title }}</h2>
    <button @click="close" aria-label="Fechar dialog">×</button>
  </header>
  <div :id="`${id}-desc`">
    <slot />
  </div>
  <footer>
    <button class="btn-secondary" @click="close">Cancelar</button>
    <button class="btn-primary" @click="confirm">{{ confirmLabel }}</button>
  </footer>
</dialog>
```

### Checklist de Entrega
- [ ] Focus trap dentro do modal (Tab não sai do modal)
- [ ] Fechar com ESC
- [ ] Fechar clicando no backdrop (se não destrutivo)
- [ ] Focus vai para o modal ao abrir
- [ ] Focus retorna ao elemento trigger ao fechar
- [ ] Scroll apenas dentro do body (não mover página por baixo)
- [ ] Botão de fechar sempre visível
- [ ] `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- [ ] Ações: Cancelar esquerda, Confirmar direita
- [ ] Transição de entrada/saída (scale + fade, 300ms)

### Anti-patterns de Modal
```
❌ Modal sem botão de fechar visível
❌ ESC não fecha o modal
❌ Focus não vai para o modal ao abrir (usuário de teclado perdido)
❌ Background scrollável enquanto modal está aberto
❌ Cancelar à direita, Confirmar à esquerda
❌ Modal sem título acessível (aria-labelledby)
❌ Modal aberto por padrão (autoplay é agressivo)
```

---

## COMPONENTE: Notificação / Toast

### Anatomia Visual
```
┌────────────────────────────────────┐
│ ● [Ícone] Título breve         [×] │
│         Texto de suporte           │
│         [Ação opcional]            │
└────────────────────────────────────┘
```

### Tipos e Comportamento

| Tipo | Borda/Ícone | Auto-dismiss | role |
|------|-------------|--------------|------|
| `success` | `#10b981` | 5s | `status` |
| `error` | `#dc3545` | Nunca (persistente) | `alert` |
| `warning` | `#f59e0b` | 8s | `status` |
| `info` | `#3b82f6` | 5s | `status` |

### Checklist de Entrega
- [ ] `role="alert"` para erros, `role="status"` para os demais
- [ ] Auto-dismiss com timer visual (progress bar ou countdown)
- [ ] Botão de fechar acessível por teclado
- [ ] Ícone + cor + texto (nunca só cor)
- [ ] Máximo 3 toasts simultaneamente
- [ ] Posição padrão: canto superior direito (ou inferior em mobile)
- [ ] Não bloquear conteúdo principal (position: fixed, z-index alto)
- [ ] Anunciar via `aria-live="polite"` (success/info) ou `aria-live="assertive"` (error)

### Anti-patterns de Toast
```
❌ Toast de erro que desaparece antes de ser lido
❌ Toast sem ícone (só cor — daltônicos não percebem)
❌ Empilhar >3 toasts (ruído, confusão)
❌ Toast que cobre CTA principal da tela
❌ Toast de erro sem link para correção ou retry
```

---

## COMPONENTE: Empty State

### Anatomia Visual
```
         [Ilustração/Ícone]
         
         Título explicativo
         
    Texto descritivo em 1-2 linhas
    explicando o por quê e o que fazer
    
         [Ação Principal]
```

### Tipos de Empty State
| Contexto | Ícone | Título | Ação |
|----------|-------|--------|------|
| Lista vazia inicial | Pasta/Caixa | "Nenhum item cadastrado" | "Criar primeiro item" |
| Busca sem resultado | Lupa | "Nenhum resultado para '{termo}'" | "Limpar busca" |
| Filtro sem match | Filtro | "Nenhum item corresponde aos filtros" | "Limpar filtros" |
| Erro de carregamento | Aviso | "Não foi possível carregar" | "Tentar novamente" |

### Checklist de Entrega
- [ ] Ícone/ilustração adequado ao contexto
- [ ] Título que explica o estado (não apenas "Vazio")
- [ ] Descrição com próxima ação sugerida
- [ ] CTA para saída do estado vazio
- [ ] Não mostrar enquanto loading (conditonal `v-if="!isLoading && items.length === 0"`)

### Anti-patterns de Empty State
```
❌ Área em branco sem explicação
❌ "Nenhum resultado." sem sugestão de próximo passo
❌ Empty state idêntico para todos os contextos (genérico demais)
❌ CTA que leva para fora do fluxo do usuário
❌ Empty state exibido durante loading
```

---

## COMPONENTE: Skeleton Screen

### Quando usar vs. Spinner

| Situação | Usar |
|----------|------|
| Layout previsível (cards, lista, formulário) | Skeleton |
| Ação pontual em botão | Spinner inline |
| Carregamento de modal | Spinner centralizado |
| Carregamento de página inteira | Skeleton full |

### Implementação
```vue
<!-- ✅ Skeleton que replica o layout real -->
<div v-if="isLoading" class="animate-pulse" role="status" aria-label="Carregando conteúdo">
  <!-- Card skeleton -->
  <div class="bg-[#e6e6e6] rounded h-6 w-3/4 mb-3" />    <!-- título -->
  <div class="bg-[#e6e6e6] rounded h-4 w-full mb-2" />    <!-- linha 1 -->
  <div class="bg-[#e6e6e6] rounded h-4 w-5/6 mb-2" />     <!-- linha 2 -->
  <div class="bg-[#e6e6e6] rounded h-10 w-32 mt-4" />     <!-- botão -->
</div>
<div v-else>
  <!-- conteúdo real -->
</div>
```

### Checklist de Entrega
- [ ] Skeleton replica proporções do layout real
- [ ] `role="status"` + `aria-label` descritivo
- [ ] Transição suave skeleton → conteúdo (fade, 200ms)
- [ ] `animate-pulse` (não animate-bounce ou spin)
- [ ] Não usar skeleton para ações instantâneas (<100ms)

---

## COMPONENTE: Progress Indicator (Stepper)

### Quando é obrigatório
Todo fluxo com **≥3 etapas** DEVE ter um progress indicator visível.

### Anatomia
```
[1: Dados] ──── [2: Endereço] ──── [3: Confirmar]
  ✓ Done          ● Active          ○ Pending
```

### Checklist de Entrega
- [ ] Etapa atual visualmente destacada
- [ ] Etapas completas com check visual
- [ ] Etapas futuras com visual "pending" (não clicável sem validação)
- [ ] Texto "Etapa X de Y" para screen readers
- [ ] Navegação de volta disponível (exceto se dados serão perdidos)
- [ ] Confirmação ao sair do fluxo no meio

---

## COMPONENTE: Tabela de Dados

### Anatomia
```
[Busca]                    [Filtros] [Ações em massa]
┌──────┬──────────┬────────┬────────┬──────┐
│ □ Sel│ Nome ↑↓  │ Status │ Data   │ Ação │  ← header com sort
├──────┼──────────┼────────┼────────┼──────┤
│ □    │ Item A   │ Ativo  │ 01/06  │ ...  │  ← linha
│ ■    │ Item B   │ Inativo│ 02/06  │ ...  │  ← selecionada
└──────┴──────────┴────────┴────────┴──────┘
                          [1 2 3 ... >]         ← paginação
```

### Checklist de Entrega
- [ ] Cabeçalho fixo ao scrollar (se >10 linhas)
- [ ] Ordenação por coluna com ícone de direção
- [ ] Estado de loading (skeleton de linhas)
- [ ] Empty state quando sem dados
- [ ] Responsivo: scroll horizontal OU colunas adaptáveis
- [ ] Seleção múltipla com checkbox na primeira coluna
- [ ] Ações de linha acessíveis por teclado
- [ ] Paginação com informação "Mostrando X–Y de Z resultados"
- [ ] `<table>` semântica com `<th scope="col">` corretos
- [ ] `aria-sort` nas colunas ordenáveis

---

## CHECKLIST GLOBAL DE COMPONENTE

Antes de qualquer entrega de componente, verificar:

```
ANATOMIA
  [ ] Todos os estados do tipo implementados?
  [ ] Mínimos de tamanho respeitados (44px touch targets)?
  [ ] Label visível e associada (for/id ou aria-label)?

FEEDBACK
  [ ] Feedback visual imediato a ações (<100ms)?
  [ ] Estados de loading/error/success implementados?
  [ ] Mensagens de erro específicas com ação de correção?

ACESSIBILIDADE
  [ ] Focus ring visível?
  [ ] Navegável por teclado?
  [ ] ARIA roles/attributes corretos?
  [ ] Cor não é único comunicador?

CÓDIGO
  [ ] `v-model` funcional (não apenas aparência)?
  [ ] Emite eventos corretos (`@update:modelValue`, `@blur`)?
  [ ] Props tipadas com TypeScript?
  [ ] Não recria componente que já existe no DS?
```
