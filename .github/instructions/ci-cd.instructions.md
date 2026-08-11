---
applyTo: "**/{dock.yaml,.github/workflows/*,Jenkinsfile,scripts/*}"
description: "Padrões de CI/CD: pipeline de validação, PR checks, deploy preview, paralelização e rollback strategy."
---

# CI/CD — Padrões Obrigatórios

## Princípio
**Pipeline rápido, confiável e com feedback claro.** Falhar cedo, falhar rápido, com mensagens acionáveis.

---

## 1. Pipeline de Validação — Estrutura

### Etapas (ordem de execução)

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 1 — Paralelo (rápido, < 30s)                            │
│  ┌─────────────┐  ┌────────────────┐  ┌──────────────────────┐ │
│  │ Lint (ESLint)│  │ Design Tokens  │  │ TypeScript typecheck │ │
│  └─────────────┘  └────────────────┘  └──────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  STAGE 2 — Paralelo (médio, < 60s)                             │
│  ┌───────────────┐  ┌─────────────────────┐                    │
│  │ Unit Tests    │  │ A11y Tests (axe-core)│                    │
│  └───────────────┘  └─────────────────────┘                    │
├─────────────────────────────────────────────────────────────────┤
│  STAGE 3 — Sequencial (pesado)                                  │
│  ┌───────────────┐                                              │
│  │ Build (Vite)  │                                              │
│  └───────────────┘                                              │
├─────────────────────────────────────────────────────────────────┤
│  STAGE 4 — Pós-build (opcional)                                 │
│  ┌────────────────────┐  ┌──────────────────┐                  │
│  │ Bundle Size Check  │  │ E2E (Playwright) │                  │
│  └────────────────────┘  └──────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### Regras
- **Stages 1 e 2: paralelizar** — lint, typecheck e design tokens são independentes.
- **Fail-fast:** se Stage 1 falhar, não rodar Stage 2+.
- **Timeout por stage:** máximo 2 minutos (exceto E2E: 5 min).
- **Cache:** `node_modules` cacheado por lockfile hash.

---

## 2. PR Checks — GitHub Actions

### Trigger
```yaml
# .github/workflows/pr-checks.yml
name: PR Validation
on:
  pull_request:
    branches: [develop, release/*, master]
    types: [opened, synchronize, reopened]
```

### Jobs
```yaml
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci

      # Stage 1 — Paralelo
      - name: Lint
        run: npm run lint:gate
      - name: Design Tokens
        run: npm run validate:design
      - name: Typecheck
        run: npx vue-tsc --noEmit

      # Stage 2
      - name: Unit Tests
        run: npm run test -- --coverage
      - name: A11y Tests
        run: npm run test:a11y

      # Stage 3
      - name: Build
        run: npm run build

      # Stage 4
      - name: Bundle Size
        run: npx size-limit

  e2e:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### Regras de merge
- PR não pode ser merged se quality job falhar.
- E2E pode ser advisory (warning) em draft PRs, blocking em PRs para `master`/`release/*`.
- Coverage report deve ser comentado no PR (via action ou bot).

---

## 3. Deploy Strategy

### Ambientes (dock.yaml)
| Ambiente | Branch | Auto-deploy | Aprovação |
|----------|--------|-------------|-----------|
| dev | develop | ✅ Sim | Nenhuma |
| hml | release/* | ❌ Não | 1 aprovação |
| prd | master | ❌ Não | 2 aprovações + tag |

### Deploy Preview (por PR)
- Cada PR deve gerar um preview deployment (URL temporária).
- Opções: Vercel Preview, Netlify Deploy Preview, ou S3 bucket temporário.
- Preview URL deve ser comentada automaticamente no PR.
- Preview expira após merge/close do PR.

### Rollback
- Em caso de falha em produção: revert imediato para último artefato estável.
- S3/CloudFront: manter 3 últimas versões no bucket (rollback = apontar para versão anterior).
- `dock.yaml` deve definir `deploymentStrategy: "rolling"` com health check.
- Rollback automático se health check falhar após deploy.

---

## 4. Scripts de Validação (package.json)

```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:gate": "eslint src/ --max-warnings 0",
    "validate:design": "node scripts/validate-design.mjs",
    "validate": "node scripts/validate-pipeline.mjs",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:a11y": "vitest run src/components/__tests__/a11y.spec.ts",
    "test:e2e": "playwright test",
    "build": "vue-tsc --noEmit && vite build",
    "build:analyze": "vite build && npx vite-bundle-visualizer",
    "compliance": "node scripts/compliance-report.mjs"
  }
}
```

---

## 5. Compliance Report (Automação)

### Geração automática
- Rodar `compliance-report.mjs` em toda PR para `release/*` e `master`.
- Output: `.dock-compliance.json` commitado como artefato do CI.
- Score < 80: bloquear merge.

### Métricas do report
| Métrica | Peso | Alvo |
|---------|------|------|
| % files sem color violations | 30% | 100% |
| % files sem banned fonts | 20% | 100% |
| % components usando DS imports | 25% | ≥ 90% |
| Coverage de utils | 15% | ≥ 95% |
| A11y violations (0 = 100) | 10% | 0 violations |

---

## 6. Secrets e Variáveis no CI

### Regras
- Secrets (API tokens, deploy keys) DEVEM estar em GitHub Secrets / Jenkins Credentials.
- Nunca hardcodar secrets em workflows, scripts ou código.
- Variáveis de ambiente para o build (URLs, flags) via matrix/env no workflow.
- `.env` nunca commitado — usar `.env.example` como documentação.

---

## 7. Notificações

### Quando notificar (canal definido no dock.yaml)
| Evento | Canal | Formato |
|--------|-------|---------|
| PR checks falharam | PR comment | Detalhes da falha + link para logs |
| Deploy dev concluído | Slack `#dock-ds-frontend` | URL do preview |
| Deploy prd concluído | Slack `#dock-ds-frontend` | URL + versão + changelog |
| Rollback executado | Slack `#dock-ds-frontend` + `#incidents` | Motivo + versão revertida |

---

## Anti-Patterns (NUNCA fazer)

❌ Pipeline 100% sequencial quando há etapas independentes
❌ Timeout infinito em jobs (processos pendurados bloqueiam fila)
❌ Ignorar falhas de lint/test para "agilizar" deploy
❌ Deploy direto para produção sem staging
❌ Secrets no código ou em variáveis `VITE_` expostas
❌ PR sem nenhum check automático
❌ Merge para master sem aprovação humana
❌ Deploy sem possibilidade de rollback
❌ Pipeline que não reporta resultado no PR
