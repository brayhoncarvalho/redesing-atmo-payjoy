---
applyTo: "src/**/*.{ts,vue}"
description: >
  Observabilidade front-end para produto de pagamentos: error tracking, Real User Monitoring
  (Core Web Vitals em produção), eventos de analytics/funil, error boundaries Vue,
  e privacidade (LGPD/PII). Complementa performance (budgets) e security (PII).
---

# Observabilidade Front-end

## Princípio

**Em um produto de pagamentos, o que você não mede em produção, você não sabe que está quebrado.**
Um checkout que falha para 2% dos usuários em um device específico é invisível em dev e devastador em produção. Observabilidade transforma "achamos que está bom" em "sabemos que está bom — e somos avisados em segundos quando não está".

Três pilares: **Errors** (o que quebrou), **RUM** (quão rápido/saudável está para usuários reais), **Analytics de produto** (o usuário conseguiu completar o objetivo).

---

## PILAR 1 — Error Tracking

### Setup global de captura

```ts
// src/observability/errorTracking.ts
import type { App } from 'vue'

interface ErrorContext {
  component?: string
  route?: string
  userId?: string  // pseudonimizado — ver §Privacidade
  severity: 'fatal' | 'error' | 'warning'
}

export function captureError(error: unknown, context: Partial<ErrorContext> = {}) {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    route: window.location.pathname,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...context,
  }
  // Enviar ao provider (Sentry, Datadog, etc.). NUNCA logar PII.
  sendToProvider(sanitize(payload))

  if (import.meta.env.DEV) console.error('[observability]', payload)
}

export function installErrorTracking(app: App) {
  // 1. Erros do Vue (render, lifecycle, watchers)
  app.config.errorHandler = (err, instance, info) => {
    captureError(err, {
      component: instance?.$options.name ?? 'unknown',
      severity: 'error',
    })
  }

  // 2. Erros JS não capturados
  window.addEventListener('error', (e) => {
    captureError(e.error ?? e.message, { severity: 'fatal' })
  })

  // 3. Promises rejeitadas sem catch
  window.addEventListener('unhandledrejection', (e) => {
    captureError(e.reason, { severity: 'error' })
  })
}
```

### Regras de Error Tracking
- **Toda** chamada de API com `catch` deve reportar o erro (além de mostrar UI amigável).
- Erro mostrado ao usuário (UI) ≠ erro reportado (telemetria). O usuário vê mensagem amigável; a telemetria recebe o detalhe técnico.
- Diferenciar **erro de usuário** (validação, 400) de **erro de sistema** (500, timeout, JS crash). Só alertar on-call em erros de sistema.
- Anexar contexto: rota, componente, ação que disparou — sem PII.

### Error Boundary por região da UI

Um crash em um widget não pode derrubar a tela inteira (especialmente em checkout).

```vue
<!-- src/components/ErrorBoundary.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { captureError } from '@/observability/errorTracking'

const props = defineProps<{ fallbackLabel?: string; boundaryName: string }>()
const hasError = ref(false)

onErrorCaptured((err) => {
  hasError.value = true
  captureError(err, { component: props.boundaryName, severity: 'error' })
  return false // impede propagação para cima — isola o crash
})

function retry() { hasError.value = false }
</script>

<template>
  <div v-if="hasError" role="alert" class="p-4 rounded-token-md bg-surface-subtle text-center">
    <p class="text-default font-medium">{{ fallbackLabel ?? 'Esta seção não pôde ser carregada' }}</p>
    <button class="mt-2 text-action font-medium underline min-h-[44px]" @click="retry">
      Tentar novamente
    </button>
  </div>
  <slot v-else />
</template>
```

```vue
<!-- Uso: isolar regiões críticas independentes -->
<ErrorBoundary boundary-name="simulador-emprestimo" fallback-label="O simulador está indisponível">
  <SimuladorSection />
</ErrorBoundary>
```

**BLOCKER:** Tela de pagamento/checkout sem error boundaries isolando widgets independentes.

---

## PILAR 2 — Real User Monitoring (RUM)

Mede Core Web Vitals **em produção, com usuários reais** — não só no Lighthouse local (ver targets em `performance.instructions.md`).

```ts
// src/observability/webVitals.ts
import { onCLS, onLCP, onINP, onFCP, onTTFB } from 'web-vitals'
import { sendMetric } from './provider'

export function trackWebVitals() {
  const report = (metric: { name: string; value: number; rating: string; id: string }) => {
    sendMetric({
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      route: window.location.pathname,
      // segmentar por device/conexão é o que revela problemas reais
      connection: (navigator as any).connection?.effectiveType ?? 'unknown',
    })
  }
  onLCP(report)   // Largest Contentful Paint — alvo < 2.5s
  onINP(report)   // Interaction to Next Paint — alvo < 200ms
  onCLS(report)   // Cumulative Layout Shift — alvo < 0.1
  onFCP(report)
  onTTFB(report)
}
```

### Regras de RUM
- Segmentar métricas por **rota, tipo de device e conexão** — a média esconde o p75/p95 que importa.
- Monitorar o **p75** (não a média) — é o que reflete a experiência real (alinhado com Core Web Vitals).
- Rastrear métricas de negócio críticas: tempo até o simulador ficar interativo, tempo de submit de proposta.
- INP > 200ms em qualquer fluxo crítico = investigar (interação travando).

---

## PILAR 3 — Analytics de Produto (Funil)

Mede se o usuário **conseguiu completar o objetivo** — a métrica que importa de verdade.

```ts
// src/observability/analytics.ts
type EventName =
  | 'screen_view'
  | 'simulador_iniciado'
  | 'simulador_valor_ajustado'
  | 'proposta_iniciada'
  | 'proposta_campo_erro'      // qual campo trava mais usuários?
  | 'proposta_enviada'
  | 'proposta_falhou'

interface EventProps { [key: string]: string | number | boolean }

export function track(event: EventName, props: EventProps = {}) {
  sendEvent({
    event,
    props: sanitize(props),  // sem PII
    route: window.location.pathname,
    timestamp: Date.now(),
    sessionId: getSessionId(),  // pseudônimo, não identifica pessoa
  })
}
```

### Naming Convention de eventos
```
{objeto}_{ação_no_passado}
simulador_iniciado          ✅
proposta_enviada            ✅
proposta_campo_erro         ✅

click_button                ❌ (genérico, sem valor analítico)
botaoEnviarClicado          ❌ (camelCase, inconsistente)
```

### O que rastrear (foco em funil de conversão)
- **Entrada e saída de cada etapa** de fluxo multi-step → identifica onde usuários abandonam.
- **Erros de validação por campo** → qual campo trava mais gente (ex: CPF, data).
- **Sucesso e falha de submit** → taxa de conversão real.
- **Tempo em cada etapa** → onde há fricção.

### Regra de instrumentação
- Instrumentar **pontos de decisão e abandono**, não cada clique.
- Todo fluxo crítico (simulação, proposta, pagamento) DEVE ter eventos de início, sucesso e falha.

---

## Privacidade — LGPD / PII (INVIOLÁVEL)

Produto de pagamentos lida com dados sensíveis. **Telemetria NUNCA pode vazar PII.**

```ts
// src/observability/sanitize.ts
const PII_PATTERNS = [
  /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g,         // CPF
  /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/g, // CNPJ
  /[\w.+-]+@[\w-]+\.[\w.-]+/g,             // email
  /\b\d{13,19}\b/g,                        // cartão
]

export function sanitize<T>(data: T): T {
  let json = JSON.stringify(data)
  PII_PATTERNS.forEach(p => { json = json.replace(p, '[REDACTED]') })
  return JSON.parse(json)
}
```

### Regras invioláveis de privacidade
```
❌ NUNCA enviar CPF, CNPJ, email, telefone, cartão, valor de saldo à telemetria
❌ NUNCA usar dado pessoal como userId (use pseudônimo/hash irreversível)
❌ NUNCA logar conteúdo de campos de formulário sensíveis
❌ NUNCA capturar screenshots/session replay de telas com dados financeiros sem mascaramento
✅ SEMPRE passar payloads por sanitize() antes de enviar
✅ SEMPRE respeitar opt-out de tracking (consentimento de cookies)
✅ Session replay (se usado): mascarar TODOS os inputs por default
```

---

## Bootstrap

```ts
// src/main.ts
import { installErrorTracking } from '@/observability/errorTracking'
import { trackWebVitals } from '@/observability/webVitals'

const app = createApp(App)
installErrorTracking(app)

// Só inicializa telemetria com consentimento e fora de dev
if (!import.meta.env.DEV && hasAnalyticsConsent()) {
  trackWebVitals()
}
app.mount('#app')
```

---

## Checklist de Observabilidade

```
ERROR TRACKING
  [ ] errorHandler global do Vue instalado?
  [ ] window error + unhandledrejection capturados?
  [ ] Error boundaries isolando regiões críticas (checkout)?
  [ ] Erro de sistema diferenciado de erro de usuário?
  [ ] Todo catch de API reporta à telemetria?

RUM
  [ ] Core Web Vitals reportados de produção (web-vitals)?
  [ ] Métricas segmentadas por rota/device/conexão?
  [ ] Monitorando p75 (não média)?

ANALYTICS
  [ ] Eventos de início/sucesso/falha em todo fluxo crítico?
  [ ] Erros de validação por campo instrumentados?
  [ ] Naming convention {objeto}_{ação} seguida?

PRIVACIDADE (BLOCKER se falhar)
  [ ] Payloads passam por sanitize() antes de enviar?
  [ ] Nenhuma PII (CPF/email/cartão/valor) na telemetria?
  [ ] userId é pseudônimo (não dado pessoal)?
  [ ] Tracking respeita consentimento (opt-out)?
  [ ] Session replay mascara inputs sensíveis?
```

## Anti-Patterns de Observabilidade

```
❌ Confiar só no Lighthouse local (não reflete usuários reais)
❌ Olhar a média de Web Vitals (esconde p75/p95)
❌ Engolir erro em catch sem reportar (cego em produção)
❌ Crash de widget derrubando a tela inteira (sem error boundary)
❌ Rastrear cada clique (ruído sem valor analítico)
❌ Enviar PII à telemetria (violação LGPD — BLOCKER absoluto)
❌ Alertar on-call em erro de validação de usuário (fadiga de alerta)
❌ Instrumentar só o happy path (não saber por que usuários abandonam)
```
