---
applyTo: "src/**/*.{vue,ts}"
description: >
  Data visualization para dashboards e relatórios (console-app): escolha de gráfico por forma de dado,
  acessibilidade de gráficos, cor a partir de tokens, formatação financeira BRL, estados (loading/empty/error),
  responsividade e anti-chart-junk. Integra com design-tokens, theming, ui-states e i18n.
---

# Data Visualization

## Princípio

**Um gráfico existe para responder uma pergunta mais rápido que uma tabela — não para decorar.**
Se o gráfico não torna um padrão (tendência, comparação, proporção, distribuição) mais óbvio que os números crus, ele é ruído. Em produto financeiro, clareza de dado é confiança: um eixo enganoso ou uma escala truncada não é só feio, é potencialmente uma informação incorreta sobre o dinheiro do usuário.

> Maximize a razão dado/tinta (Tufte). Cada pixel deve representar dado ou ajudar a lê-lo. O resto é chart junk.

---

## Escolha do Gráfico — Por Forma de Dado

A pergunta determina o gráfico, não o gosto:

| Pergunta do usuário | Forma de dado | Gráfico | Evitar |
|---------------------|---------------|---------|--------|
| Como mudou ao longo do tempo? | Série temporal | **Linha** / área | Pizza |
| Como categorias se comparam? | Categórico | **Barra** (horizontal se labels longos) | Pizza com muitas fatias |
| Qual a composição do todo? | Parte/todo | **Barra empilhada** / treemap | Pizza com >5 fatias |
| Qual a proporção (poucas partes)? | Parte/todo ≤4 | **Pizza/donut** (≤4 fatias) | Pizza com 8 fatias |
| Como duas variáveis se relacionam? | Correlação | **Dispersão** (scatter) | Linha |
| Qual a distribuição? | Distribuição | **Histograma** / box plot | Barra simples |
| Qual o valor único atual? | Escalar | **Big number / KPI card** | Gráfico para 1 valor |

### Regras de escolha
- **Pizza/donut: máximo 4 fatias** e só quando proporção parte/todo é a pergunta. Acima disso → barra.
- **Não usar 3D, jamais** — distorce a percepção de área/volume.
- KPI único (saldo, total) → **big number**, não um gráfico de 1 ponto.
- Quando em dúvida entre pizza e barra → **barra** (humanos comparam comprimento melhor que ângulo).

**BLOCKER:** Pizza com >5 fatias; gráfico 3D; gráfico que distorce o dado (ver §Integridade).

---

## Integridade do Dado (crítico em produto financeiro)

```
❌ NUNCA truncar o eixo Y em gráfico de barras (exagera diferenças)
   → barra DEVE começar em zero
✅ Linha PODE ter eixo Y não-zero (foco em variação) — mas sinalizar claramente

❌ NUNCA usar escalas inconsistentes para comparar séries lado a lado
❌ NUNCA omitir unidade/período (R$? %? mês? ano?)
✅ SEMPRE rotular eixos com unidade e período
✅ SEMPRE deixar explícito quando dado é projeção/estimativa vs realizado
```

**BLOCKER:** Eixo Y de gráfico de barras truncado (não inicia em zero) — distorce a leitura de valores financeiros.

---

## Cor — A Partir dos Tokens

Cor em gráfico segue a mesma disciplina de tokens (ver `design-tokens.instructions.md`) e os papéis semânticos (ver `ux-principles.instructions.md` §8).

```ts
// src/charts/palette.ts — paleta categórica derivada de tokens
export const chartPalette = [
  'var(--color-teal-500)',   // série 1 (marca)
  'var(--color-blue-500)',
  'var(--color-amber-500)',
  'var(--color-teal-300)',
  'var(--color-gray-500)',
]

// Cor semântica para dado com significado
export const semanticChartColors = {
  positive: 'var(--color-feedback-success)',  // crescimento, lucro
  negative: 'var(--color-feedback-danger)',   // queda, perda
  neutral:  'var(--color-text-muted)',
}
```

### Regras de cor
- Paleta categórica derivada de tokens — nunca hex aleatório.
- **Sequencial** (1 hue, claro→escuro) para dado ordenado/intensidade.
- **Divergente** (2 hues a partir de um centro) para dado com ponto neutro (acima/abaixo da meta).
- **Categórica** (hues distintos) para categorias sem ordem.
- Máximo **6 cores categóricas** — além disso ninguém distingue. Agrupe o resto em "Outros".
- Verde=positivo / vermelho=negativo é convenção financeira — respeitar, mas **nunca só cor**.
- Adaptar ao tema: cores de gráfico devem ter contraste adequado em light **e** dark (ver `theming.instructions.md`).

---

## Acessibilidade de Gráficos (frequentemente esquecida)

Um gráfico inacessível exclui usuários e viola WCAG. Regras obrigatórias:

```
1. NÃO depender só de cor → usar padrão/textura/rótulo direto + cor
2. Rótulo de dado direto na série quando possível (reduz ida-volta à legenda)
3. Texto alternativo descrevendo a conclusão do gráfico (não só "gráfico de barras")
4. Tabela de dados como fallback acessível (toggle "ver dados")
5. Contraste de texto/eixos ≥4.5:1; linhas/barras ≥3:1 com o fundo
6. Tooltip acessível por teclado e foco, não só hover
```

```vue
<figure>
  <figcaption class="sr-only">
    Volume de propostas por mês em 2025: tendência de crescimento de
    120 em janeiro para 340 em junho, com queda pontual em março.
  </figcaption>

  <!-- gráfico (canvas/svg) com aria-hidden, a informação vai no figcaption + tabela -->
  <div role="img" aria-label="Gráfico de linha: volume de propostas por mês, crescente">
    <BaseLineChart :data="dados" :palette="chartPalette" />
  </div>

  <!-- Fallback de dados — toggle -->
  <details class="mt-2">
    <summary class="text-action text-caption cursor-pointer min-h-[44px]">Ver dados em tabela</summary>
    <table class="w-full text-caption mt-2">
      <caption class="sr-only">Volume de propostas por mês</caption>
      <thead><tr><th scope="col">Mês</th><th scope="col">Propostas</th></tr></thead>
      <tbody>
        <tr v-for="d in dados" :key="d.mes"><td>{{ d.mes }}</td><td>{{ d.valor }}</td></tr>
      </tbody>
    </table>
  </details>
</figure>
```

**BLOCKER:** Gráfico sem alternativa textual/tabular acessível; séries distinguíveis apenas por cor.

---

## Formatação de Valores (BRL / %)

Usar `Intl` (ver `i18n.instructions.md`) — nunca formatação manual.

```ts
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 })
const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })

brl.format(69000)      // "R$ 69.000,00"
pct.format(0.125)      // "12,5%"
compact.format(1500000) // "1,5 mi" — para eixos densos
```

### Regras de formatação
- Eixos com valores grandes → notação compacta (`1,5 mi`, `340 mil`) para não poluir.
- Tooltip → valor completo formatado (`R$ 1.500.000,00`).
- Percentuais sempre com a unidade `%` e casas decimais consistentes.
- Período/unidade sempre rotulado no eixo ou título.

---

## Estados do Gráfico (loading / empty / error)

Gráficos dependem de dados assíncronos → exigem os 3 estados (ver `ui-states.instructions.md`).

```vue
<template>
  <!-- LOADING: skeleton com a forma do gráfico, não spinner genérico -->
  <div v-if="isLoading" class="animate-pulse h-64 bg-surface-subtle rounded-token-lg"
       role="status" aria-label="Carregando gráfico" />

  <!-- ERROR: mensagem + retry (nunca gráfico vazio sem explicação) -->
  <div v-else-if="error" role="alert" class="h-64 flex flex-col items-center justify-center">
    <p class="text-default font-medium">Não foi possível carregar o gráfico</p>
    <button class="mt-2 text-action underline min-h-[44px]" @click="retry">Tentar novamente</button>
  </div>

  <!-- EMPTY: dado vazio é diferente de erro -->
  <div v-else-if="!dados.length" class="h-64 flex flex-col items-center justify-center text-center">
    <p class="text-muted">Nenhum dado no período selecionado</p>
    <button class="mt-2 text-action underline min-h-[44px]" @click="ampliarPeriodo">Ampliar período</button>
  </div>

  <!-- CONTENT -->
  <figure v-else>...</figure>
</template>
```

**BLOCKER:** Gráfico que mostra área em branco quando não há dados (sem distinguir loading/empty/error).

---

## Responsividade e Performance

```
RESPONSIVIDADE
  - Container-based sizing (ResizeObserver), não largura fixa
  - Mobile: reduzir densidade — menos ticks, labels rotacionados ou abreviados
  - Em telas pequenas, considerar trocar gráfico denso por big numbers / sparkline

PERFORMANCE (ver performance.instructions.md)
  - Datasets grandes (>1k pontos): agregar/downsample antes de renderizar
  - Lazy load da lib de gráfico (import dinâmico) — não no bundle inicial
  - Canvas para muitos pontos; SVG para poucos e interativos
  - Debounce em re-render por resize/filtro
```

---

## Escolha de Biblioteca

- Preferir lib leve e tree-shakeable; importar **dinamicamente** (não no bundle crítico).
- Wrapper de componente próprio (`BaseLineChart`, `BaseBarChart`) que **consome tokens e formatação** — telas nunca configuram a lib diretamente (encapsula a decisão e mantém consistência).
- Se existir componente de chart no DS Dock, usar o do DS (ver `dock-ds` skill) antes de adicionar lib externa.

---

## Checklist de Data Viz

```
ESCOLHA & INTEGRIDADE
  [ ] Tipo de gráfico adequado à pergunta/forma do dado?
  [ ] Pizza só com ≤4 fatias? Sem 3D?
  [ ] Eixo Y de barras começa em zero?
  [ ] Eixos rotulados com unidade e período?

COR & TEMA
  [ ] Cores derivadas de tokens (não hex aleatório)?
  [ ] ≤6 cores categóricas?
  [ ] Contraste adequado em light E dark?
  [ ] Não depende só de cor para distinguir séries?

ACESSIBILIDADE
  [ ] Alternativa textual (figcaption descrevendo a conclusão)?
  [ ] Tabela de dados como fallback?
  [ ] Tooltip acessível por teclado?

ESTADOS & FORMATO
  [ ] Loading (skeleton com forma), empty e error distintos?
  [ ] Valores formatados com Intl (BRL/%)?
  [ ] Notação compacta em eixos densos?

PERFORMANCE
  [ ] Lib carregada dinamicamente?
  [ ] Datasets grandes agregados/downsampled?
  [ ] Sizing responsivo (ResizeObserver)?
```

## Anti-Patterns de Data Viz

```
❌ Gráfico 3D (distorce percepção de área/volume)
❌ Pizza com >5 fatias (ninguém compara ângulos pequenos)
❌ Eixo Y truncado em barras (exagera diferenças — engana sobre valores)
❌ Gráfico para um único valor (use big number)
❌ Cores hardcoded em vez de tokens
❌ >6 cores categóricas (indistinguíveis)
❌ Séries distinguíveis só por cor (exclui daltônicos)
❌ Gráfico sem alternativa textual/tabular (inacessível)
❌ Área em branco quando vazio (sem distinguir loading/empty/error)
❌ Formatação manual de moeda em vez de Intl
❌ Lib de gráfico pesada no bundle inicial
❌ Renderizar 10k pontos sem agregação (trava a UI)
❌ Chart junk: grids pesadas, sombras, gradientes decorativos, legendas redundantes
```
