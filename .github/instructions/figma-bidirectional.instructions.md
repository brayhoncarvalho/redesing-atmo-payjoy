---
applyTo: "**/{dock-ds.config.json,scripts/*,tokens/*,screenshots/*}"
description: "Estratégia bidirecional Figma ↔ Frontend: sync de tokens, screenshots oficiais, export DTCG e pipeline de fidelidade visual."
---

# Figma ↔ Frontend — Estratégia Bidirecional

## Princípio
**Figma é intenção visual; Frontend é implementação real.** A sincronização é bidirecional mas com fontes de verdade separadas por camada.

---

## 1. Direção: Figma → Frontend (Consumo)

### O que sincroniza
| Dado | Mecanismo | Destino |
|------|-----------|---------|
| Cores | `figma-sync.mjs` (API) | `dock-ds.config.json` → `tokens.colors` |
| Fontes | `figma-sync.mjs` (API) | `dock-ds.config.json` → `tokens.fonts` |
| Layout/Composição | Print + análise manual | Componentes Vue |
| Ícones/Imagens | Export manual do Figma | `public/` |
| Node metadata | `figma-sync.mjs` (API) | `figma-node-data.json` |

### Scripts disponíveis
```bash
# Sync tokens do Figma → projeto
npm run figma:sync

# Auditoria de prontidão para modo Figma
npm run figma:audit
```

### Quando rodar
- Diariamente via CI (automático).
- Manualmente quando designer avisa de mudanças.
- Antes de iniciar nova tela em modo Figma.

---

## 2. Direção: Frontend → Figma (Publicação)

### Canal 1: Screenshots Oficiais
**Propósito:** dar ao designer uma referência visual fiel do que está implementado.

```bash
# Gerar screenshots de todas as telas em 3 viewports
npm run screenshots

# Fluxo CI (falha se alguma captura falhar)
npm run screenshots:ci
```

**Output:**
```
screenshots/
  mobile/
    landing.png
    proposta.png
    dados-acesso.png
    ...
  tablet/
    ...
  desktop/
    ...
  manifest.json         ← metadados (data, URLs, resultados)
```

**Uso pelo designer:**
- Importar no Figma como referência (camada travada).
- Comparar implementação vs intenção original.
- Identificar desvios para correção (em qualquer direção).

**Quando gerar:**
- A cada release/milestone.
- Quando PR visual grande é mergeado.
- Antes de handoff para validação do design.
- Automaticamente no workflow `.github/workflows/frontend-screenshots.yml` para publicar artefato de CI.

---

### Canal 2: Export de Tokens (W3C DTCG Format)
**Propósito:** permitir que o designer importe os tokens reais do frontend no Figma.

```bash
# Exportar tokens em formato Design Tokens Community Group
npm run figma:export-tokens
```

**Output:**
```
tokens/
  design-tokens.json    ← formato DTCG (W3C standard)
```

**Formato do arquivo:**
```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "primary": { "$type": "color", "$value": "#00d8d8" },
    "tertiary": { "$type": "color", "$value": "#1cc0c0" },
    ...
  },
  "font": {
    "roboto": { "$type": "fontFamily", "$value": "Roboto" },
    ...
  },
  "spacing": {
    "space-4": { "$type": "dimension", "$value": "16px" },
    ...
  }
}
```

**Como o designer consome no Figma:**
1. Instalar plugin **Tokens Studio for Figma** (gratuito).
2. No plugin, adicionar source → Local/File → importar `design-tokens.json`.
3. Tokens ficam disponíveis como variáveis no Figma.
4. Se o frontend mudar um token, re-exportar e re-importar.

**Alternativa com Style Dictionary:**
```bash
# Se precisar de múltiplos formatos (CSS vars, SCSS, Figma, iOS, Android)
npx style-dictionary build --config style-dictionary.config.json
```

---

### Canal 3: Links para Storybook
**Propósito:** conectar componentes do Figma com a documentação viva.

**Convenção:**
- Cada componente no Figma deve ter um link na description apontando para o Storybook:
  ```
  📖 Storybook: https://storybook.dock.com.br/?path=/docs/components-dockbutton
  ```
- O designer mantém esses links; o dev informa a URL ao criar/atualizar componente.

**Automação possível:**
- Script que gera um JSON de mapeamento componente → URL do Storybook.
- Designer importa esse mapeamento e cola os links.

---

### Canal 4: Visual Diff (Comparação Automática)
**Propósito:** detectar divergências entre screenshot do frontend e frame do Figma.

**Fluxo:**
1. `npm run screenshots` → gera PNGs do frontend.
2. Export dos frames canônicos do Figma (manual ou via API).
3. Comparação pixel-diff entre os dois (ferramentas: `pixelmatch`, `reg-suit`, `BackstopJS`).
4. Relatório de divergências com diff visual.

**Status:** preparado para implementação futura (ponto 5 da roadmap).

---

## 3. Resumo do Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                        FIGMA                                 │
│  (intenção visual, composição, tokens originais)            │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 │                 ▼
  figma-sync.mjs           │         Screenshots importados
  (tokens, metadata)       │         como referência
         │                 │                 ▲
         ▼                 │                 │
┌────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
│  (implementação real, comportamento, acessibilidade)        │
│                                                             │
│  npm run figma:sync          ← Figma → Frontend (tokens)   │
│  npm run figma:export-tokens → Frontend → Figma (DTCG)     │
│  npm run screenshots         → Frontend → Figma (visual)   │
│  npm run figma:audit         ← Validação de prontidão      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Frequência Recomendada

| Ação | Quem | Frequência | Trigger |
|------|------|------------|---------|
| `figma:sync` (CI) | Bot | Diário | Schedule + manual |
| `figma:sync` (local) | Dev | Sob demanda | Designer avisou |
| `figma:export-tokens` | Dev | Por release | Antes de milestone |
| `screenshots` | Dev/CI | Por PR visual | Merge em develop |
| `screenshots:ci` | CI | Por PR visual/manual | Workflow de screenshots |
| Visual diff | CI | Por PR visual (futuro) | PR check |
| Atualizar links Storybook | Dev | Ao criar componente | Manual |

---

## 5. Limitações Conhecidas

| Limitação | Impacto | Mitigação |
|-----------|---------|-----------|
| Screenshots não são editáveis no Figma | Designers não podem manipular elementos | Servem apenas como referência; manter componentes Figma separados |
| Tokens DTCG não recriam componentes | Import só traz variáveis, não estrutura | Usar tokens + Storybook como referência combinada |
| Sync Figma→Frontend não detecta remoções | Cores removidas do Figma ficam no config | Revisão humana no PR de sync |
| Export de tokens é snapshot | Se frontend mudar, precisa re-exportar | Automatizar no CI se viável |

---

## 6. Modo Figma MCP Server (Implementação Direta via Agente)

> Use este modo quando o **servidor MCP do Figma** estiver conectado (`mcp.figma.com/mcp`).
> Nesse caso o agente acessa o Figma como uma ferramenta direta — sem precisar de `figma:sync` ou export manual.

### Quando usar cada modo

| Situação | Modo recomendado |
|----------|-----------------|
| Servidor MCP Figma conectado | **Modo MCP** (esta seção) |
| Sem MCP, com token de API | **Modo script** (`figma:sync`, seções 1-5) |
| Apenas print/screenshot | Modo visual direto (sem sync) |

### Workflow obrigatório do Modo MCP (7 passos, em ordem)

**Nunca pular etapas.**

#### Passo 1 — Extrair node ID da URL Figma

Formato esperado: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`

- **fileKey**: segmento após `/design/`
- **nodeId**: valor do parâmetro `node-id`

#### Passo 2 — Buscar contexto de design

```
get_design_context(fileKey="<fileKey>", nodeId="<nodeId>")
```

Retorna: layout (Auto Layout, constraints, sizing), tipografia, cores/tokens, estrutura de componentes, espaçamentos.

**Se a resposta estiver truncada:**
1. Chamar `get_metadata(fileKey, nodeId)` para obter o mapa de nós
2. Identificar os nós filhos necessários
3. Chamar `get_design_context` individualmente por filho

#### Passo 3 — Capturar referência visual

```
get_screenshot(fileKey="<fileKey>", nodeId="<nodeId>")
```

Esse screenshot é a **fonte de verdade visual** — mantê-lo acessível durante toda a implementação.

#### Passo 4 — Baixar assets

- Se o MCP retornar `localhost` como source de imagem ou SVG → **usar diretamente**
- **NUNCA instalar novos pacotes de ícones** — todos os assets vêm do payload Figma
- **NUNCA usar placeholders** se o MCP já forneceu a source

#### Passo 5 — Traduzir para as convenções do projeto

- Tratar o output do MCP (geralmente React + Tailwind) como **representação de design**, não como código final
- Substituir utility classes Tailwind pelos tokens e componentes do `shared-design-system-vue-lib`
- **Reutilizar componentes `Ds*` existentes** em vez de recriar
- Usar tokens CSS (`var(--color-primary-500)`, `var(--spacing-4)`, etc.) — nunca hardcodar valores

#### Passo 6 — Garantir paridade visual 1:1

- Prioridade: fidelidade ao Figma
- Quando tokens do DS diferem do Figma: usar tokens do DS mas ajustar espaçamento/tamanho para manter visual
- Seguir WCAG 2.2 AA obrigatoriamente
- Adicionar JSDoc para componentes exportados

#### Passo 7 — Validar contra o Figma

Checklist antes de considerar completo:

- [ ] Layout confere (espaçamento, alinhamento, sizing)
- [ ] Tipografia confere (fonte, tamanho, peso, line-height)
- [ ] Cores conferem com tokens do DS
- [ ] Estados interativos funcionam (hover, active, focus, disabled)
- [ ] Comportamento responsivo segue constraints do Figma
- [ ] Assets renderizando corretamente
- [ ] Acessibilidade OK (aria-labels, contraste, navegação por teclado)

### Regras de asset handling (MCP)

```
✅ Usar source localhost:// diretamente — é o endpoint do servidor MCP
✅ SVGs retornados pelo MCP podem ser inlined
❌ Não modificar URLs de assets localhost
❌ Não instalar @tabler/icons, heroicons ou qualquer ícone externo para suprir gaps do Figma
❌ Não criar placeholders visuais quando o MCP já forneceu o asset real
```

### Integração com Gate DS

O Modo MCP **não altera** o Gate DS — a lógica de detecção Storybook vs Figma permanece a mesma.
Quando o usuário fornece uma URL Figma E tem `shared-design-system-vue-lib` instalado:
> Confirmar: "Usarei o Figma como verdade visual e priorizarei tokens do DS. Confirma?"

---

## Anti-Patterns (NUNCA fazer)

❌ Assumir que screenshots substituem componentes Figma editáveis
❌ Usar plugins code-to-design como fonte autoritativa de componentes Figma
❌ Fazer sync bidirecional automático sem revisão humana
❌ Ignorar divergências entre screenshot e Figma (sempre resolver)
❌ Considerar o export de tokens como "sync completo" — faltam composição e estados
❌ Publicar screenshots desatualizados (regenerar a cada release)
