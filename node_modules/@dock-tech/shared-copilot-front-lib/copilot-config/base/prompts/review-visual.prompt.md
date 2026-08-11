---
description: "Comparar implementação atual com referência visual (screenshot/Figma) e listar divergências ponto a ponto."
name: "Review Visual"
argument-hint: "Componente ou tela para revisar (ex: 'SimuladorSection' ou 'tela de proposta')"
tools: [read, search, execute, web]
---

# Workflow: Review Visual

## 1. Obter Referências

- Pedir screenshot da **implementação atual** (ou tirar via browser tools)
- Pedir **referência do Figma** (print, nó, ou arquivo)
- Se DESIGN_SYSTEM.md existir, ler como complemento

## 2. Análise em 6 Dimensões

Comparar implementação vs referência em:

### 2.1 Cores
- Hex exatos conferem? (usar DESIGN_SYSTEM.md como verdade)
- Backgrounds das seções corretos?
- Textos com cor certa por hierarquia?

### 2.2 Tipografia
- Fonte correta (Roboto vs Red Hat Display vs outra)?
- Peso correto (regular/medium/bold)?
- Tamanho em px confere?
- Quantidade de linhas confere?

### 2.3 Espaçamento
- Padding interno dos containers?
- Gap entre elementos?
- Margin entre seções?

### 2.4 Alinhamento
- Centralizado onde deveria ser centralizado?
- Left-aligned onde deveria ser left?
- Elementos na mesma baseline?

### 2.5 Hierarquia Visual
- Elemento mais importante é mais proeminente?
- CTAs se destacam?
- Informação secundária é visualmente menor?

### 2.6 Estados
- Hover, focus, active, disabled — todos implementados?
- Estado selecionado vs normal diferenciados?
- Loading states quando aplicável?

## 3. Gerar Relatório

Para cada divergência encontrada, reportar no formato:

```
[BLOCKER|WARNING|INFO] {componente/seção} — {descrição} — {fix sugerido}
```

- **BLOCKER**: Divergência grave (cor errada, componente faltando, layout quebrado)
- **WARNING**: Divergência menor (espaçamento 2px off, peso ligeiramente diferente)
- **INFO**: Observação (oportunidade de melhoria, não é divergência)

## 4. Validação Programática

Rodar `npm run validate:design` como complemento para detectar:
- Cores fora do allowlist
- Fontes proibidas
- Problemas de contraste

## 5. Propor Fixes

Para cada BLOCKER e WARNING, fornecer o código específico que corrige.
Perguntar ao usuário antes de aplicar.
