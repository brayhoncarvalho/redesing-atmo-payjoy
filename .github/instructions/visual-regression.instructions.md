---
applyTo: "{src/**/*.vue,tests/**/*.{ts,js},**/*.spec.{ts,js},playwright.config.{ts,js}}"
description: >
  Visual regression / Design QA automatizado: snapshot por componente, estado, viewport e tema.
  Define gestão de baseline, tolerância, estabilização anti-flaky, integração CI e fluxo de review.
  Automatiza a cultura pixel-perfect — complementa testing (test pyramid), component-anatomy
  (estados), theming (light/dark) e figma-bidirectional (visual diff vs Figma).
---

# Visual Regression — Design QA Automatizado

## Princípio

**A cultura pixel-perfect da Dock não pode depender de revisão manual de print a cada PR.**
Visual regression testing transforma "alguém comparou e achou ok" em "o CI compara cada pixel automaticamente e bloqueia o merge se algo mudou sem intenção". É o gate que protege o que já está fiel ao Figma de regredir silenciosamente.

> Um teste unitário garante que a função retorna o valor certo. Um teste visual garante que o usuário vê a coisa certa. Em produto de interface, o segundo é tão obrigatório quanto o primeiro.

---

## O Que Snapshotar — A Matriz

Todo componente visual relevante deve ter snapshots cobrindo a **matriz de variação**:

```
COMPONENTE × ESTADO × VIEWPORT × TEMA

Ex: Button
  estados:  default, hover, focus, disabled, loading      (ver component-anatomy)
  viewports: mobile (375), tablet (768), desktop (1440)    (ver responsiveness)
  temas:    light, dark                                    (ver theming)
```

**Não é necessário o produto cartesiano completo** — seria explosão combinatória. A regra de priorização:

| Cobertura | Quando |
|-----------|--------|
| Todos os estados × 1 viewport × 1 tema | **Obrigatório** para todo componente do DS |
| Todos os estados × todos os temas | Componentes com cor semântica (button, input, badge, alert) |
| 1 estado × todos os viewports | Layouts/telas (hero, formulário, dashboard) |
| Estados críticos × temas × viewports | Telas de checkout/pagamento (alto risco) |

**BLOCKER:** Componente do Design System sem snapshot de todos os seus estados obrigatórios.

---

## Implementação — Playwright (component & page level)

A stack já usa Playwright para E2E (ver `testing.instructions.md`). Reaproveitar para visual.

```ts
// tests/visual/button.visual.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Button — visual regression', () => {
  const states = ['default', 'hover', 'focus', 'disabled', 'loading'] as const
  const themes = ['light', 'dark'] as const

  for (const theme of themes) {
    for (const state of states) {
      test(`button/${theme}/${state}`, async ({ page }) => {
        await page.goto(`/__visual__/button?state=${state}&theme=${theme}`)
        const el = page.getByTestId('button-under-test')

        // Estabilização anti-flaky (ver §Anti-flaky)
        await page.evaluate(() => document.fonts.ready)
        await page.waitForLoadState('networkidle')

        await expect(el).toHaveScreenshot(`button-${theme}-${state}.png`, {
          maxDiffPixelRatio: 0.01,   // tolerância: 1% dos pixels
          animations: 'disabled',    // congela animações
        })
      })
    }
  }
})
```

### Rota de harness visual
Criar uma rota interna (`/__visual__/:component`) que renderiza componentes isolados em estados controlados via query params — disponível **apenas em modo de teste/dev**, nunca em produção.

---

## Gestão de Baseline

```
tests/visual/__screenshots__/
  button-light-default.png      ← baseline versionada no git
  button-dark-loading.png
  ...
```

### Regras de baseline
- Baselines são **commitadas no repositório** (fonte de verdade visual versionada).
- Atualizar baseline é uma **ação deliberada e revisada**, nunca automática:
  ```bash
  npm run test:visual:update   # regenera baselines
  ```
- Toda atualização de baseline DEVE aparecer no diff do PR e ser **revisada visualmente** por um humano — é aqui que o reviewer confirma "sim, essa mudança visual é intencional".
- Baselines geradas **no CI** (ambiente consistente), nunca na máquina local do dev — fontes, antialiasing e rendering variam por OS.

**BLOCKER:** Atualizar baseline sem revisão humana do diff visual (anula o propósito do teste).

---

## Estabilização Anti-Flaky

Testes visuais flaky destroem a confiança no gate. Eliminar fontes de variação:

```ts
// playwright.config.ts — configuração de estabilidade visual
export default defineConfig({
  use: {
    // Viewport fixo e determinístico
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    // Desabilita animações globalmente
    launchOptions: { args: ['--force-prefers-reduced-motion'] },
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      scale: 'css',
    },
  },
})
```

### Checklist anti-flaky (eliminar ANTES de baselinar)
```
[ ] Fontes carregadas? → await document.fonts.ready
[ ] Animações/transições congeladas? → animations: 'disabled' + prefers-reduced-motion
[ ] Dados dinâmicos mockados? → datas, valores, IDs fixos (nada de new Date())
[ ] Imagens carregadas? → waitForLoadState + width/height fixos (sem CLS)
[ ] Conteúdo aleatório removido? → seeds fixas, sem Math.random no render
[ ] Cursor/caret piscando fora do snapshot? → blur ou caret-color: transparent
[ ] Scroll em posição determinística?
```

**Regra:** se um teste visual falha de forma intermitente sem mudança de código, ele está flaky — **conserte a estabilização, não aumente a tolerância** para mascarar.

---

## Tolerância — Calibração

```
maxDiffPixelRatio: 0.01   → 1% dos pixels podem diferir (default recomendado)
```

| Contexto | Tolerância | Motivo |
|----------|-----------|--------|
| Componente isolado | 0.001–0.01 | Controle total, baixa variação |
| Tela completa | 0.01–0.02 | Mais superfície, mais ruído de subpixel |
| Texto-pesado | levemente maior | Antialiasing de fonte varia |
| Pagamento/valores | 0.001 (rígido) | Erro visual em valor financeiro é crítico |

**Nunca** usar tolerância alta (>0.05) para "fazer o teste passar" — isso cega o gate para regressões reais.

---

## Visual Diff vs Figma (cruzar com a fonte de design)

Além de regressão (atual vs baseline anterior), cruzar com o Figma é o teste de **fidelidade** (ver `figma-bidirectional.instructions.md`):

```
Regressão:   implementação_atual  vs  baseline_commitada   → "mudou sem querer?"
Fidelidade:  implementação_atual  vs  screenshot_do_Figma  → "está fiel ao design?"
```

- Fidelidade é validada na **criação/revisão** (manual ou semi-automatizada via screenshot do nó Figma).
- Regressão é validada em **todo PR** (automatizada no CI).
- Os dois são complementares — um não substitui o outro.

---

## Integração CI

```yaml
# trecho do pipeline (ver ci-cd.instructions.md)
visual-regression:
  steps:
    - run: npm run test:visual          # roda em ambiente CI consistente
    - if: failure()
      run: npm run test:visual:report   # gera HTML com diffs lado a lado
    - uses: upload-artifact             # anexa o relatório ao PR
      with: { name: visual-diff-report, path: playwright-report/ }
```

### Regras de CI
- Falha de visual regression **bloqueia o merge** (é um check obrigatório).
- O relatório de diff (antes / depois / diff destacado) é anexado ao PR como artefato.
- Comentário automático no PR linkando o relatório quando há diferença visual.
- Baselines regeneradas exclusivamente no CI para garantir consistência de rendering.

---

## Fluxo de Review de Mudança Visual

```
1. Dev altera componente → roda test:visual local (smoke)
2. PR aberto → CI roda visual regression
3a. Sem diff visual → check verde, segue review normal
3b. Com diff visual → check vermelho + relatório anexado
4. Reviewer abre o relatório (antes/depois/diff)
5a. Mudança INTENCIONAL → dev roda test:visual:update, commita nova baseline,
    reviewer aprova vendo a nova baseline no diff do PR
5b. Mudança NÃO intencional (regressão) → dev corrige, sem atualizar baseline
```

---

## Checklist de Visual Regression

```
COBERTURA
  [ ] Todo componente do DS tem snapshot de todos os estados obrigatórios?
  [ ] Componentes com cor semântica cobrem light + dark?
  [ ] Telas críticas (checkout) cobrem viewports + temas?

ESTABILIDADE
  [ ] Fontes/animações/dados dinâmicos estabilizados?
  [ ] Baselines geradas no CI (não local)?
  [ ] Sem flakiness intermitente?

GATE
  [ ] Falha visual bloqueia o merge?
  [ ] Relatório de diff anexado ao PR?
  [ ] Atualização de baseline é revisada por humano?

CALIBRAÇÃO
  [ ] Tolerância adequada ao contexto (rígida em valores financeiros)?
  [ ] Tolerância não inflada para mascarar regressão?
```

## Anti-Patterns de Visual Regression

```
❌ Atualizar baseline automaticamente no CI (anula o teste)
❌ Aumentar tolerância para "fazer passar" em vez de estabilizar
❌ Gerar baseline na máquina local (rendering inconsistente por OS)
❌ Snapshot com data/valor/ID dinâmico não mockado (flaky garantido)
❌ Cobrir só o happy path / estado default (estados são onde regride)
❌ Tratar falha visual como "warning ignorável" em vez de gate de merge
❌ Snapshotar tela inteira quando o componente isolado bastaria (ruído)
❌ Confundir teste de regressão com teste de fidelidade ao Figma (são complementares)
❌ Rota de harness visual exposta em produção
```
