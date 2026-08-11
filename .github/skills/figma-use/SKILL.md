---
name: figma-use
description: "**PRÉ-REQUISITO OBRIGATÓRIO** — você DEVE invocar este skill ANTES de toda chamada `use_figma`. NUNCA chame `use_figma` diretamente sem carregar este skill primeiro. Pular causa falhas difíceis de debugar. Ative sempre que o usuário quiser executar ação de escrita ou leitura única que exija JavaScript no contexto do arquivo Figma — ex: criar/editar/deletar nós, configurar variáveis ou tokens, construir componentes e variantes, modificar auto-layout ou fills, vincular variáveis a propriedades, ou inspecionar estrutura programaticamente."
---

# use_figma — Plugin API Skill

Executa JavaScript no arquivo Figma via Plugin API através do MCP. Este skill contém todas as
regras críticas de sintaxe e comportamento que devem ser seguidas em **toda** chamada `use_figma`.

**Sempre passe `skillNames: "figma-use"` ao chamar `use_figma`.** É um parâmetro de logging —
não afeta a execução.

Se a tarefa envolver construir ou atualizar uma tela/página completa no Figma a partir de código,
carregue também o skill `figma-generate-design`. Se envolver construir a biblioteca do DS, carregue
`figma-generate-library`. Este skill fornece as regras de API; os outros fornecem o workflow de domínio.

---

## 1. Regras Críticas (17 — todas obrigatórias)

1. **Use `return` para enviar dados de volta.** O valor de retorno é auto-serializado (objetos, arrays,
   strings, números). NÃO chame `figma.closePlugin()` e NÃO envolva em IIFE assíncrono.
2. **Escreva JavaScript puro com `await` de nível superior e `return`.** O código é automaticamente
   envolvido em contexto async. NÃO envolva em `(async () => { ... })()`.
3. **`figma.notify()` lança "not implemented"** — nunca use.
4. **`getPluginData()` / `setPluginData()` não são suportados** em `use_figma`. Use
   `getSharedPluginData()` / `setSharedPluginData()` (estes SÃO suportados), ou rastreie IDs
   de nós pelos valores de retorno.
5. **`console.log()` NÃO é retornado** — use `return` para output.
6. **Trabalhe incrementalmente em pequenos passos.** Quebre operações grandes em múltiplas chamadas
   `use_figma`. Valide após cada passo. Esta é a prática mais importante para evitar bugs.
7. **Cores estão na escala 0–1** (não 0–255): `{r: 1, g: 0, b: 0}` = vermelho.
8. **Fills/strokes são arrays somente-leitura** — clone, modifique, reatribua.
9. **Fonte DEVE ser carregada** antes de qualquer operação de texto:
   `await figma.loadFontAsync({family: "Inter", style: "Regular"})`.
10. **Páginas carregam incrementalmente** — use `await figma.setCurrentPageAsync(page)` para trocar
    de página e carregar o conteúdo (o setter síncrono `figma.currentPage = page` **lança erro**).
11. **`setBoundVariableForPaint` retorna uma NOVA paint** — deve capturar e reatribuir.
12. **`createVariable` aceita objeto de coleção ou string ID** (objeto preferido).
13. **`layoutSizingHorizontal/Vertical = 'FILL'` DEVE ser definido APÓS `parent.appendChild(child)`**
    — definir antes do append lança erro. O mesmo se aplica a `'HUG'` em nós sem auto-layout.
14. **Posicione novos nós de nível superior longe de (0,0).** Nós adicionados diretamente à página
    ficam em (0,0). Escaneie `figma.currentPage.children` para encontrar espaço livre.
15. **Em erro de `use_figma`, PARE. NÃO faça retry imediato.** Scripts com falha são **atômicos** —
    se um script lança erro, não é executado e nenhuma mudança é feita no arquivo. Leia a mensagem
    de erro, corrija o script, então faça retry.
16. **DEVE retornar TODOS os IDs de nós criados/mutados.** Sempre colete e retorne em objeto
    estruturado: `return { createdNodeIds: [...], mutatedNodeIds: [...] }`.
17. **`await` toda Promise.** Nunca deixe Promise sem await — causa falhas silenciosas. O script
    pode retornar antes da operação async completar.

---

## 2. Regras de Página (Críticas)

**O contexto de página reinicia entre chamadas `use_figma`** — `figma.currentPage` começa na
primeira página a cada vez.

```js
// ✅ Correto — troca de página (carrega conteúdo)
const targetPage = figma.root.children.find(p => p.name === "Components");
await figma.setCurrentPageAsync(targetPage);

// ❌ Errado — setter síncrono lança erro em use_figma
figma.currentPage = targetPage;

// Iterar sobre todas as páginas
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  // page.children agora está populado
}
```

Em workflows multi-passo, **sempre** chame `await figma.setCurrentPageAsync(page)` no início
de cada script se o alvo não for a primeira página.

---

## 3. Checklist Pré-Flight

Verificar antes de enviar QUALQUER chamada `use_figma`:

- [ ] Código usa `return` para enviar dados (NÃO `figma.closePlugin()`)
- [ ] Código NÃO está envolvido em IIFE async
- [ ] Valor de `return` inclui dados estruturados com IDs e contagens
- [ ] NENHUM uso de `figma.notify()`
- [ ] NENHUM uso de `console.log()` como output
- [ ] Todas as cores na escala 0–1 (não 0–255)
- [ ] Fills/strokes são reatribuídos como novos arrays (não mutados in-place)
- [ ] Trocas de página usam `await figma.setCurrentPageAsync(page)`
- [ ] `layoutSizingVertical/Horizontal = 'FILL'` definido APÓS `parent.appendChild(child)`
- [ ] `loadFontAsync()` chamado ANTES de qualquer escrita de propriedade de texto
- [ ] `lineHeight`/`letterSpacing` usam formato `{unit, value}` (não números puros)
- [ ] `resize()` chamado ANTES de definir sizing modes (resize reseta para FIXED)
- [ ] Novos nós de nível superior posicionados longe de (0,0)
- [ ] TODOS os IDs de nós criados/mutados coletados e incluídos no `return`
- [ ] Toda chamada async (`loadFontAsync`, `setCurrentPageAsync`, `importComponentByKeyAsync`, etc.) tem `await`

---

## 4. Padrão: Inspecionar Antes de Criar

**Sempre inspecione o arquivo Figma antes de criar qualquer coisa.** Arquivos diferentes usam
convenções diferentes de naming, estrutura de variáveis e padrões de componentes. Seu código
deve corresponder ao que já existe, não impor novas convenções.

```js
// Listar todas as páginas e nós de nível superior
const pages = figma.root.children.map(p =>
  `${p.name} id=${p.id} filhos=${p.children.length}`
);
return pages.join('\n');
```

```js
// Listar componentes existentes em todas as páginas
const results = [];
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  page.findAll(n => {
    if (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')
      results.push(`[${page.name}] ${n.name} (${n.type}) id=${n.id}`);
    return false;
  });
}
return results.join('\n');
```

```js
// Listar coleções de variáveis existentes
const collections = await figma.variables.getLocalVariableCollectionsAsync();
return collections.map(c => ({
  name: c.name, id: c.id,
  qtdVars: c.variableIds.length,
  modos: c.modes.map(m => m.name)
}));
```

---

## 5. Padrões Comuns

### Criar frame com Auto Layout

```js
const frame = figma.createFrame();
frame.name = "Container";
frame.layoutMode = "VERTICAL";
frame.primaryAxisAlignItems = "MIN";
frame.counterAxisAlignItems = "MIN";
frame.itemSpacing = 16;
frame.paddingTop = frame.paddingBottom = 24;
frame.paddingLeft = frame.paddingRight = 24;
frame.resize(400, 100);
frame.layoutSizingHorizontal = "FIXED";
frame.layoutSizingVertical = "HUG";
frame.x = 100; frame.y = 100;
return { createdNodeIds: [frame.id] };
```

### Criar variável e vincular a fill

```js
const collection = await figma.variables.createVariableCollection("Color");
const mode = collection.modes[0];
const bgVar = figma.variables.createVariable("color/bg/primary", collection, "COLOR");
bgVar.setValueForMode(mode.modeId, { r: 0.98, g: 0.98, b: 0.99, a: 1 });
bgVar.scopes = ["FRAME_FILL", "SHAPE_FILL"];
bgVar.codeSyntax = { WEB: "var(--ds-color-bg-primary)" };

// Vincular a fill de um frame
const paint = figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
  'color',
  bgVar
);
targetFrame.fills = [paint];
return { createdNodeIds: [], mutatedNodeIds: [targetFrame.id] };
```

### Criar componente com variantes

```js
// Criar componentes individuais primeiro
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Medium" });

const primary = figma.createComponent();
primary.name = "Estilo=Primário, Tamanho=Médio, Estado=Padrão";
primary.resize(120, 40);
// ... configurar fills, texto, etc.

const secondary = figma.createComponent();
secondary.name = "Estilo=Secundário, Tamanho=Médio, Estado=Padrão";
secondary.resize(120, 40);

// Combinar em component set
const compSet = figma.combineAsVariants([primary, secondary], figma.currentPage);
compSet.name = "DsButton";

// Posicionar variantes em grid (empilham em 0,0 após combineAsVariants)
let xOffset = 32;
for (const child of compSet.children) {
  child.x = xOffset;
  child.y = 32;
  xOffset += child.width + 16;
}
compSet.resize(xOffset, 104);

return { createdNodeIds: [compSet.id, ...compSet.children.map(c => c.id)] };
```

### Importar componente de biblioteca e criar instância

```js
// Importar do DS publicado por key (obter key via search_design_system ou get_code_connect_map)
const componentSet = await figma.importComponentSetByKeyAsync("COMPONENT_SET_KEY");
const variant = componentSet.defaultVariant ||
  componentSet.children.find(c => c.name.includes("Estilo=Primário"));
const instance = variant.createInstance();
parentFrame.appendChild(instance);
instance.layoutSizingHorizontal = "FILL"; // APÓS appendChild
return { createdNodeIds: [instance.id] };
```

---

## 6. Recuperação de Erros

**`use_figma` é atômico — scripts com falha não executam.** Se um script lança erro, nenhuma
mudança é feita. Retry após correção é seguro.

### Quando `use_figma` retorna erro

1. **PARE.** Não faça retry imediato.
2. **Leia a mensagem de erro cuidadosamente.**
3. Se o erro não estiver claro, chame `get_metadata` ou `get_screenshot` para entender o estado do arquivo.
4. **Corrija o script** baseado na mensagem de erro.
5. **Faça retry** do script corrigido.

### Erros comuns e correções

| Mensagem de erro | Causa provável | Correção |
|---|---|---|
| `"not implemented"` | Uso de `figma.notify()` | Remova — use `return` para output |
| `"node must be an auto-layout frame"` | `FILL`/`HUG` definido antes de append | Mova `appendChild` antes de `layoutSizingX = 'FILL'` |
| `"Setting figma.currentPage is not supported"` | Setter síncrono de página | Use `await figma.setCurrentPageAsync(page)` |
| Valor fora do intervalo | Canal de cor > 1 (usou 0–255) | Divida por 255 |
| `"Cannot read properties of null"` | Nó não existe (ID errado, página errada) | Verifique contexto de página, confirme ID |
| `"The node with id X does not exist"` | Instância pai foi desanexada | Re-descubra nós por traversal a partir de frame pai estável |

---

## 7. Modo Editor

`use_figma` funciona em **modo design** (editorType `"figma"`, o padrão).

**Disponível em modo design:** Rectangle, Frame, Component, Text, Ellipse, Star, Line, Vector, Polygon, BooleanOperation, Slice, Page, Section, TextPath.

**Bloqueado em modo design:** Sticky, Connector, ShapeWithText, CodeBlock, Slide, SlideRow, Webpage.
