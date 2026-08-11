---
name: figma-generate-library
description: "Constrói ou atualiza a biblioteca do Design System Dock no Figma a partir do codebase Vue 3 (shared-design-system-vue-lib). Use quando o time DS quiser sincronizar componentes Ds* para o Figma como componentes nativos com tokens/variáveis, criar coleções de variáveis a partir de dist/tokens.css, configurar temas (light/dark), documentar fundações, ou reconciliar divergências entre código e Figma. Este skill ensina O QUE construir e EM QUE ORDEM — ele complementa o skill `figma-use` que ensina COMO chamar a Plugin API. Ambos os skills devem ser carregados juntos."
argument-hint: "Escopo da sincronização (ex: 'tokens', 'DsButton', 'todos os componentes', 'fase 0 discovery')"
---

# Design System Builder — Figma MCP Skill (Dock)

Constrói bibliotecas de design system profissionais no Figma a partir do `shared-design-system-vue-lib`.
Este skill orquestra workflows multi-fase com 20–100+ chamadas `use_figma`, aplicando padrões
validados em design systems reais.

> **Pré-requisito obrigatório:** O skill `figma-use` DEVE estar carregado para toda chamada `use_figma`.
> Ele fornece as regras de sintaxe da Plugin API (padrão return, reset de página, retorno de IDs,
> carregamento de fontes, escala de cores). Este skill fornece o domínio de design system e a
> orquestração do workflow.

> ⚠️ **Acesso de escrita necessário:** Este skill realiza mutações no arquivo Figma da Dock.
> Antes de iniciar, confirme que a conta conectada ao Figma MCP tem permissão de **edição** no
> arquivo-alvo. Sem acesso de escrita, todas as chamadas `use_figma` de criação falharão.

> **Sempre passe `skillNames: "figma-generate-library"` ao chamar `use_figma` como parte deste skill.**
> É um parâmetro de logging — não afeta a execução.

---

## 1. A Regra Mais Importante

**Esta tarefa NUNCA é de um único passo.** Construir um design system requer 20–100+ chamadas
`use_figma` distribuídas em múltiplas fases, com checkpoints obrigatórios do usuário entre elas.
Qualquer tentativa de criar tudo em uma só chamada PRODUZIRÁ resultados quebrados, incompletos
ou irrecuperáveis. Quebre cada operação na menor unidade útil, valide, receba feedback, prossiga.

---

## 2. Contexto do `shared-design-system-vue-lib`

### Componentes

O pacote expõe **80+ componentes** Vue 3 com prefixo `Ds*`:

- **Formulários:** `DsInput`, `DsSelect`, `DsCheckbox`, `DsRadio`, `DsTextarea`, `DsSwitch`
- **Ação:** `DsButton`, `DsIconButton`, `DsDropdown`
- **Navegação:** `DsTabs`, `DsBreadcrumb`, `DsPagination`, `DsSidebar`
- **Feedback:** `DsToast`, `DsAlert`, `DsModal`, `DsTooltip`, `DsProgress`
- **Display:** `DsCard`, `DsBadge`, `DsAvatar`, `DsTag`, `DsTable`, `DsAccordion`
- **Layout:** `DsDivider`, `DsSkeleton`, `DsSpinner`

Cada componente é um Vue 3 SFC (`.vue`) no monorepo do Design System.

### Tokens CSS

Os tokens de design estão em `dist/tokens.css` e seguem a convenção de CSS custom properties:

```css
/* Cores primitivas */
--ds-color-blue-50 … --ds-color-blue-900
--ds-color-gray-50 … --ds-color-gray-900
--ds-color-green-*, --ds-color-red-*, --ds-color-yellow-*

/* Cores semânticas */
--ds-color-primary, --ds-color-primary-hover, --ds-color-primary-active
--ds-color-text-primary, --ds-color-text-secondary, --ds-color-text-disabled
--ds-color-bg-primary, --ds-color-bg-secondary, --ds-color-surface
--ds-color-border-default, --ds-color-border-focus

/* Espaçamento */
--ds-spacing-xs (4px), --ds-spacing-sm (8px), --ds-spacing-md (16px)
--ds-spacing-lg (24px), --ds-spacing-xl (32px), --ds-spacing-2xl (48px)

/* Tipografia */
--ds-font-size-xs … --ds-font-size-2xl
--ds-font-weight-regular, --ds-font-weight-medium, --ds-font-weight-bold
--ds-line-height-tight, --ds-line-height-normal, --ds-line-height-relaxed

/* Raios */
--ds-radius-sm (4px), --ds-radius-md (8px), --ds-radius-lg (16px), --ds-radius-full (9999px)

/* Sombras */
--ds-shadow-sm, --ds-shadow-md, --ds-shadow-lg
```

> Leia `dist/tokens.css` na fase de discovery para obter a lista canônica e atualizada de tokens.

### Convenção de code syntax no Figma

Sempre use o wrapper `var()` na sintaxe WEB:
```
var(--ds-color-primary)      ← correto
--ds-color-primary           ← incorreto
```

---

## 3. Workflow Obrigatório

Toda construção/atualização segue esta ordem de fases. Pular ou reordenar fases causa falhas
estruturais caras de desfazer.

```
Fase 0: DISCOVERY (sempre primeiro — nenhuma escrita use_figma ainda)
  0a. Analisar codebase → ler dist/tokens.css, listar componentes Ds*, convenções de naming
  0b. Inspecionar arquivo Figma → páginas, variáveis, componentes, estilos, convenções existentes
  0c. Buscar bibliotecas subscritas → search_design_system para assets reutilizáveis
  0d. Fechar escopo v1 → acordar o conjunto exato de tokens + lista de componentes antes de criar
  0e. Mapear código → Figma → resolver conflitos (código e Figma divergem = perguntar ao usuário)
  ✋ CHECKPOINT DO USUÁRIO: apresentar plano completo, aguardar aprovação explícita

Fase 1: FUNDAÇÕES (tokens primeiro — sempre antes dos componentes)
  1a. Criar coleções de variáveis e modos (primitivos 1 modo; Color Light/Dark; Spacing 1 modo)
  1b. Criar variáveis primitivas (valores brutos, 1 modo)
  1c. Criar variáveis semânticas (alias de primitivos, mode-aware)
  1d. Definir scopes em TODAS as variáveis
  1e. Definir code syntax em TODAS as variáveis (WEB com var())
  1f. Criar estilos de efeito (sombras ds-shadow-*) e estilos de texto (tipografia)
  → Critério de saída: todos os tokens do plano existem, scopes definidos, code syntax definido
  ✋ CHECKPOINT DO USUÁRIO: mostrar resumo de variáveis, aguardar aprovação

Fase 2: ESTRUTURA DO ARQUIVO (antes dos componentes)
  2a. Criar skeleton de páginas: Cover → Getting Started → Foundations → --- → Components → --- → Utilities
  2b. Criar páginas de documentação de fundações (swatches de cores, espécimes de tipo, barras de espaçamento)
  → Critério de saída: todas as páginas planejadas existem, docs de fundações navegáveis
  ✋ CHECKPOINT DO USUÁRIO: mostrar lista de páginas + screenshot, aguardar aprovação

Fase 3: COMPONENTES (um de cada vez — nunca em lote)
  Para CADA componente Ds* (em ordem de dependência: atoms antes de molecules):
    3a. Criar página dedicada
    3b. Construir componente base com auto-layout + bindings completos de variáveis
    3c. Criar todas as combinações de variantes (combineAsVariants + grid layout)
    3d. Adicionar component properties (TEXT, BOOLEAN, INSTANCE_SWAP)
    3e. Vincular properties a nós filhos
    3f. Adicionar documentação de página (título, descrição, notas de uso)
    3g. Validar: get_metadata (estrutura) + get_screenshot (visual)
    3h. Opcional: mapeamento lightweight de Code Connect enquanto o contexto está fresco
    → Critério de saída: contagem de variantes correta, todos os bindings verificados, screenshot correto
    ✋ CHECKPOINT DO USUÁRIO por componente: mostrar screenshot, aguardar aprovação antes do próximo

Fase 4: INTEGRAÇÃO + QA (passagem final)
  4a. Finalizar todos os mapeamentos de Code Connect
  4b. Auditoria de acessibilidade (contraste, touch targets mínimos, visibilidade de foco)
  4c. Auditoria de naming (sem duplicatas, sem nós sem nome, casing consistente)
  4d. Auditoria de bindings não resolvidos (nenhum fill/stroke hardcoded restante)
  4e. Screenshots finais de revisão de cada página
  ✋ CHECKPOINT DO USUÁRIO: aprovação final completa
```

---

## 4. Regras Críticas

**Fundamentos da Plugin API** (do skill figma-use — aplicados aqui também):
- Use `return` para enviar dados de volta (auto-serializado). NÃO envolva em IIFE nem chame closePlugin.
- Retorne TODOS os IDs de nós criados/mutados em cada valor de retorno
- Contexto de página reinicia a cada chamada — sempre `await figma.setCurrentPageAsync(page)` no início
- `figma.notify()` lança exceção — nunca use
- Cores estão na escala 0–1, não 0–255
- Fonte DEVE ser carregada antes de qualquer escrita de texto: `await figma.loadFontAsync({family, style})`

**Regras de design system:**
1. **Variáveis ANTES de componentes** — componentes se vinculam a variáveis. Sem token = sem componente.
2. **Inspecione antes de criar** — execute `use_figma` somente-leitura para descobrir convenções existentes. Siga-as.
3. **Uma página por componente** *(padrão)* — exceção: famílias estreitamente relacionadas (ex: Input + helpers) podem compartilhar página com separação clara de seções.
4. **Vincule propriedades visuais a variáveis** *(padrão)* — fills, strokes, padding, radius, gap. Exceções: geometria intencionalmente fixa (pixel-grid de ícones, divisores estáticos).
5. **Scopes em toda variável** — NUNCA deixe como `ALL_SCOPES`. Background: `FRAME_FILL, SHAPE_FILL`. Texto: `TEXT_FILL`. Borda: `STROKE_COLOR`. Espaçamento: `GAP`. Raios: `CORNER_RADIUS`. Primitivos: `[]` (oculto).
6. **Code syntax em toda variável** — sintaxe WEB DEVE usar o wrapper `var()`: `var(--ds-color-bg-primary)`. Use o nome exato da CSS variable de `dist/tokens.css`.
7. **Alias semânticos para primitivos** — `{ type: 'VARIABLE_ALIAS', id: primitiveVar.id }`. Nunca duplique valores brutos na camada semântica.
8. **Posicione variantes após combineAsVariants** — elas empilham em (0,0). Faça grid-layout + resize manualmente.
9. **INSTANCE_SWAP para ícones** — nunca crie uma variante por ícone. Limite matrizes de variantes: se Tamanho × Estilo × Estado > 30 combinações, divida em sub-componente.
10. **Naming determinístico** — use nomes de nós consistentes e únicos para limpeza e retomada idempotentes. Rastreie IDs de nós criados via valores de retorno e o ledger de estado.
11. **Sem limpeza destrutiva** — scripts de limpeza identificam nós por convenção de nome ou IDs retornados, não por suposição.
12. **Valide antes de prosseguir** — nunca construa sobre trabalho não validado. `get_metadata` após cada criação, `get_screenshot` após cada componente.
13. **NUNCA paralelize chamadas `use_figma`** — mutações de estado do Figma devem ser estritamente sequenciais.
14. **Nunca aluciné Node IDs** — sempre leia IDs do ledger de estado retornado por chamadas anteriores. Nunca reconstrua ou adivinhe um ID de memória.

---

## 5. Gerenciamento de Estado (Obrigatório para Workflows Longos)

> **`getPluginData()` / `setPluginData()` NÃO são suportados em `use_figma`.** Use
> `getSharedPluginData()` / `setSharedPluginData()` (estes SÃO suportados), ou use lookups
> por nome e o ledger de estado (IDs retornados).

| Tipo de entidade | Chave de idempotência | Como verificar existência |
|-----------------|----------------------|--------------------------|
| Nós de cena (páginas, frames, componentes) | `setSharedPluginData('dsb', 'key', value)` ou nome único | `node.getSharedPluginData('dsb', 'key')` ou `page.findOne(n => n.name === 'DsButton')` |
| Variáveis | Nome dentro da coleção | `(await figma.variables.getLocalVariablesAsync()).find(v => v.name === name && v.variableCollectionId === collId)` |
| Estilos | Nome | `getLocalTextStyles().find(s => s.name === name)` |

Marque cada **nó de cena** imediatamente após a criação:
```javascript
node.setSharedPluginData('dsb', 'run_id', RUN_ID);
node.setSharedPluginData('dsb', 'phase', 'phase3');
node.setSharedPluginData('dsb', 'key', 'component/ds-button');
```

**Persistência de estado**: Escreva em disco:
```
/tmp/dsb-state-{RUN_ID}.json
```
Releia este arquivo no início de cada turno. Em workflows longos, o contexto da conversa será
truncado — o arquivo é a fonte da verdade.

Mantenha um ledger de estado:
```json
{
  "runId": "dock-ds-build-001",
  "phase": "phase3",
  "step": "component-ds-button",
  "entities": {
    "collections": { "primitives": "id:...", "color": "id:...", "spacing": "id:..." },
    "variables": { "ds-color-primary": "id:...", "ds-spacing-md": "id:..." },
    "pages": { "Cover": "id:...", "DsButton": "id:..." },
    "components": { "DsButton": "id:..." }
  },
  "pendingValidations": ["DsButton:screenshot"],
  "completedSteps": ["phase0", "phase1", "phase2", "component-ds-avatar"]
}
```

**Verificação de idempotência** antes de cada criação: consulte por nome + ID do ledger. Se existir, pule ou atualize — nunca duplique.

**Protocolo de retomada**: no início da sessão ou após truncamento de contexto, execute um `use_figma` somente-leitura para escanear todas as páginas, componentes, variáveis e estilos por nome para reconstruir o mapa `{key → id}`. Em seguida, releia o arquivo de estado do disco se disponível.

**Prompt de continuação** (passe ao usuário ao retomar em um novo chat):
> "Estou continuando uma construção de design system. Run ID: {RUN_ID}. Carregue o skill figma-generate-library e retome a partir do último passo concluído."

---

## 6. Arquitetura de Tokens — Padrão Dock

O `shared-design-system-vue-lib` tem ~100 tokens → use o padrão **Padrão (50–200 tokens)**:

```
Coleção: "Primitives"    modos: ["Value"]
  ds-color-blue-50 = #EFF6FF … ds-color-blue-900 = #1E3A5F
  ds-color-gray-50 = #F9FAFB … ds-color-gray-900 = #111827
  (leia valores reais de dist/tokens.css)

Coleção: "Color"         modos: ["Light", "Dark"]
  ds-color-primary       → Light: alias blue-600,  Dark: alias blue-400
  ds-color-text-primary  → Light: alias gray-900,  Dark: alias gray-50
  ds-color-bg-primary    → Light: alias white,     Dark: alias gray-900
  ds-color-border-default→ Light: alias gray-200,  Dark: alias gray-700

Coleção: "Spacing"       modos: ["Value"]
  ds-spacing-xs = 4, ds-spacing-sm = 8, ds-spacing-md = 16
  ds-spacing-lg = 24, ds-spacing-xl = 32, ds-spacing-2xl = 48

Coleção: "Typography"    modos: ["Value"]
  ds-font-size-xs … ds-font-size-2xl
  ds-font-weight-regular, ds-font-weight-medium, ds-font-weight-bold

Coleção: "Radius"        modos: ["Value"]
  ds-radius-sm = 4, ds-radius-md = 8, ds-radius-lg = 16, ds-radius-full = 9999
```

---

## 7. Checkpoints do Usuário

Obrigatórios. Decisões de design requerem julgamento humano.

| Após | Artefatos obrigatórios | Pergunta |
|------|----------------------|---------|
| Discovery + escopo fechado | Lista de tokens, lista de componentes, análise de gaps | "Aqui está meu plano. Aprovar antes de criar qualquer coisa?" |
| Fundações | Resumo de variáveis (N coleções, M vars, K modos), lista de estilos | "Todos os tokens criados. Revisar antes da estrutura do arquivo?" |
| Estrutura do arquivo | Lista de páginas + screenshot | "Páginas configuradas. Revisar antes dos componentes?" |
| Cada componente Ds* | get_screenshot da página do componente | "Aqui está o [DsButton] com N variantes. Correto?" |
| Cada conflito (código ≠ Figma) | Mostrar ambas as versões | "O código diz X, o Figma tem Y. Qual prevalece?" |
| QA final | Screenshots por página + relatório de auditoria | "Completo. Aprovação final?" |

**Se o usuário rejeitar**: corrija antes de continuar. Nunca construa sobre trabalho rejeitado.

---

## 8. Convenções de Naming

Corresponda às convenções existentes do arquivo Figma. Para criação do zero:

**Variáveis** (separadas por barra, espelhando os CSS custom properties sem o prefixo `--ds-`):
```
color/primary          color/text/secondary     color/bg/surface
color/border/default   spacing/xs               spacing/md
radius/sm              radius/full              typography/body/font-size
```

**Primitivas**: `color/blue/500`, `color/gray/900`

**Nomes de componentes**: `DsButton`, `DsInput`, `DsCard`, `DsAvatar`, `DsBadge`

**Nomes de variantes**: `Tamanho=Médio, Estilo=Primário, Estado=Padrão`

**Separadores de página**: `---`

---

## 9. Anti-Padrões por Fase

**Fase 0:**
- ❌ Começar a criar qualquer coisa antes de fechar o escopo com o usuário
- ❌ Ignorar convenções existentes do arquivo Figma e impor novas
- ❌ Não ler `dist/tokens.css` como fonte canônica de tokens

**Fase 1:**
- ❌ Usar `ALL_SCOPES` em qualquer variável
- ❌ Duplicar valores brutos na camada semântica em vez de criar aliases
- ❌ Não definir code syntax (quebra o Dev Mode e o round-tripping)
- ❌ Usar nomes de variáveis que não correspondam às CSS custom properties de `dist/tokens.css`

**Fase 2:**
- ❌ Pular a página de cover ou as docs de fundações
- ❌ Colocar múltiplos componentes não relacionados em uma página

**Fase 3:**
- ❌ Criar componentes antes das fundações existirem
- ❌ Hardcodar qualquer valor de fill/stroke/espaçamento/radius em um componente
- ❌ Criar uma variante por ícone (use INSTANCE_SWAP)
- ❌ Não posicionar variantes após combineAsVariants (todas empilham em 0,0)
- ❌ Construir matriz de variantes > 30 sem dividir (explosão de variantes)

**Geral:**
- ❌ Retentar script com falha sem entender o erro
- ❌ Pular checkpoints do usuário para "economizar tempo"
- ❌ Paralelizar chamadas `use_figma` (sempre sequencial)
- ❌ Adivinhar/alucinar node IDs da memória (sempre leia do ledger de estado)
- ❌ Começar Fase 3 porque o usuário disse "construa o botão" sem completar as Fases 0–2

---

## 10. Ordem de Sincronização de Componentes

Sincronize nesta ordem (atoms antes de molecules, componentes sem dependências primeiro):

**Nível 1 — Primitivos visuais** (sem dependências de outros Ds*):
`DsAvatar`, `DsBadge`, `DsTag`, `DsDivider`, `DsSpinner`, `DsSkeleton`

**Nível 2 — Inputs e controles:**
`DsButton`, `DsIconButton`, `DsInput`, `DsCheckbox`, `DsRadio`, `DsSwitch`, `DsTextarea`, `DsSelect`

**Nível 3 — Compostos:**
`DsCard`, `DsAlert`, `DsTooltip`, `DsModal`, `DsToast`, `DsProgress`, `DsAccordion`

**Nível 4 — Navegação e layout:**
`DsTabs`, `DsBreadcrumb`, `DsPagination`, `DsSidebar`, `DsDropdown`, `DsTable`

> Para sessões parciais, complete um nível inteiro antes de iniciar o próximo.
