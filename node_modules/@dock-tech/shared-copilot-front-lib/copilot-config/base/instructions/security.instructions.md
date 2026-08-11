---
applyTo: "src/**/*.{ts,vue}"
description: "Regras obrigatórias de segurança: proteção de secrets, XSS, CSP, sanitização, env vars e proteção anti-bot progressiva."
---

# Segurança — Regras Obrigatórias

## Princípio
**Nunca confiar apenas no client.** Validações e proteções no frontend são UX — a segurança real vive no backend.

---

## 1. Variáveis de Ambiente e Secrets

### Regras absolutas
- **NUNCA colocar secrets em variáveis `VITE_`** — tudo com prefixo `VITE_` é embutido no bundle e fica público.
- Variáveis `VITE_` são APENAS para configuração pública: URLs de API, feature flags, IDs de tracking.
- **Secrets (tokens, API keys, passwords)** DEVEM ficar no backend ou em runtime env do servidor (não existe servidor em S3/CF — secrets não podem estar no front).
- Se o projeto precisa de autenticação, usar fluxo OAuth/OIDC via backend — nunca expor client_secret no front.

### `.env` — Boas práticas
- `.env` deve estar no `.gitignore` (nunca versionar).
- `.env.example` com valores fictícios para documentar as variáveis disponíveis.
- Prefixo `VITE_` = público. Sem prefixo = disponível apenas no build (node scripts), nunca no browser.

### O que pode ir em `VITE_`
```
VITE_API_BASE_URL=https://api.dock.com.br    ✅ público
VITE_FEATURE_FLAG_X=true                      ✅ público
VITE_GTM_ID=GTM-XXXXX                        ✅ público
```

### O que NUNCA pode ir em `VITE_`
```
VITE_API_KEY=sk-xxxxx                         ❌ PROIBIDO
VITE_SECRET_TOKEN=abc123                      ❌ PROIBIDO
VITE_DATABASE_URL=postgres://...              ❌ PROIBIDO
VITE_FIGMA_TOKEN=figd_...                     ❌ PROIBIDO
```

---

## 2. Proteção contra XSS

### Regras
- **NUNCA usar `v-html`** com dados que vêm de input do usuário, API, URL params ou qualquer fonte externa.
- Se `v-html` for absolutamente necessário (conteúdo rico de CMS), sanitizar com DOMPurify antes.
- Preferir interpolação Vue `{{ }}` que escapa automaticamente.
- Nunca injetar `innerHTML` via JS direto.
- Nunca usar `eval()`, `new Function()`, ou `document.write()`.

### Exemplo
```vue
<!-- ❌ ERRADO — XSS se userData vier da API -->
<div v-html="userData.bio"></div>

<!-- ✅ CORRETO — escapado automaticamente -->
<p>{{ userData.bio }}</p>

<!-- ✅ CORRETO — se v-html necessário, sanitizar -->
<div v-html="sanitize(cmsContent)"></div>
```

```ts
import DOMPurify from 'dompurify'
const sanitize = (html: string) => DOMPurify.sanitize(html)
```

---

## 3. Content Security Policy (CSP)

### Recomendação para S3/CloudFront
- Configurar headers CSP via CloudFront Response Headers Policy (não no HTML meta tag).
- Baseline mínima:
  - `default-src 'self'`
  - `script-src 'self'` (sem `'unsafe-inline'` se possível)
  - `style-src 'self' 'unsafe-inline'` (Tailwind requer inline)
  - `img-src 'self' data: https:`
  - `font-src 'self' https://fonts.gstatic.com`
  - `connect-src 'self' https://api.dock.com.br`
- Documentar no `dock.yaml` ou README qual CSP aplicar no ambiente.

---

## 4. Proteção Anti-Bot — Abordagem Progressiva

### Princípio
**Nunca usar CAPTCHA por padrão.** Proteger sem adicionar fricção ao usuário real.

### Camadas de proteção (ordem de aplicação)

| Nível | Técnica | Onde | Impacto UX |
|-------|---------|------|------------|
| 1 | Honeypot invisível | Frontend | Zero — usuário não vê |
| 2 | Tempo mínimo de preenchimento | Backend | Zero — tolerante a autofill |
| 3 | Rate limit por IP/sessão | Backend | Zero em uso normal |
| 4 | Idempotência (bloqueio de resubmit) | Frontend + Backend | Mínimo |
| 5 | reCAPTCHA v3 (score invisível) | Frontend | Zero — sem interação |
| 6 | reCAPTCHA v2 / hCaptcha | Frontend | Alto — só se necessário |

### Regras de implementação

#### Honeypot (nível 1 — obrigatório em formulários públicos)
```vue
<!-- Campo invisível para humanos, bots preenchem -->
<div aria-hidden="true" style="position: absolute; left: -9999px; opacity: 0; height: 0; overflow: hidden;">
  <label for="website">Website</label>
  <input
    id="website"
    v-model="honeypot"
    type="text"
    tabindex="-1"
    autocomplete="off"
  />
</div>
```
- Se `honeypot` tiver valor no submit → rejeitar silenciosamente (não mostrar erro, simular sucesso).
- O campo DEVE ser inacessível: `tabindex="-1"`, `aria-hidden="true"`, fora do fluxo visual.
- Não prejudica usuários assistivos (screen readers ignoram `aria-hidden`).

#### Bloqueio de resubmit (nível 4 — obrigatório)
- Após submit bem-sucedido, desabilitar botão e mostrar estado de loading.
- No backend: aceitar apenas 1 submissão por token/sessão por intervalo.

#### Quando escalar para CAPTCHA
- Apenas quando houver evidência de abuso (métricas de rate no backend).
- Preferir reCAPTCHA v3 (invisível, score-based) antes de v2.
- CAPTCHA visível apenas como último recurso e com feature flag.

### Tolerância obrigatória
- Proteções anti-bot NUNCA devem bloquear:
  - Autofill do browser
  - Password managers
  - Usuários com deficiência usando assistive tech
  - Preenchimento rápido por power users
- Tempo mínimo de preenchimento (se usado): ≥ 2 segundos é tolerância segura; testar com autofill antes de definir.

---

## 5. Validação — Client vs Server

### Regra fundamental
| Camada | Propósito | Segurança |
|--------|-----------|-----------|
| Frontend (client) | UX — feedback imediato ao usuário | ❌ NÃO é segurança |
| Backend (server) | Segurança — nunca confiar no client | ✅ Fonte de verdade |

### Implicações práticas
- Validações de CPF, CNPJ, formato, limites — fazer no front E no back.
- O front pode ser burlado (DevTools, curl, script) — nunca assumir que dados chegam validados no servidor.
- Se o front valida "máximo R$ 200.000", o back DEVE validar também.
- Mensagens de erro do backend devem ser mapeadas para UX amigável no front (não expor stack traces).

---

## 6. Dependências e Supply Chain

### Regras
- Não instalar pacotes npm sem verificar: popularidade, manutenção, vulnerabilidades conhecidas.
- Rodar `npm audit` periodicamente.
- Preferir pacotes do ecossistema do projeto (`@dock-tech/*`) quando existirem.
- Lockfile (`package-lock.json`) DEVE ser versionado.
- Nunca usar CDN de terceiros para scripts críticos em produção (usar bundle local).

---

## 7. URLs e Navegação

### Regras
- Nunca construir URLs com concatenação de input do usuário sem sanitizar.
- Usar `encodeURIComponent()` para parâmetros de query.
- Links externos devem ter `rel="noopener noreferrer"` em `target="_blank"`.
- Nunca redirecionar para URL vinda de query param sem whitelist.

---

## Anti-Patterns (NUNCA fazer)

❌ Colocar API keys/tokens em variáveis `VITE_`
❌ Usar `v-html` com dados de usuário sem sanitização
❌ Confiar apenas em validação client-side para segurança
❌ Implementar CAPTCHA como primeira proteção anti-bot
❌ Bloquear autofill ou assistive tech com proteções anti-bot
❌ Expor stack traces ou mensagens de erro internas do backend
❌ Usar `eval()`, `new Function()`, `document.write()`
❌ Redirecionar para URLs não validadas
❌ Ignorar `npm audit` warnings em dependências
