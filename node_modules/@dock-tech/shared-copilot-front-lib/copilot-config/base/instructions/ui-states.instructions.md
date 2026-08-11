---
applyTo: "src/**/*.vue"
description: "Padrões obrigatórios para estados de UI: loading, error, empty state, feedback pós-ação e notificações."
---

# Estados de UI — Padrões Obrigatórios

## Princípio
**Toda tela e componente que depende de dados assíncronos DEVE ter 3 estados visuais:** loading, sucesso (conteúdo) e erro. Telas com listas DEVEM ter também empty state.

---

## 1. Loading States

### Regras
- Nunca mostrar tela em branco enquanto dados carregam.
- Usar **skeleton screens** para conteúdo que tem layout previsível (cards, listas, formulários).
- Usar **spinner** apenas para ações pontuais (submit de botão, carregamento de modal).
- Loading deve respeitar a hierarquia visual da tela (skeleton simula o layout final).

### Skeleton — Implementação
```vue
<template>
  <div v-if="isLoading" class="animate-pulse space-y-4" role="status" aria-label="Carregando conteúdo">
    <div class="h-6 bg-[#e6e6e6] rounded w-3/4"></div>
    <div class="h-4 bg-[#e6e6e6] rounded w-full"></div>
    <div class="h-4 bg-[#e6e6e6] rounded w-5/6"></div>
  </div>
  <div v-else>
    <!-- conteúdo real -->
  </div>
</template>
```

### Regras de acessibilidade do loading
- Skeleton/spinner DEVE ter `role="status"` e `aria-label` descritivo.
- Usar `aria-busy="true"` no container pai durante carregamento.
- Quando o conteúdo carregar, anunciar via `aria-live="polite"` se relevante.

### Botão com loading
```vue
<button
  :disabled="isSubmitting"
  :aria-busy="isSubmitting"
  @click="handleSubmit"
>
  <span v-if="isSubmitting" class="inline-flex items-center gap-2">
    <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">...</svg>
    Enviando...
  </span>
  <span v-else>Enviar</span>
</button>
```

---

## 2. Error States

### Tipos de erro

| Tipo | Quando | Apresentação |
|------|--------|--------------|
| Erro de campo (validação) | Blur / submit | Inline abaixo do campo, vermelho `#dc3545` |
| Erro de requisição (API) | Falha HTTP | Banner/card de erro na tela, com ação de retry |
| Erro fatal (500, timeout) | Página inteira falhou | Tela de erro dedicada com opções de recuperação |
| Erro de rede (offline) | Sem conexão | Banner persistente topo, com detecção automática |

### Erro de requisição — Implementação
```vue
<div
  v-if="error"
  role="alert"
  class="bg-[#fef2f2] border border-[#dc3545] rounded p-4 flex items-start gap-3"
>
  <svg aria-hidden="true" class="w-5 h-5 text-[#dc3545] shrink-0">...</svg>
  <div>
    <p class="font-medium text-[#dc3545]">Não foi possível carregar os dados</p>
    <p class="text-sm text-[#5c5c5c] mt-1">{{ error.message }}</p>
    <button
      class="mt-2 text-sm font-medium text-[#00d8d8] underline"
      @click="retry"
    >
      Tentar novamente
    </button>
  </div>
</div>
```

### Regras de erro
- Erro DEVE ter `role="alert"` para ser anunciado por screen readers.
- Sempre oferecer ação de recuperação (retry, voltar, contato).
- Nunca mostrar mensagens técnicas (stack trace, HTTP status code cru) ao usuário.
- Mapear erros da API para mensagens amigáveis em português.
- Mensagem de erro NÃO pode depender apenas de cor — usar ícone + texto.

### Erro fatal — Tela dedicada
```vue
<template>
  <main class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
    <svg aria-hidden="true" class="w-16 h-16 text-[#dc3545] mb-4">...</svg>
    <h1 class="text-xl font-bold text-[#242424]">Algo deu errado</h1>
    <p class="text-[#5c5c5c] mt-2 max-w-sm">
      Não conseguimos processar sua solicitação. Tente novamente em alguns instantes.
    </p>
    <button class="mt-6 bg-[#00d8d8] text-white px-6 py-3 rounded font-medium" @click="reload">
      Recarregar página
    </button>
  </main>
</template>
```

---

## 3. Empty States

### Quando usar
- Lista sem itens.
- Busca sem resultados.
- Tela acessada pela primeira vez sem dados.
- Filtro aplicado sem match.

### Regras
- Nunca mostrar área em branco sem explicação.
- Empty state DEVE ter: ícone/ilustração + título + descrição + ação sugerida.
- A ação sugerida deve ser o próximo passo lógico (criar item, ajustar filtro, tentar busca diferente).

### Implementação
```vue
<div v-if="items.length === 0 && !isLoading" class="flex flex-col items-center py-12 text-center">
  <svg aria-hidden="true" class="w-12 h-12 text-[#b9b9b9] mb-4">...</svg>
  <h2 class="text-lg font-medium text-[#242424]">Nenhum resultado encontrado</h2>
  <p class="text-sm text-[#5c5c5c] mt-1 max-w-xs">
    Tente ajustar os filtros ou realizar uma nova busca.
  </p>
  <button class="mt-4 text-[#00d8d8] font-medium text-sm" @click="clearFilters">
    Limpar filtros
  </button>
</div>
```

---

## 4. Feedback Pós-Ação (Notificações/Toasts)

### Quando usar
- Após submit de formulário bem-sucedido.
- Após ação irreversível (exclusão, envio).
- Após operação em background concluída.

### Regras
- Feedback de sucesso: toast/banner temporário (auto-dismiss em 5s).
- Feedback de erro: persistente até o usuário dispensar ou corrigir.
- Toast DEVE ter `role="status"` (sucesso) ou `role="alert"` (erro).
- Toast DEVE ser dismissível via botão de fechar (acessível).
- Não empilhar mais de 3 toasts simultaneamente.

### Tipos visuais

| Tipo | Cor de borda/ícone | Duração | role |
|------|-------------------|---------|------|
| Sucesso | `#00d8d8` | 5s auto-dismiss | status |
| Erro | `#dc3545` | Persistente | alert |
| Aviso | `#eeff88` + texto escuro | 8s auto-dismiss | status |
| Info | `#5c5c5c` | 5s auto-dismiss | status |

### Implementação básica (composable)
```ts
// src/composables/useToast.ts
import { ref } from 'vue'

interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function show(type: Toast['type'], message: string, duration = 5000) {
    const id = nextId++
    toasts.value.push({ id, type, message, duration })
    if (type !== 'error' && duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, show, dismiss }
}
```

---

## 5. Estados de Conexão (Offline/Online)

### Regras
- Se a aplicação depende de API, detectar status de rede.
- Mostrar banner fixo no topo quando offline.
- Ao reconectar, tentar reenviar ações pendentes (se aplicável).
- Nunca perder dados digitados pelo usuário por causa de falha de rede.

### Detecção
```ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useOnlineStatus() {
  const isOnline = ref(navigator.onLine)

  function update() { isOnline.value = navigator.onLine }

  onMounted(() => {
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
  })

  onUnmounted(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })

  return { isOnline }
}
```

---

## Checklist por Componente/Tela

Antes de considerar uma tela completa, verificar:

- [ ] Estado de loading definido (skeleton ou spinner)?
- [ ] Estado de erro com mensagem amigável + retry?
- [ ] Empty state se houver lista/busca?
- [ ] Feedback pós-ação (toast de sucesso/erro)?
- [ ] Botão de submit com estado de loading?
- [ ] Campos preservados se a requisição falhar?
- [ ] Acessibilidade dos estados (role, aria-live, aria-busy)?

---

## Anti-Patterns (NUNCA fazer)

❌ Tela em branco durante carregamento
❌ Spinner genérico para tudo (usar skeleton quando possível)
❌ Mensagem de erro técnica exposta ao usuário ("Error 500: Internal Server Error")
❌ Erro sem ação de recuperação (retry, voltar, contato)
❌ Lista vazia sem explicação
❌ Toast que desaparece rápido demais para ser lido (mínimo 4s)
❌ Feedback dependendo apenas de cor (sem ícone/texto)
❌ Perder dados do formulário após erro de rede
