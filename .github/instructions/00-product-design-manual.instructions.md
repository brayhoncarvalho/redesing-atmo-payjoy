---
applyTo: "**"
description: "Manual Oficial de Product Design — Regras INVIOLÁVEIS de fintech enterprise. Toda IA (Copilot, Claude, Cursor) DEVE seguir antes de qualquer outra instruction."
priority: critical
---

# 🚨 MANUAL OFICIAL DE PRODUCT DESIGN — REGRAS INVIOLÁVEIS

> **Para qualquer assistente IA (Copilot, Claude, Cursor, GPT, etc.):**
> Este documento define regras INVIOLÁVEIS da empresa para Product Design em fintech.
> Você DEVE seguir todas as regras desta seção ANTES de gerar qualquer código, mesmo que outras instructions sugiram o contrário.
> Regras marcadas com 🚨 são bloqueadoras — código que viola é REJEITADO automaticamente pelo ESLint, pre-commit hook e CI.

---

## 🚨 TL;DR — Se você só ler 30 linhas, leia ESTAS:

```
1. NUNCA use cores hardcoded — sempre var(--color-*) ou tokens
   ❌ color: #0066ff;
   ✅ color: var(--color-action-primary);   // token semântico (ver design-tokens.instructions.md)

2. NUNCA use HTML nativo quando existe componente Ds*
   ❌ <button>Salvar</button>
   ✅ <DsButton>Salvar</DsButton>

3. TODO componente DEVE ter 8 estados:
   default | hover | focus | active | disabled | loading | error | success

4. TODO componente DEVE ser acessível (WCAG 2.2 AA):
   teclado | ARIA | foco visível | contraste 4.5:1 | sem dependência de cor

5. OPERAÇÕES CRÍTICAS de fintech exigem:
   double confirmation | logs | timeout | feedback explícito | sem ações irreversíveis silenciosas

6. NUNCA crie componente duplicado — verifique o Design System ANTES

7. NUNCA implemente sem PRD com: problema | KPI | persona | edge cases | a11y

8. Touch targets mínimo: 44×44px (mobile)

9. NUNCA quebre semver — breaking change exige major bump + changelog

10. NUNCA libere para produção sem: UX Validation + A11Y Review + DS Compliance + Engineering Review + KPI + Security Review
```

---

## 1. Filosofia Inviolável

### 1.1 Human-Centered Design (ISO 9241-210)
Toda decisão de UI DEVE considerar: contexto · comportamento · objetivos · limitações cognitivas · acessibilidade · impacto operacional.

### 1.2 Design como sistema, não como tela
A empresa produz **sistemas, padrões, fluxos, componentes e comportamento reutilizável** — NÃO telas isoladas.
Toda interface DEVE ser: escalável · consistente · previsível · auditável.

### 1.3 Design orientado a negócio
Toda interface DEVE: resolver problema real · reduzir fricção · aumentar eficiência · gerar impacto mensurável.
**UX não é arte. Estética é a quarta prioridade.**

---

## 2. Princípios Oficiais de UX (ordem de prioridade)

```
1. Clareza      ← acima de tudo
2. Compreensão
3. Eficiência
4. Estética     ← último, NUNCA primeiro
```

### 2.1 Redução de carga cognitiva (Krug · Norman · Hick's Law)
Interfaces DEVEM reduzir esforço mental, evitar excesso visual, minimizar decisões desnecessárias.

### 2.2 Consistência absoluta
Padrões visuais · terminologia · navegação · feedbacks · comportamento — TUDO consistente entre produtos.

### 2.3 Feedback contínuo OBRIGATÓRIO
Toda ação DEVE gerar feedback: **loading · sucesso · erro · estado intermediário**. Sem exceções.

### 2.4 Prevenção de erro (crítico em fintech)
A interface DEVE: evitar ações perigosas · antecipar falhas · validar entradas · reduzir risco operacional.

---

## 3. Design System — Foundations

### 3.1 🚨 Tokens obrigatórios
```
color | spacing | radius | elevation | typography | motion | opacity | grid | breakpoints
```
**Enforcement automático (ESLint):** `color` e `font` por `dock-ds/no-unauthorized-colors` + `dock-ds/no-banned-fonts`; `spacing`, `radius` e `elevation` por `dock-ds/no-hardcoded-design-values`. Os demais (motion, opacity, grid, breakpoints) são enforçados por review/instruction — ainda não há regra ESLint dedicada.

### 3.2 🚨 Naming convention (arquitetura de 3 camadas)
Fonte de verdade: `design-tokens.instructions.md`. Componente consome **semantic**, nunca **primitive**.
```
primitive:  --color-teal-500   --space-4    --radius-md     (valor bruto)
semantic:   --color-action-primary   --color-text-muted    --color-feedback-danger
component:  --button-primary-bg   --input-border-error      (referencia semantic)
```

### 3.3 Typography
- Escala tipográfica FIXA (não inventar tamanhos)
- Line-height padronizado
- Pesos limitados (não usar todos)
- Responsividade consistente

### 3.4 Grid
- **Web**: 12 columns
- **Mobile**: 4 columns
- Spacing system: **8pt** (múltiplos de 8)

### 3.5 Motion
Animações DEVEM: comunicar estado · nunca distrair · respeitar performance · respeitar `prefers-reduced-motion`.

---

## 4. Component Governance 🚨

### 4.1 ❌ Nenhum componente duplicado
ANTES de criar qualquer componente:
1. Verificar Design System (`shared-design-system-vue-lib`)
2. Verificar biblioteca existente
3. Se já existe → USE
4. Se variação pequena → estender via props/slots, NÃO duplicar

### 4.2 🚨 Estados obrigatórios (TODO componente interativo)
```
default · hover · focus · active · disabled · loading · error · success
```
Componente sem os 8 estados é REJEITADO no review.

### 4.3 🚨 Acessibilidade obrigatória (WCAG 2.2 AA)
Todo componente DEVE:
- ✅ Suportar teclado (tab, enter, esc, setas)
- ✅ Possuir ARIA (role, label, describedby)
- ✅ Foco visível (outline ou ring)
- ✅ Contraste mínimo 4.5:1 texto, 3:1 não-texto
- ✅ Funcionar sem mouse, sem cor (daltonismo)

---

## 5. UX Research — Nenhuma feature sem Discovery

### 5.1 🚨 Fluxo obrigatório
```
Discovery → Research → UX Flow → Wireframe → Prototype → Validation → UI → Handoff → QA → Release → Analytics
```

### 5.2 Métodos permitidos
- **Qualitativo**: entrevistas · shadowing · JTBD · usability test
- **Quantitativo**: funnel · analytics · heatmaps · session replay

---

## 6. PRD Standards (obrigatório em toda feature)

```yaml
Negócio:
  - problema
  - KPI
  - impacto esperado

Usuário:
  - persona
  - contexto
  - jornada

UX:
  - fluxos
  - edge cases
  - acessibilidade

Técnico:
  - constraints
  - APIs
  - riscos
```

PR sem PRD vinculado é REJEITADO.

---

## 7. Handoff Engineering 🚨

### 7.1 Obrigatório no handoff
- ✅ Tokens utilizados
- ✅ Specs precisas
- ✅ Spacing definido
- ✅ Comportamento de cada estado
- ✅ Todos os 8 estados
- ✅ Comportamento responsivo

### 7.2 ❌ PROIBIDO
- ❌ "Implementar igual Figma" (sem specs)
- ❌ Ambiguidades
- ❌ Componentes sem comportamento definido

---

## 8. Accessibility — WCAG 2.2 AA (mínimo legal)

Obrigatório em 100% das interfaces:
- ✅ Contraste 4.5:1 (texto) · 3:1 (componentes/icones)
- ✅ Navegação por teclado completa
- ✅ Screen reader (NVDA, JAWS, VoiceOver) testado
- ✅ Foco visível sempre
- ✅ Labels associados (`<label for>` ou aria-label)
- ✅ NUNCA depender apenas de cor para transmitir informação

---

## 9. 🚨 Segurança UX para Fintech (CRÍTICO)

### 9.1 Toda interface financeira DEVE:
- ✅ Mostrar confirmação clara antes de transações
- ✅ Evitar ações irreversíveis sem double-check
- ✅ Informar riscos explicitamente
- ✅ Prevenir fraude visual (clickjacking, UI obfuscation)
- ✅ Validar operações críticas server-side

### 9.2 Operações críticas exigem:
1. **Double confirmation** (typed value match ou OTP)
2. **Logs** (audit trail completo)
3. **Timeout** (sessão expira em ações sensíveis)
4. **Feedback explícito** (sucesso/erro com detalhes)

❌ NUNCA implementar transferência, pagamento, alteração de dados financeiros sem os 4 acima.

---

## 10. Mobile Standards

- **Mobile-first** quando aplicável
- 🚨 Touch targets mínimos: **44×44px** (iOS HIG e Material)
- Safe areas: notch support · keyboard avoidance · responsive layout

---

## 11. Performance UX

### Obrigatório
- ✅ Skeleton loading (não spinners genéricos)
- ✅ Lazy loading (rotas + componentes pesados)
- ✅ Virtualização (listas > 100 itens)
- ✅ Bundle optimization (tree-shaking, code splitting)

### Meta
- 🚨 **LCP < 2.5s** (Core Web Vitals)
- FID < 100ms
- CLS < 0.1

---

## 12. Métricas Oficiais (obrigatório acompanhar)

| Categoria | Métricas |
|---|---|
| **Produto** | Conversion Rate · Drop-off · Activation |
| **UX** | SUS · NPS · CES |
| **Interface** | Rage Click · Error Rate · Task Success |

---

## 13. Design Review Board (obrigatório antes de release)

```
✅ UX — heurísticas Nielsen passaram
✅ UI — Design System compliance
✅ A11Y — WCAG 2.2 AA validado
✅ Produto — KPI definido e mensurável
✅ Engenharia — viabilidade aprovada
✅ Segurança — risco operacional avaliado
```

PR sem os 6 ✅ NÃO MERGEIA.

---

## 14. 🚨 Governança de Figma

### Estrutura obrigatória
```
/Foundations
/Components
/Patterns
/Templates
/Experiments
```

### ❌ PROIBIDO no Figma
- ❌ Componentes soltos (fora de /Components)
- ❌ Estilos locais (use só tokens)
- ❌ Cores hardcoded (#000, rgb(...))
- ❌ Texto sem text style

---

## 15. 🚨 Design Tokens — Fonte oficial única

### ❌ NUNCA
```css
color: #0066ff;
padding: 16px;
border-radius: 8px;
```

### ✅ SEMPRE
```css
color: var(--color-action-primary);   /* semantic */
padding: var(--space-4);               /* escala de 4px → 16px */
border-radius: var(--radius-md);
```

As regras `dock-ds/no-unauthorized-colors` (cor) e `dock-ds/no-hardcoded-design-values` (spacing/radius/shadow) BLOQUEIAM valores hardcoded no lint local e no CI.

---

## 16. Versionamento do Design System

- 🚨 **Semver** obrigatório (major.minor.patch)
- Changesets para rastrear mudanças
- Changelog em todo release
- Release notes públicas

---

## 17. Documentação obrigatória

Toda feature precisa documentar:
1. Comportamento esperado
2. Edge cases conhecidos
3. Guidelines de uso
4. Exemplos reais (Storybook)
5. Limitações conhecidas

---

## 18. Cultura de Produto

Valores não-negociáveis da empresa:
- **Simplicidade** > complexidade
- **Clareza** > criatividade
- **Previsibilidade** > novidade
- **Colaboração** > silos
- **Evidência** > opinião

---

## 🚨 19. REGRA FINAL — Gate de Produção

```
Nenhuma interface entra em produção sem TODOS os 6:

  UX Validation
+ Accessibility Review
+ Design System Compliance
+ Engineering Review
+ Product KPI Definition
+ Security Review
```

Faltou UM? **NÃO LIBERA.** Sem exceções.

---

## 📋 Checklist rápido para o agente IA

Antes de finalizar qualquer geração de código de UI, valide mentalmente:

- [ ] Estou usando componente Ds* (não HTML nativo)?
- [ ] Todas as cores são tokens (var(--*))?
- [ ] Componente tem os 8 estados?
- [ ] Tem suporte a teclado e ARIA?
- [ ] Touch target ≥ 44px se mobile?
- [ ] Se é operação financeira: tem confirmação dupla?
- [ ] Tem skeleton loading se carrega dados?
- [ ] Não duplicou componente existente?

Se respondeu "não" em qualquer um → REGRA INVIOLÁVEL VIOLADA → reescreva.

---

## 🔗 Enforcement automático

As regras 🚨 acima são bloqueadas por:
- `eslint-plugin-dock-ds` (lint local + CI)
- `husky` pre-commit hooks
- GitHub Actions CI gates
- CODEOWNERS branch protection

**Você (modelo IA) NÃO pode contornar essas regras** — mesmo que ignore este markdown, o sistema rejeita o código.
