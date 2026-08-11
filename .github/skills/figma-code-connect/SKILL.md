---
name: figma-code-connect
description: "Conecta componentes do Design System Dock no Figma ao código Vue 3 correspondente via Code Connect. Use quando o usuário disser 'conectar componente ao Figma', 'mapear componente', 'code connect', ou quiser criar mapeamentos entre componentes Figma e implementações Vue. Requer Figma MCP server conectado."
argument-hint: "URL Figma do componente ou 'todos' para mapear o DS completo"
---

# Code Connect — Dock Design System

Liga cada componente `Ds*` do repositório `shared-design-system-vue-lib` ao seu componente publicado
na biblioteca Figma. Designers veem qual arquivo Vue implementa cada componente; devs navegam
do Figma direto ao código.

---

## Pré-requisitos

- Figma MCP server conectado (`mcp.figma.com/mcp`)
- Componente publicado na biblioteca da equipe Dock no Figma
- URL Figma com `node-id`:
  `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
- Ou: nó selecionado no Figma Desktop (com `figma-desktop` MCP)

---

## Workflow obrigatório (4 passos)

### Passo 1 — Buscar sugestões de Code Connect

```
get_code_connect_suggestions(fileKey="<fileKey>", nodeIds=["<nodeId>"])
```

Retorna: lista de componentes Figma com sugestões de mapeamento.

Se o usuário disser "mapear tudo", usar `get_metadata` para descobrir todos os nós
de componentes da biblioteca e fazer `get_code_connect_suggestions` em batches de 10.

### Passo 2 — Localizar o componente Vue correspondente

Buscar o arquivo fonte em `src/design-system/components/`:

| Nome no Figma | Arquivo esperado |
|---|---|
| `DsButton` / `Button` | `src/design-system/components/DsButton.vue` |
| `DsInput` / `Input` | `src/design-system/components/DsInput.vue` |
| (qualquer outro) | `src/design-system/components/Ds{Nome}.vue` |

Se não encontrar com busca exata, tentar variações de casing. Se o arquivo não existir no
DS, reportar ao usuário antes de criar o mapeamento.

### Passo 3 — Montar o mapeamento

Para cada componente, construir o objeto Code Connect:

```json
{
  "figmaNodeId": "<nodeId>",
  "codeLocation": {
    "file": "src/design-system/components/Ds{Nome}.vue",
    "startLine": 1
  },
  "label": "shared-design-system-vue-lib",
  "language": "vue",
  "imports": ["import Ds{Nome} from 'shared-design-system-vue-lib'"]
}
```

### Passo 4 — Enviar os mapeamentos

```
send_code_connect_mappings(fileKey="<fileKey>", mappings=[...])
```

Confirmar ao usuário quantos mapeamentos foram enviados e listar quais
componentes Figma foram conectados.

---

## Regras

- **Nunca mapear para arquivos que não existem** — verificar antes de enviar
- **Sempre usar o nome do pacote `shared-design-system-vue-lib`** no campo `label`
- Componentes não publicados na biblioteca Figma não podem receber Code Connect — informar o designer
- Code Connect é apenas para componentes do DS oficial — não mapear componentes locais de projetos consumidores

---

## Mapeamento rápido — componentes principais

| Categoria | Componente Figma | Arquivo Vue |
|---|---|---|
| **Ação** | Button | DsButton.vue |
| **Ação** | IconButton | DsIconButton.vue |
| **Formulário** | Input | DsInput.vue |
| **Formulário** | Select | DsSelect.vue |
| **Formulário** | Checkbox | DsCheckbox.vue |
| **Formulário** | Radio | DsRadio.vue |
| **Formulário** | Textarea | DsTextarea.vue |
| **Layout** | Card | DsCard.vue |
| **Layout** | Divider | DsDivider.vue |
| **Feedback** | Toast | DsToast.vue |
| **Feedback** | Alert | DsAlert.vue |
| **Feedback** | Spinner | DsSpinner.vue |
| **Navegação** | Breadcrumb | DsBreadcrumb.vue |
| **Dados** | Table | DsTable.vue |
| **Dados** | Badge | DsBadge.vue |

Para a lista completa, ver `src/design-system/components/`.

---

## Recursos

- [Code Connect Documentation](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect)
- [Figma MCP Server Tools](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)
