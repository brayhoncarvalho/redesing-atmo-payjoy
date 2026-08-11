---
applyTo: "{src/**/*.{ts,vue},vite.config.{ts,js},public/manifest.*}"
description: >
  PWA e estratégia offline-first: service worker, estratégias de cache, manifest, fluxo de atualização,
  fila offline e — crítico para pagamentos — proibição de mutação financeira offline.
  Expande a detecção online/offline de ui-states e integra com performance e security.
---

# PWA & Offline-First

## Princípio

**Offline-first melhora a experiência — mas em pagamentos, dado financeiro nunca pode ser confirmado offline.**
A detecção online/offline básica já está em `ui-states.instructions.md`. Este documento define a estratégia completa: cache, atualização e fila. A regra inegociável: **leitura pode ser offline; escrita financeira, nunca**. Mostrar ao usuário um pagamento "confirmado" que na verdade está numa fila local é uma quebra de confiança grave e um risco de negócio.

> Offline-first é sobre resiliência de leitura e continuidade — não sobre fingir que uma transação aconteceu quando a rede caiu.

---

## REGRA 1 — Service Worker (via Vite PWA)

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'prompt',          // NUNCA autoUpdate silencioso — ver Regra 3
      manifest: { /* Regra 4 */ },
      workbox: {
        navigateFallback: '/offline.html',
        runtimeCaching: [ /* Regra 2 */ ],
      },
    }),
  ],
})
```

### Regras
- Service worker só em produção sobre HTTPS (ver `security.instructions.md`).
- `registerType: 'prompt'` — atualização requer ação do usuário, nunca recarrega no meio de um fluxo.
- Precache do app shell (HTML/CSS/JS/fontes) para carregamento instantâneo em revisitas.

---

## REGRA 2 — Estratégias de Cache por Tipo de Recurso

A estratégia errada serve dado financeiro velho. Escolher por tipo:

| Recurso | Estratégia | Por quê |
|---------|-----------|---------|
| App shell (JS/CSS/fontes) | **Cache-first** | Imutável (hashed); instantâneo |
| Imagens/ícones estáticos | **Cache-first** (com expiração) | Raramente mudam |
| Dados de leitura não-crítica (catálogo, FAQ) | **Stale-while-revalidate** | Rápido + atualiza em background |
| **Saldo, extrato, valores, status de transação** | **Network-first** (ou network-only) | Dado financeiro NUNCA pode ser servido velho |
| **Mutações (POST/PUT de pagamento, proposta)** | **Network-only** | Nunca cachear/enfileirar cegamente — ver Regra 5 |

```ts
runtimeCaching: [
  { urlPattern: /\/assets\//, handler: 'CacheFirst' },
  { urlPattern: /\/api\/(faq|catalogo)/, handler: 'StaleWhileRevalidate' },
  { urlPattern: /\/api\/(saldo|extrato|transacoes)/, handler: 'NetworkFirst',
    options: { networkTimeoutSeconds: 3 } },
  // mutações: sem cache (NetworkOnly é o default — não listar = não cachear)
]
```

**BLOCKER:** Servir saldo/extrato/valor/status de transação a partir do cache (dado financeiro velho apresentado como atual).

---

## REGRA 3 — Fluxo de Atualização ("nova versão disponível")

Atualizar o SW no meio de um fluxo (recarregar a página) faz o usuário perder contexto. Pedir, não impor.

```vue
<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
const { needRefresh, updateServiceWorker } = useRegisterSW()
</script>

<template>
  <Toast v-if="needRefresh" type="info" :persistent="true" role="status">
    Uma nova versão está disponível.
    <button class="font-medium underline min-h-[44px]" @click="updateServiceWorker(true)">
      Atualizar agora
    </button>
  </Toast>
</template>
```

### Regras
- Notificar de forma não intrusiva (toast persistente) — usuário decide quando atualizar.
- **Nunca** recarregar automaticamente durante preenchimento de formulário (combinar com `form-resilience` — salvar rascunho antes).
- Versão nova só ativa após confirmação.

**BLOCKER:** Recarregar a aplicação para aplicar atualização sem consentimento, no meio de um fluxo do usuário.

---

## REGRA 4 — Web App Manifest

```json
// public/manifest.webmanifest
{
  "name": "Dock", "short_name": "Dock",
  "start_url": "/", "display": "standalone",
  "background_color": "#ffffff", "theme_color": "#00d8d8",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- `theme_color` deve acompanhar o tema (ver `theming.instructions.md` — meta theme-color).
- Ícone maskable para Android; tamanhos 192 e 512 mínimos.
- Install prompt (`beforeinstallprompt`): oferecer de forma contextual, nunca pop-up imediato no primeiro acesso.

---

## REGRA 5 — Fila Offline (com extrema cautela)

Enfileirar ações para reenvio ao reconectar é poderoso — e perigoso em fintech.

```
PODE enfileirar offline (idempotente, não-financeiro, reversível):
  ✅ Salvar rascunho de formulário (ver form-resilience)
  ✅ Preferências de UI (tema, filtros)
  ✅ Marcar notificação como lida

NUNCA enfileirar offline:
  ❌ Pagamento, transferência, confirmação de proposta
  ❌ Qualquer mutação com efeito financeiro ou irreversível
  ❌ Ação cuja duplicação cause dano (sem chave de idempotência garantida)
```

### Para ações financeiras offline
- Bloquear o submit e informar claramente: "Sem conexão. Reconecte para confirmar — sua proposta está salva como rascunho."
- O dado fica como **rascunho** (form-resilience), não como ação pendente que "vai acontecer".
- Só o servidor, online, confirma. UI nunca mostra "confirmado" baseada em fila local.

**BLOCKER:** Enfileirar uma mutação financeira offline e apresentar como concluída/confirmada ao usuário.

---

## REGRA 6 — UI Offline

Expande a detecção de `ui-states.instructions.md`:

```
- Banner persistente no topo quando offline (já em ui-states)
- Desabilitar/ocultar CTAs de ação financeira enquanto offline, com explicação
- Indicar dados potencialmente desatualizados ("Atualizado pela última vez às 14h32")
- Página /offline.html de fallback para navegação sem cache
- Ao reconectar: revalidar dados financeiros (network-first) antes de reabilitar ações
```

---

## Checklist de PWA & Offline

```
SERVICE WORKER
  [ ] SW só em produção/HTTPS, registerType 'prompt'?
  [ ] App shell em precache?

CACHE
  [ ] Estratégia escolhida por tipo de recurso?
  [ ] Dado financeiro com network-first/only (nunca cache-first)?

ATUALIZAÇÃO
  [ ] "Nova versão" notificada de forma não intrusiva?
  [ ] Nunca recarrega no meio de fluxo sem consentimento?

MANIFEST
  [ ] Ícones 192/512 + maskable?
  [ ] theme_color acompanha o tema?
  [ ] Install prompt contextual (não imediato)?

OFFLINE (BLOCKER se falhar)
  [ ] Nenhuma mutação financeira enfileirada offline?
  [ ] Ação financeira offline vira rascunho, não "pendente confirmada"?
  [ ] CTAs financeiros desabilitados offline com explicação?
  [ ] Reconexão revalida dado financeiro antes de reabilitar?
```

## Anti-Patterns de PWA & Offline

```
❌ Servir saldo/extrato/transação do cache (dado financeiro velho)
❌ Enfileirar pagamento/transferência offline e mostrar como confirmado
❌ Recarregar a app para atualizar SW no meio de um formulário
❌ autoUpdate silencioso do service worker
❌ Cache-first em dado que muda (mostra informação obsoleta)
❌ Install prompt agressivo no primeiro acesso
❌ Service worker em dev (cache atrapalha desenvolvimento)
❌ Offline sem feedback (usuário não sabe por que a ação falhou)
❌ Não revalidar dados ao reconectar
```
