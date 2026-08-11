---
applyTo: "src/**/*.{ts,vue}"
description: "Padrões de state management (Pinia/composables) e chamadas de API (fetch, interceptors, error handling, retry)."
---

# State Management e API — Padrões Obrigatórios

## Princípio
State management e chamadas de API devem ser **previsíveis, tipados e testáveis**. Separar responsabilidades: componente (UI) → store/composable (lógica) → serviço (HTTP).

---

## 1. State Management — Quando Usar O Quê

| Situação | Solução | Exemplo |
|----------|---------|---------|
| Estado local de 1 componente | `ref()` / `reactive()` | form fields, toggle, modal open |
| Estado compartilhado entre 2-3 componentes próximos | `provide/inject` ou props/emits | stepper + children |
| Estado global da aplicação | **Pinia store** | user data, auth, carrinho, config |
| Lógica reutilizável sem estado global | **Composable** (`use*`) | useToast, useOnlineStatus, useDebounce |
| Cache de dados do servidor | Composable com cache | useFetch com stale-while-revalidate |

### Regras
- NÃO usar Pinia para estado que pertence a 1 componente só.
- NÃO usar props drilling (3+ níveis) — usar Pinia ou provide/inject.
- Stores DEVEM ser tipadas (TypeScript strict).
- Stores DEVEM ter actions para mutações (não mutar state diretamente fora da store).

---

## 2. Pinia — Estrutura de Store

### Arquivo: `src/stores/{domínio}.ts`

```ts
// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '@/services/user.service'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const fullName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
  )

  // Actions
  async function fetchUser() {
    isLoading.value = true
    error.value = null
    try {
      user.value = await userService.getMe()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar usuário'
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
  }

  return { user, isLoading, error, isAuthenticated, fullName, fetchUser, logout }
})
```

### Regras de store
- Usar **setup syntax** (function-based) — mais flexível e tipável.
- Expor `isLoading` e `error` para que o componente renderize estados corretamente.
- Actions async DEVEM ter try/catch/finally.
- Nomear stores como `use{Domínio}Store`.
- 1 store por domínio (não 1 store gigante para tudo).

---

## 3. Composables — Lógica Reutilizável

### Arquivo: `src/composables/use{Nome}.ts`

```ts
// src/composables/useDebounce.ts
import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(source: Ref<T>, delay = 300) {
  const debounced = ref(source.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout>

  watch(source, (val) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => { debounced.value = val }, delay)
  })

  return debounced
}
```

### Regras
- Composables NÃO devem acessar DOM diretamente (usar refs de template se necessário).
- Composables DEVEM ser puros quando possível (receber deps via parâmetro).
- Composables DEVEM ter testes unitários.
- Prefixo `use` obrigatório.

---

## 4. Serviços de API — Camada HTTP

### Estrutura: `src/services/{domínio}.service.ts`

```ts
// src/services/api.ts — Client HTTP base
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
  timeout?: number
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown
  ) {
    super(`HTTP ${status}: ${statusText}`)
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, timeout = 30000, ...fetchOptions } = options

  // Query params
  const url = new URL(endpoint, BASE_URL)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  // Timeout via AbortController
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new ApiError(response.status, response.statusText, data)
    }

    return await response.json() as T
  } finally {
    clearTimeout(timeoutId)
  }
}

export const api = {
  get: <T>(url: string, opts?: RequestOptions) => request<T>(url, { ...opts, method: 'GET' }),
  post: <T>(url: string, body: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown, opts?: RequestOptions) =>
    request<T>(url, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string, opts?: RequestOptions) => request<T>(url, { ...opts, method: 'DELETE' }),
}
```

### Serviço de domínio
```ts
// src/services/proposal.service.ts
import { api } from './api'
import type { Proposal, CreateProposalDTO } from '@/types/proposal'

export const proposalService = {
  getById: (id: string) => api.get<Proposal>(`/proposals/${id}`),
  create: (data: CreateProposalDTO) => api.post<Proposal>('/proposals', data),
  list: (params?: Record<string, string>) => api.get<Proposal[]>('/proposals', { params }),
}
```

### Regras de API
- **Nunca** fazer fetch diretamente no componente — sempre via service.
- Services retornam dados tipados (generics).
- Timeout obrigatório (default 30s, configurável).
- Erros são tipados (`ApiError` com status, message, data).
- Componente NÃO precisa saber detalhes HTTP — store/composable abstrai.

---

## 5. Error Handling HTTP — Mapeamento para UX

```ts
// src/utils/errorMessages.ts
const ERROR_MAP: Record<number, string> = {
  400: 'Dados inválidos. Verifique os campos e tente novamente.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Esta operação já foi realizada.',
  422: 'Dados não puderam ser processados. Verifique os campos.',
  429: 'Muitas tentativas. Aguarde um momento.',
  500: 'Erro interno. Tente novamente em alguns instantes.',
  503: 'Serviço temporariamente indisponível.',
}

export function getErrorMessage(status: number, fallback?: string): string {
  return ERROR_MAP[status] || fallback || 'Erro inesperado. Tente novamente.'
}
```

---

## 6. Retry Pattern

```ts
// src/utils/retry.ts
interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: 'linear' | 'exponential'
  retryOn?: (error: unknown) => boolean
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 'exponential', retryOn } = options

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const shouldRetry = retryOn ? retryOn(error) : true
      if (attempt === maxAttempts || !shouldRetry) throw error

      const waitTime = backoff === 'exponential'
        ? delay * Math.pow(2, attempt - 1)
        : delay * attempt
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  throw new Error('Retry exhausted') // unreachable, satisfies TS
}
```

### Quando usar retry
- Erros de rede (timeout, offline).
- HTTP 500, 502, 503, 504 (server transient errors).
- **NÃO** fazer retry em: 400, 401, 403, 404, 422 (erros de cliente — não vão mudar com retry).

---

## 7. Estrutura de Pastas Final

```
src/
  services/
    api.ts                    — Client HTTP base (fetch wrapper)
    proposal.service.ts       — Serviço de domínio
    user.service.ts
  stores/
    user.ts                   — Pinia store
    proposal.ts
  composables/
    useToast.ts               — Lógica reutilizável
    useOnlineStatus.ts
    useDebounce.ts
  types/
    user.ts                   — Interfaces/types compartilhados
    proposal.ts
    api.ts                    — ApiError, RequestOptions
  utils/
    errorMessages.ts          — Mapeamento HTTP → UX
    retry.ts                  — Retry com backoff
    masks.ts                  — Formatação
    validators.ts             — Validação
```

---

## Anti-Patterns (NUNCA fazer)

❌ `fetch()` direto no componente Vue
❌ Store Pinia para estado local de 1 componente
❌ Props drilling 3+ níveis sem justificativa
❌ Action async sem try/catch/finally
❌ API sem timeout (request pode ficar pendurado para sempre)
❌ Retry em erros 4xx (client errors)
❌ Expor mensagens técnicas de erro ao usuário
❌ Tipar response como `any`
❌ Múltiplas stores acessando o mesmo domínio
❌ Composable que muta DOM diretamente
