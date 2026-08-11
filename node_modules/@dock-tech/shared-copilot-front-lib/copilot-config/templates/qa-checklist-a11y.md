# QA Checklist — Acessibilidade, UX e WCAG AA

> **Owner:** QA · **Cadência:** Obrigatório em toda release com novos componentes ou mudança de fluxo.  
> **Referências:** WCAG 2.2 AA, ISO 9241-210, Heurísticas de Nielsen, ARIA 1.2.

---

## Como usar

1. Execute o pipeline automatizado antes de abrir o checklist manual: `npm run validate`
2. Preencha este checklist para cada tela/componente novo ou alterado no release.
3. Marque cada item: `[x]` = passa · `[~]` = passa com ressalva (documente) · `[ ]` = falha (bloqueia).
4. Se algum item falhar, abra tarefa com label `a11y-blocker` antes de mergear.

---

## 1. Automated Gates (CI — executado antes deste checklist)

| # | Gate | Comando | Status |
|---|------|---------|--------|
| A1 | ESLint sem errors (incl. dock-ds + vuejs-accessibility) | `npm run lint` | `[ ]` |
| A2 | Design Tokens válidos | `npm run validate:design` | `[ ]` |
| A3 | Contraste WCAG AA nas cores oficiais | `npm run validate:contrast` | `[ ]` |
| A4 | Testes unitários ≥ thresholds de cobertura | `npm run test -- --run` | `[ ]` |
| A5 | Testes de a11y automatizados (axe-core) | `npm run test:a11y -- --run` | `[ ]` |
| A6 | Compliance score ≥ 85 | `npm run compliance` | `[ ]` |
| A7 | Build sem erros | `npm run build` | `[ ]` |

> Se algum gate acima falhar, **não prossiga** com o checklist manual.

---

## 2. Contraste e Cor (WCAG 1.4.3, 1.4.11, 1.4.1)

| # | Critério | Componente/Tela | Resultado |
|---|----------|-----------------|-----------|
| C1 | Texto normal ≥ 4,5:1 contra fundo | | `[ ]` |
| C2 | Texto grande (≥ 18pt / 14pt negrito) ≥ 3:1 | | `[ ]` |
| C3 | Ícones e componentes de UI ≥ 3:1 contra fundo | | `[ ]` |
| C4 | Estado de foco visível ≥ 3:1 contra fundo adjacente | | `[ ]` |
| C5 | Informação não transmitida **apenas** por cor (ex: erro tem ícone + texto) | | `[ ]` |

Ferramenta de referência: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 3. Teclado e Foco (WCAG 2.1.1, 2.4.3, 2.4.7)

| # | Critério | Componente/Tela | Resultado |
|---|----------|-----------------|-----------|
| K1 | Todos os elementos interativos são alcançáveis via Tab | | `[ ]` |
| K2 | Ordem do foco segue a ordem visual e lógica do conteúdo | | `[ ]` |
| K3 | Foco nunca fica "preso" (exceto em modais intencionalmente) | | `[ ]` |
| K4 | Modais capturam foco ao abrir e o devolvem ao trigger ao fechar | | `[ ]` |
| K5 | Escape fecha modais, dropdowns, tooltips | | `[ ]` |
| K6 | Dropdowns/menus navegáveis com setas (↑↓) e fecháveis com Escape | | `[ ]` |
| K7 | Indicador de foco visível em **todos** os elementos interativos | | `[ ]` |
| K8 | Skip link presente e funcional no topo da página | | `[ ]` |

---

## 4. ARIA e Semântica (WCAG 1.3.1, 4.1.2, 4.1.3)

| # | Critério | Componente/Tela | Resultado |
|---|----------|-----------------|-----------|
| R1 | Botões com ícone apenas têm `aria-label` descritivo | | `[ ]` |
| R2 | Links com ícone apenas têm `aria-label` descritivo | | `[ ]` |
| R3 | Imagens decorativas têm `alt=""` | | `[ ]` |
| R4 | Imagens informativas têm `alt` descritivo e conciso | | `[ ]` |
| R5 | Estados de carregamento usam `aria-live="polite"` ou `role="status"` | | `[ ]` |
| R6 | Estados de erro usam `aria-live="assertive"` | | `[ ]` |
| R7 | Componentes com `aria-expanded`, `aria-selected`, `aria-checked` atualizam corretamente | | `[ ]` |
| R8 | Landmarks presentes: `<header>`, `<main>`, `<nav>`, `<footer>` ou equivalentes `role=` | | `[ ]` |
| R9 | Hierarquia de headings H1→H6 coerente (sem pular níveis) | | `[ ]` |

---

## 5. Formulários (WCAG 1.3.1, 3.3.1, 3.3.2)

| # | Critério | Componente/Tela | Resultado |
|---|----------|-----------------|-----------|
| F1 | Todo campo tem `<label>` associado ou `aria-label` | | `[ ]` |
| F2 | Mensagens de erro identificam o campo e descrevem o problema | | `[ ]` |
| F3 | Erros de validação anunciados por leitor de tela (`aria-describedby` ou `aria-live`) | | `[ ]` |
| F4 | Campo inválido marcado com `aria-invalid="true"` | | `[ ]` |
| F5 | Campos obrigatórios identificados visualmente e via `aria-required` | | `[ ]` |
| F6 | Autocomplete com `aria-autocomplete` e `aria-activedescendant` quando aplicável | | `[ ]` |

---

## 6. Responsividade e Zoom (WCAG 1.4.4, 1.4.10, 2.5.8)

| # | Critério | Dispositivo/Config | Resultado |
|---|----------|-------------------|-----------|
| Z1 | Zoom 200% sem perda de conteúdo ou funcionalidade | Desktop Chrome 200% | `[ ]` |
| Z2 | Layout funciona em 320px de largura (reflow WCAG 1.4.10) | | `[ ]` |
| Z3 | Alvos de toque ≥ 44×44px em mobile (WCAG 2.5.8) | Mobile 375px | `[ ]` |
| Z4 | Texto usa unidades relativas (`rem`/`em`), não `px` fixo | | `[ ]` |

---

## 7. Heurísticas de Nielsen

| # | Heurística | Item verificado | Resultado |
|---|-----------|-----------------|-----------|
| N1 | **H1 — Visibilidade do status** — Feedback imediato em ações (loading, erro, sucesso) | | `[ ]` |
| N2 | **H2 — Match com o mundo real** — Labels e termos reconhecíveis pelo usuário-alvo | | `[ ]` |
| N3 | **H3 — Controle e liberdade** — Cancelar/desfazer disponível em ações destrutivas | | `[ ]` |
| N4 | **H4 — Consistência** — Mesmos componentes para mesmas funções em todo o produto | | `[ ]` |
| N5 | **H5 — Prevenção de erros** — Confirmação antes de ações irreversíveis | | `[ ]` |
| N6 | **H6 — Reconhecimento > Recall** — Opções e ações visíveis, sem memorização | | `[ ]` |
| N7 | **H7 — Flexibilidade** — Atalhos de teclado disponíveis para usuários avançados | | `[ ]` |
| N8 | **H8 — Estética e minimalismo** — Sem informação irrelevante na tela principal | | `[ ]` |
| N9 | **H9 — Ajuda a reconhecer e corrigir erros** — Mensagens de erro em linguagem clara | | `[ ]` |
| N10 | **H10 — Documentação e ajuda** — Onboarding / tooltips / help disponível no contexto | | `[ ]` |

---

## 8. Teste com Tecnologia Assistiva (cadência trimestral)

> **Ferramentas recomendadas:** NVDA (Windows) · VoiceOver (macOS/iOS) · TalkBack (Android)

| # | Critério | Ferramenta usada | Resultado |
|---|----------|-----------------|-----------|
| AT1 | Leitor de tela anuncia corretamente o nome e role de todos os botões | | `[ ]` |
| AT2 | Formulários navegáveis e preenchíveis apenas com leitor de tela | | `[ ]` |
| AT3 | Modais, drawers e tooltips anunciados ao abrir | | `[ ]` |
| AT4 | Tabelas têm `<caption>` ou `aria-label` e headers de coluna corretos | | `[ ]` |
| AT5 | Componentes de gráfico têm alternativa textual ou `aria-label` descritivo | | `[ ]` |

---

## 9. Aprovação

| Campo | Valor |
|-------|-------|
| **Tela / Componente** | |
| **Release / PR** | |
| **Data** | |
| **QA responsável** | |
| **Resultado final** | `[ ] Aprovado` `[ ] Aprovado com ressalvas` `[ ] Reprovado` |
| **Observações** | |

> Ressalvas devem ser documentadas como `a11y-debt` com prazo de resolução em no máximo 2 sprints.
