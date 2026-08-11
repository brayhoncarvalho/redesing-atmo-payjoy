---
applyTo: "src/**/*.{vue,ts}"
description: >
  Resiliência de formulários: autosave com debounce, draft recovery, persistência multi-step,
  aviso de mudanças não salvas (beforeunload + route guard), indicador de status de salvamento.
  Protege contra perda de dados. Complementa form-patterns (máscaras/validação), ux-principles
  (validation timing) e state-api-patterns (persistência).
---

# Form Resilience — Proteção contra Perda de Dados

## Princípio

**Perder dados que o usuário digitou é a quebra de confiança mais grave de um formulário.**
Em fluxos longos (proposta, cadastro, onboarding), o usuário investe tempo preenchendo. Um refresh acidental, uma queda de rede, um clique no back, ou uma sessão expirada **nunca** podem apagar esse esforço. As regras de máscara e validação já estão em `form-patterns.instructions.md`; este documento garante que o dado **sobreviva**.

> A regra de ouro do `ui-states.instructions.md` ("nunca perder dados do formulário por falha de rede") elevada a uma estratégia completa: autosave, recovery e aviso de saída.

---

## REGRA 1 — Aviso de Mudanças Não Salvas

Antes de o usuário sair (fechar aba, voltar, navegar) com alterações pendentes, avisar.

```ts
// src/composables/useUnsavedChanges.ts
import { ref, watch, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

export function useUnsavedChanges(isDirty: () => boolean) {
  // 1. Fechar/recarregar a aba (browser nativo)
  function beforeUnload(e: BeforeUnloadEvent) {
    if (isDirty()) { e.preventDefault(); e.returnValue = '' }
  }
  window.addEventListener('beforeunload', beforeUnload)
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))

  // 2. Navegação interna (Vue Router) — diálogo customizado
  onBeforeRouteLeave((to, from, next) => {
    if (!isDirty()) return next()
    const confirmar = window.confirm(
      'Você tem alterações não salvas. Deseja sair mesmo assim? As alterações serão perdidas.'
    )
    next(confirmar)
  })
}
```

### Regras
- `beforeunload` é o último recurso (o browser controla o texto). O guard de rota permite UX melhor (dialog próprio).
- "Dirty" = formulário foi modificado **e** ainda não foi salvo/enviado.
- **Não** avisar se já foi salvo (autosave bem-sucedido limpa o estado dirty).
- O aviso de saída é o fallback; o autosave (Regra 2) é a proteção primária.

**BLOCKER:** Fluxo longo (>3 campos ou multi-step) que permite sair/recarregar perdendo dados sem aviso nem persistência.

---

## REGRA 2 — Autosave com Debounce

Salvar rascunho automaticamente enquanto o usuário digita, sem que ele precise pensar nisso.

```ts
// src/composables/useAutosave.ts
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutosave<T>(
  source: () => T,
  persist: (data: T) => Promise<void>,
  { delay = 1500 } = {}
) {
  const status = ref<SaveStatus>('idle')
  const lastSavedAt = ref<Date | null>(null)

  const save = useDebounceFn(async () => {
    status.value = 'saving'
    try {
      await persist(source())
      status.value = 'saved'
      lastSavedAt.value = new Date()
    } catch {
      status.value = 'error'   // mantém o dado local; tentará de novo na próxima mudança
    }
  }, delay)

  // dispara autosave a cada mudança (debounced)
  watch(source, () => { status.value = 'idle'; save() }, { deep: true })

  return { status, lastSavedAt, saveNow: save }
}
```

### Onde persistir o rascunho
| Destino | Quando | Cuidado |
|---------|--------|---------|
| **localStorage** | Rascunho client-side, recuperação após refresh | **NUNCA dados sensíveis** — ver §Privacidade |
| **Backend (draft endpoint)** | Persistência entre dispositivos, formulários longos | Idempotente; rascunho ≠ submissão |
| **sessionStorage** | Só durante a sessão atual | Some ao fechar a aba |

### Regras de autosave
- Debounce de ~1–2s (não a cada keystroke — sobrecarrega e gera ruído).
- Autosave **nunca** dispara validação bloqueante — salva o estado parcial como está.
- Falha de autosave **não** perde o dado local — mantém e re-tenta na próxima mudança.
- Rascunho salvo no backend é **draft**, não submissão — só o submit explícito finaliza.

---

## REGRA 3 — Indicador de Status de Salvamento

O usuário precisa confiar que o dado está seguro (visibilidade do estado — Nielsen).

```vue
<script setup lang="ts">
import { useAutosave } from '@/composables/useAutosave'
const { status, lastSavedAt } = useAutosave(() => form, persistDraft)
</script>

<template>
  <div class="text-caption text-muted flex items-center gap-1.5" aria-live="polite">
    <template v-if="status === 'saving'">
      <Spinner class="w-3 h-3" aria-hidden="true" /> Salvando…
    </template>
    <template v-else-if="status === 'saved'">
      <Icon name="check" class="w-3 h-3 text-success" aria-hidden="true" />
      Salvo {{ lastSavedAt ? formatRelative(lastSavedAt) : '' }}
    </template>
    <template v-else-if="status === 'error'">
      <Icon name="alert" class="w-3 h-3 text-danger" aria-hidden="true" />
      Não foi possível salvar — suas alterações estão guardadas localmente
    </template>
  </div>
</template>
```

### Regras
- Status anunciado via `aria-live="polite"` (não interromper).
- Estado de erro tranquiliza: deixa claro que o dado **não foi perdido** (está local).
- Nunca um spinner permanente — o status resolve (saved/error).

---

## REGRA 4 — Draft Recovery

Ao reabrir o formulário, detectar rascunho e oferecer recuperação.

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
const draft = ref<FormData | null>(null)
const showRecovery = ref(false)

onMounted(() => {
  const saved = loadDraft()   // localStorage ou backend
  if (saved && !isEmpty(saved)) { draft.value = saved; showRecovery.value = true }
})

function restore() { Object.assign(form, draft.value!); showRecovery.value = false }
function discard() { clearDraft(); showRecovery.value = false }
</script>

<template>
  <div v-if="showRecovery" role="status"
       class="bg-surface-subtle border border-border rounded-token-md p-4 flex items-center justify-between gap-4">
    <p class="text-body text-default">
      Encontramos um rascunho não finalizado{{ draft?.savedAt ? ` de ${formatRelative(draft.savedAt)}` : '' }}.
      Deseja continuar de onde parou?
    </p>
    <div class="flex gap-2 shrink-0">
      <button class="btn-secondary min-h-[44px]" @click="discard">Descartar</button>
      <button class="btn-primary min-h-[44px]" @click="restore">Recuperar rascunho</button>
    </div>
  </div>
</template>
```

### Regras
- Oferecer recuperação, **nunca** restaurar silenciosamente (usuário pode querer começar limpo).
- Mostrar quando o rascunho foi salvo ("de 2 horas atrás") para dar contexto.
- Limpar o rascunho após submissão bem-sucedida (não oferecer recovery de algo já enviado).

---

## REGRA 5 — Persistência Multi-Step

Em wizard/stepper (ver `ux-principles.instructions.md` — progressive disclosure), cada etapa concluída persiste.

```
- Estado do wizard inteiro (todas as etapas) salvo como um draft único.
- Voltar a uma etapa anterior mantém os dados já preenchidos das etapas seguintes.
- Sair no meio e voltar: retoma na etapa em que parou, com tudo preenchido.
- A etapa atual pode ir na URL (?step=2) para deep-link/refresh (ver navigation-ia).
```

**BLOCKER:** Wizard que perde dados das etapas anteriores ao voltar, ou que reinicia do zero ao recarregar.

---

## Privacidade — Rascunhos com Dados Sensíveis (LGPD)

Produto de pagamentos: rascunhos podem conter CPF, valores, dados pessoais.

```
❌ NUNCA persistir em localStorage: CPF/CNPJ completo, cartão, senha, token, valor de saldo
✅ localStorage só para campos não sensíveis (nome de rascunho, etapa, preferências)
✅ Dados sensíveis → draft no backend (criptografado, sob a sessão autenticada)
✅ Limpar rascunhos locais no logout
✅ Rascunho no backend respeita retenção/expiração (não guardar indefinidamente)
```

Alinhado com `security.instructions.md` e `observability.instructions.md` (§Privacidade).

**BLOCKER:** Persistir dado financeiro/PII em localStorage como rascunho.

---

## Checklist de Form Resilience

```
PROTEÇÃO DE SAÍDA
  [ ] beforeunload + route guard avisam sobre mudanças não salvas?
  [ ] Estado "dirty" limpa após salvar com sucesso?

AUTOSAVE
  [ ] Autosave com debounce (~1-2s, não keystroke)?
  [ ] Falha de autosave mantém o dado local e re-tenta?
  [ ] Indicador de status (salvando/salvo/erro) com aria-live?

RECOVERY
  [ ] Detecta rascunho ao reabrir e oferece recuperação?
  [ ] Recuperação é opt-in (não restaura silenciosamente)?
  [ ] Rascunho limpo após submissão?

MULTI-STEP
  [ ] Voltar mantém dados das etapas seguintes?
  [ ] Refresh retoma na etapa correta com dados preenchidos?

PRIVACIDADE (BLOCKER)
  [ ] Nenhum dado sensível/PII em localStorage?
  [ ] Rascunhos locais limpos no logout?
```

## Anti-Patterns de Form Resilience

```
❌ Fluxo longo sem autosave nem aviso de saída (perda de dados ao refresh/back)
❌ Wizard que reinicia do zero ao recarregar ou perde dados ao voltar
❌ Autosave a cada keystroke (sobrecarga, ruído)
❌ Falha de autosave descartando o dado local
❌ Restaurar rascunho silenciosamente sem perguntar
❌ Oferecer recovery de formulário já enviado
❌ Persistir CPF/cartão/valor em localStorage (violação LGPD)
❌ Limpar campos após erro de submit (ver ui-states — nunca perder dados)
❌ Spinner de "salvando" permanente sem resolver
```
