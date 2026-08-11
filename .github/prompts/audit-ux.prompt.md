---
description: >
  Auditoria UX completa de uma tela ou componente.
  Analisa hierarquia visual, leis de UX, estados de componente, microcopy,
  acessibilidade e carga cognitiva. Produz relatório com BLOCKERs e WARNINGs.
mode: agent
tools: read, search, execute
argument-hint: "Nome ou path da tela/componente a auditar (ex: PropostaScreen.vue)"
---

# Auditoria UX — Protocolo Completo

Você foi chamado para realizar uma **auditoria UX rigorosa** da tela/componente: `{{TELA_OU_COMPONENTE}}`.

## Fase 1 — Preparação (executar antes da análise)

1. Ler `copilot-config/base/skills/frontend-master/SKILL.md` para ter o framework de referência.
2. Ler o código do componente/tela alvo.
3. Ler `DESIGN_SYSTEM.md` se existir.
4. Identificar:
   - Tipo de tela (formulário / listagem / dashboard / fluxo / landing)
   - Objetivo principal do usuário nesta tela
   - Número de ações/campos/elementos interativos

---

## Fase 2 — Auditoria em 10 Dimensões

### DIMENSÃO 1: Hierarquia Visual

**Analisar:**
- Existe exatamente 1 elemento PRIMÁRIO dominante?
- Os elementos SECUNDÁRIOS são visivelmente subordinados?
- Quantos tamanhos de fonte são usados? (max 3)
- Espaçamento segue grade de 4px?

**Critério BLOCKER:** Hierarquia plana; múltiplos primários; >4 tamanhos de fonte.
**Critério WARNING:** >3 pesos de fonte; espaçamento inconsistente com grade 4px.

---

### DIMENSÃO 2: Densidade de Informação (Hick + Miller)

**Analisar:**
- Quantas ações primárias são visíveis simultaneamente? (max 3)
- Formulário tem >6 campos? Progressive disclosure aplicado?
- Listas têm >10 itens? Paginação/agrupamento presente?
- O usuário consegue processar a tela sem sobrecarga?

**Critério BLOCKER:** >3 ações primárias simultâneas; formulário com >8 campos planos.
**Critério WARNING:** Formulário com 6-8 campos sem agrupamento semântico.

---

### DIMENSÃO 3: Tamanhos de Alvo (Fitts)

**Analisar:**
- Todos os elementos interativos têm ≥44px de altura?
- CTA principal é o maior elemento interativo?
- Ícones clicáveis sem label têm área de clique ≥44×44px?

**Critério BLOCKER:** Alvos <44px em contexto mobile; CTA menor que secundários.

---

### DIMENSÃO 4: Feedback e Estados (Doherty)

**Analisar:**
- Botões de submit têm loading state?
- Operações assíncronas têm skeleton/spinner?
- Todas as ações têm feedback visual imediato?
- Todos os estados do componente estão implementados?

Verificar estado a estado para cada componente interativo:
```
Botão:    idle ✓/✗ | hover ✓/✗ | focus ✓/✗ | active ✓/✗ | loading ✓/✗ | disabled ✓/✗
Input:    empty ✓/✗ | focus ✓/✗ | filled ✓/✗ | error ✓/✗ | disabled ✓/✗
Select:   closed ✓/✗ | open ✓/✗ | selected ✓/✗ | error ✓/✗ | disabled ✓/✗
```

**Critério BLOCKER:** Botão de submit sem loading; ação sem qualquer feedback.
**Critério WARNING:** Estado de sucesso ausente; validação faltando.

---

### DIMENSÃO 5: Validação e Erros

**Analisar:**
- Campos com formato conhecido têm máscara?
- Validação acontece no blur (não keystroke)?
- Mensagens de erro são específicas e instruem correção?
- Campos obrigatórios são indicados visualmente?

**Critério BLOCKER:** Mensagem de erro genérica ("Erro" sem contexto); ausência de máscara em CPF/CNPJ/moeda.
**Critério WARNING:** Validação no submit sem scroll ao primeiro erro; erro só na cor sem ícone.

---

### DIMENSÃO 6: Microcopy e Clareza

**Analisar:**
- Títulos comunicam claramente o propósito da tela?
- Labels de campo são descritivas (não apenas "Nome")?
- Botões têm verbos de ação (não apenas "OK")?
- Empty states têm CTA para próximo passo?
- Mensagem de sucesso confirma O QUE foi feito?
- Teste dos 3 segundos: usuário entende onde está + o que fazer + ação principal?

**Critério BLOCKER:** Falha no teste dos 3 segundos; CTA sem verbo de ação.
**Critério WARNING:** Empty state sem CTA; sucesso genérico ("Operação realizada").

---

### DIMENSÃO 7: Padrões e Consistência (Jakob's Law)

**Analisar:**
- Botões de ação em dialog: Cancelar esquerda, Confirmar direita?
- Erros de campo: abaixo do input, cor #dc3545?
- Navegação: posição padrão?
- Comportamento coerente com outros componentes da mesma aplicação?

**Critério BLOCKER:** Ações invertidas em modal (Confirmar esquerda); erro acima do campo.
**Critério WARNING:** Inconsistência de comportamento entre componentes similares.

---

### DIMENSÃO 8: Fluxo Multi-step (Goal-Gradient)

**Analisar (se aplicável):**
- Fluxo com ≥3 etapas tem progress indicator?
- Usuário sabe em qual etapa está e quantas restam?
- Navegação para etapa anterior é possível?

**Critério BLOCKER:** Fluxo ≥3 etapas sem indicador de progresso.
**Critério WARNING:** Progress indicator sem indicação numérica ("Etapa X de Y").

---

### DIMENSÃO 9: Acessibilidade Básica (WCAG 2.2 AA)

**Analisar:**
- Contraste de texto: ≥4.5:1 para texto normal, ≥3:1 para texto grande?
- Focus ring visível em todos os interativos?
- Labels associadas a todos os inputs (for/id ou aria-label)?
- Erros anunciados via `role="alert"`?
- Cor não é único comunicador de estado?
- Alvos mínimos ≥44×44px?

**Critério BLOCKER:** Contraste <4.5:1; input sem label; cor como único comunicador de erro.
**Critério WARNING:** Focus ring pouco visível; `aria-describedby` faltando nos erros.

---

### DIMENSÃO 10: Performance Perceptual

**Analisar:**
- Skeleton screens para conteúdo assíncrono?
- Imagens têm `width` e `height` para evitar CLS?
- Animações usam apenas `opacity`/`transform` (sem width/height)?
- `prefers-reduced-motion` respeitado?

**Critério WARNING:** Imagens sem dimensões; animações em propriedades de layout.

---

## Fase 3 — Relatório de Auditoria

Emitir o relatório completo:

```markdown
# Auditoria UX — {Nome da Tela/Componente}
**Data:** {data}
**Tipo:** {formulário / listagem / dashboard / fluxo / landing}
**Objetivo do usuário:** {identificado}

---

## 🔴 BLOCKERS — {N} encontrados

| # | Dimensão | Problema | Evidência (linha/elemento) | Fix |
|---|----------|----------|---------------------------|-----|
| 1 | ... | ... | ... | ... |

---

## 🟡 WARNINGS — {N} encontrados

| # | Dimensão | Problema | Impacto | Fix sugerido |
|---|----------|----------|---------|-------------|
| 1 | ... | ... | ... | ... |

---

## ✅ Dimensões aprovadas

- ✅ Dimensão X — [observação positiva]
- ✅ Dimensão Y — [observação positiva]

---

## Score de Qualidade UX

| Dimensão | Status |
|----------|--------|
| Hierarquia Visual | 🔴 / 🟡 / 🟢 |
| Densidade de Informação | 🔴 / 🟡 / 🟢 |
| Tamanhos de Alvo | 🔴 / 🟡 / 🟢 |
| Feedback e Estados | 🔴 / 🟡 / 🟢 |
| Validação e Erros | 🔴 / 🟡 / 🟢 |
| Microcopy e Clareza | 🔴 / 🟡 / 🟢 |
| Padrões (Jakob) | 🔴 / 🟡 / 🟢 |
| Fluxo Multi-step | 🔴 / 🟡 / N/A |
| Acessibilidade | 🔴 / 🟡 / 🟢 |
| Performance Perceptual | 🔴 / 🟡 / 🟢 |

**Score Total:** {N}/10 dimensões aprovadas

---

## Resultado Final

### ❌ REPROVADO — {N} BLOCKERs impedem entrega
**Próximos passos:** Corrigir os {N} BLOCKERs listados acima antes de considerar a tela entregável.

OU

### ⚠️ APROVADO COM RESSALVAS — {N} WARNINGs devem ser corrigidos antes do merge
**Próximos passos:** Endereçar os WARNINGs no mesmo PR ou criar tasks para o próximo ciclo.

OU

### ✅ APROVADO — Interface atende aos padrões de qualidade UX
**Recomendação:** Validar com usuário real para capturar insights qualitativos.

---

## Plano de Correção Priorizado

1. [BLOCKER-1] {fix exato}
2. [BLOCKER-2] {fix exato}
3. [WARNING-1] {fix sugerido}
...
```

---

## Regras do Protocolo

- **Ser específico:** citar linha do código, nome do elemento, valor de CSS quando possível.
- **Propor o fix:** não apenas apontar o problema, mas mostrar o código correto.
- **Não inventar:** só reportar o que tem evidência concreta no código/print.
- **Não opinar subjetivamente:** "acho que ficaria mais bonito" não é BLOCKER.
- **Priorizar:** BLOCKERs primeiro, WARNINGs depois.
