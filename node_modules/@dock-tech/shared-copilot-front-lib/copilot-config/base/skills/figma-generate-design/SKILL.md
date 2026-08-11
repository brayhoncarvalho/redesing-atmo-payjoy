---
name: figma-generate-design
description: "Use junto com figma-use quando a tarefa envolver traduzir uma tela/página/layout multi-seção do projeto para o Figma. Gatilhos: 'escrever no Figma', 'criar no Figma a partir do código', 'empurrar tela para o Figma', 'pegar esta tela e construir no Figma', 'criar screen', 'build landing page no Figma', 'atualizar o Figma para corresponder ao código'. Skill preferencial sempre que o usuário quiser construir ou atualizar uma página completa, tela ou view no Figma a partir de código ou descrição. Descobre componentes, variáveis e estilos do DS via search_design_system, importa-os e monta telas incrementalmente seção por seção usando tokens do DS em vez de valores hardcoded."
argument-hint: "Nome da tela ou página a empurrar para o Figma (ex: 'landing', 'proposta', 'dados-acesso')"
---

# Build / Update Screens from Design System — Dock

Cria ou atualiza telas completas no Figma **reutilizando o Design System Dock publicado** —
componentes `Ds*`, variáveis e estilos — em vez de desenhar primitivos com valores hardcoded.

**OBRIGATÓRIO**: Você DEVE carregar o skill `figma-use` antes de qualquer chamada `use_figma`.
Ele contém regras críticas (escala de cores, carregamento de fontes, etc.) que se aplicam a
todo script que você escrever.

**Sempre passe `skillNames: "figma-generate-design"` ao chamar `use_figma` como parte deste skill.**

---

## Limites do Skill

- Use quando o deliverable é uma **tela Figma** (nova ou atualizada) composta de instâncias de componentes do DS.
- Se o usuário quiser **gerar código a partir de um design Figma**, use o skill `figma-implement-design` (seção 6 de `figma-bidirectional.instructions.md`).
- Se quiser criar **novos componentes reutilizáveis ou variantes**, use `figma-use` diretamente.
- Se quiser escrever **mapeamentos Code Connect**, use o skill `figma-code-connect`.
- Se quiser **construir toda a biblioteca DS no Figma**, use o skill `figma-generate-library`.

---

## Pré-requisitos

- Figma MCP server conectado
- Arquivo Figma alvo com biblioteca `shared-design-system-vue-lib` publicada (ou acesso à team library)
- Usuário fornece:
  - URL do arquivo Figma / file key + nome da página destino
  - Nome da tela/componente a construir (ex: "landing", "proposta")
- Código-fonte da tela (ler em `src/` ou pasta equivalente do projeto)

---

## Contexto das Telas Dock (ARCHITECTURE)

O projeto em `/workspace/ARCHITECTURE` é uma **landing page Vue 3** com navegação
por query string `?screen=`. As telas disponíveis são:

| Screen | Rota | Localização no código |
|---|---|---|
| `landing` | `?screen=landing` | Componente de landing principal |
| `proposta` | `?screen=proposta` | Tela de proposta |
| `dados-acesso` | `?screen=dados-acesso` | Formulário de dados de acesso |
| `proposta-personalizada` | `?screen=proposta-personalizada` | Proposta personalizada |
| `cadastro` | `?screen=cadastro` | Tela de cadastro |

> Ler `ARCHITECTURE.md` e `DESIGN_SYSTEM.md` para contexto visual antes de iniciar.

---

## Workflow Obrigatório (6 passos — não pular)

### Passo 1 — Entender a tela

Antes de tocar no Figma, entenda o que vai construir:

1. Ler os arquivos fonte relevantes para entender estrutura da página, seções e componentes usados.
2. Identificar as seções principais (ex: Header, Hero, Seção de Conteúdo, CTA, Footer).
3. Para cada seção, listar os componentes UI envolvidos (`DsButton`, `DsInput`, `DsCard`...).
4. Verificar se `DESIGN_SYSTEM.md` ou `dock-ds.config.json` especificam cores, tokens e layout.

### Passo 2 — Descobrir componentes, variáveis e estilos do DS

Você precisa de três coisas do DS: **componentes**, **variáveis** (cores, espaçamento, raios) e
**estilos** (text styles, effect styles). Nunca hardcode hex ou px quando existem tokens.

#### 2a: Descobrir componentes

**Preferencial: inspecionar telas existentes no arquivo Figma primeiro.** Se já houver telas
usando o mesmo DS, pular `search_design_system` e inspecionar instâncias diretamente:

```js
const frame = figma.currentPage.findOne(n => n.name === "Tela Existente");
const uniqueSets = new Map();
frame.findAll(n => n.type === "INSTANCE").forEach(inst => {
  const mc = inst.mainComponent;
  const cs = mc?.parent?.type === "COMPONENT_SET" ? mc.parent : null;
  const key = cs ? cs.key : mc?.key;
  const name = cs ? cs.name : mc?.name;
  if (key && !uniqueSets.has(key)) {
    uniqueSets.set(key, { name, key, isSet: !!cs, sampleVariant: mc.name });
  }
});
return [...uniqueSets.values()];
```

Só usar `search_design_system` se não houver telas existentes de referência.

**Incluir component properties** no mapeamento — precisa saber quais props TEXT cada componente
expõe para overrides de texto:

```
Mapa de componentes:
- DsButton → key: "abc123", tipo: COMPONENT_SET
  Props: { "Label#2:0": TEXT, "Has Icon#4:64": BOOLEAN }
- DsInput → key: "def456", tipo: COMPONENT_SET
  Props: { "Placeholder#8:12": TEXT, "State": VARIANT }
```

#### 2b: Descobrir variáveis (cores, espaçamento, raios)

> ⚠️ **Duas APIs de descoberta diferentes — não confunda:**
> - `figma.variables.getLocalVariableCollectionsAsync()` → retorna apenas variáveis **locais** do arquivo. Se vazio, NÃO significa que não há variáveis.
> - `search_design_system` com `includeVariables: true` → busca em **todas as bibliotecas vinculadas**, incluindo remotas/publicadas.
>
> **Nunca conclua "não há variáveis" com base apenas em `getLocalVariableCollectionsAsync()` vazio.**

Estratégia de busca no DS Dock — execute buscas paralelas:
- Cores primitivas: `"color"`, `"blue"`, `"gray"`, `"primary"`, `"ds-color"`
- Cores semânticas: `"background"`, `"border"`, `"text"`, `"surface"`
- Espaçamento: `"spacing"`, `"space"`, `"ds-spacing"`, `"gap"`
- Raios: `"radius"`, `"ds-radius"`, `"rounded"`

Inspecionar variáveis de uma tela existente é o método mais autoritativo:

```js
const frame = figma.currentPage.findOne(n => n.name === "Tela Existente");
const varMap = new Map();
frame.findAll(() => true).forEach(node => {
  const bv = node.boundVariables;
  if (!bv) return;
  for (const [prop, binding] of Object.entries(bv)) {
    const bindings = Array.isArray(binding) ? binding : [binding];
    for (const b of bindings) {
      if (b?.id && !varMap.has(b.id)) varMap.set(b.id, b.id);
    }
  }
});
// Resolver variáveis por ID
const resolved = [];
for (const id of varMap.keys()) {
  const v = await figma.variables.getVariableByIdAsync(id);
  if (v) resolved.push({ name: v.name, id: v.id, key: v.key, remote: v.remote });
}
return resolved;
```

Para variáveis de biblioteca (remote = true): importar com `figma.variables.importVariableByKeyAsync(key)`.

#### 2c: Descobrir estilos de texto e efeito

```
search_design_system({ query: "heading", includeStyles: true })
search_design_system({ query: "body", includeStyles: true })
search_design_system({ query: "shadow", includeStyles: true })
```

Ou inspecionar tela existente e coletar `textStyleId` / `effectStyleId`.

Importar estilos de biblioteca: `await figma.importStyleByKeyAsync(key)`.

### Passo 3 — Criar o frame wrapper da página primeiro

**NÃO construa seções como filhos de página e reparente depois** — mover nós entre chamadas
`use_figma` com `appendChild()` falha silenciosamente e produz frames órfãos. Crie o wrapper
primeiro, então construa cada seção diretamente dentro dele.

```js
// Encontrar espaço livre
let maxX = 0;
for (const child of figma.currentPage.children) {
  maxX = Math.max(maxX, child.x + child.width);
}

const wrapper = figma.createFrame();
wrapper.name = "Screen/Landing";  // convenção: Screen/{nome-da-tela}
wrapper.layoutMode = "VERTICAL";
wrapper.primaryAxisAlignItems = "MIN";
wrapper.counterAxisAlignItems = "CENTER";
wrapper.resize(1440, 100);
wrapper.layoutSizingHorizontal = "FIXED";
wrapper.layoutSizingVertical = "HUG";
wrapper.x = maxX + 200;
wrapper.y = 0;

return { success: true, wrapperId: wrapper.id };
```

### Passo 4 — Construir cada seção dentro do wrapper

**Uma seção por chamada `use_figma`.** No início de cada script, buscar o wrapper por ID
e anexar o novo conteúdo diretamente a ele.

```js
const createdNodeIds = [];
const wrapper = await figma.getNodeByIdAsync("WRAPPER_ID_DO_PASSO_3");

// Importar componentes do DS por key
const buttonSet = await figma.importComponentSetByKeyAsync("BUTTON_SET_KEY");
const primaryBtn = buttonSet.children.find(c =>
  c.type === "COMPONENT" && c.name.includes("Estilo=Primário")
) || buttonSet.defaultVariant;

// Importar variáveis do DS
const bgVar = await figma.variables.importVariableByKeyAsync("BG_COLOR_VAR_KEY");
const paddingVar = await figma.variables.importVariableByKeyAsync("SPACING_LG_VAR_KEY");

// Construir frame da seção
const section = figma.createFrame();
section.name = "Header";
section.layoutMode = "HORIZONTAL";
section.primaryAxisAlignItems = "SPACE_BETWEEN";
section.counterAxisAlignItems = "CENTER";
section.setBoundVariable("paddingLeft", paddingVar);
section.setBoundVariable("paddingRight", paddingVar);
section.setBoundVariable("paddingTop", paddingVar);
section.setBoundVariable("paddingBottom", paddingVar);

const bgPaint = figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', bgVar
);
section.fills = [bgPaint];

// Importar e aplicar text/effect styles
const shadowStyle = await figma.importStyleByKeyAsync("SHADOW_STYLE_KEY");
section.effectStyleId = shadowStyle.id;

// Criar instância de componente
const btnInstance = primaryBtn.createInstance();
section.appendChild(btnInstance);
// Override de texto via component property (não via .characters direto)
btnInstance.setProperties({ "Label#2:0": "Solicitar proposta" });
createdNodeIds.push(btnInstance.id);

// Anexar seção ao wrapper (FILL DEPOIS do appendChild)
wrapper.appendChild(section);
section.layoutSizingHorizontal = "FILL";

createdNodeIds.push(section.id);
return { success: true, createdNodeIds };
```

**Após cada seção**, validar com `get_screenshot` antes de continuar. Verificar especialmente:
- Texto cortado/clippado (line heights cortando descendentes)
- Elementos sobrepostos por sizing incorreto
- Texto placeholder ainda visível ("Title", "Label")
- Variante errada do componente

### Passo 5 — Validar a tela completa

Após compor todas as seções, chamar `get_screenshot` no frame da página inteira e comparar
com o código fonte. Corrigir issues com chamadas `use_figma` cirúrgicas — não reconstruir a tela.

**Tirar screenshots por seção, não só da página inteira.** Screenshot de página inteira em
resolução reduzida esconde truncamentos de texto e cores erradas.

### Passo 6 — Atualizar tela existente

Quando atualizando em vez de criar do zero:

1. Usar `get_metadata` para inspecionar a estrutura existente.
2. Identificar quais seções precisam de atualização.
3. Para cada seção:
   - Localizar nós existentes por ID ou nome
   - Trocar instâncias de componentes se o componente mudou no DS
   - Atualizar conteúdo de texto, variant props, ou layout
4. Validar com `get_screenshot` após cada modificação.

```js
// Exemplo: trocar variante de botão em tela existente
const existingBtn = await figma.getNodeByIdAsync("EXISTING_BTN_INSTANCE_ID");
if (existingBtn?.type === "INSTANCE") {
  const buttonSet = await figma.importComponentSetByKeyAsync("BUTTON_SET_KEY");
  const newVariant = buttonSet.children.find(c =>
    c.name.includes("Estilo=Primário") && c.name.includes("Tamanho=Grande")
  ) || buttonSet.defaultVariant;
  existingBtn.swapComponent(newVariant);
}
return { success: true, mutatedNodeIds: [existingBtn.id] };
```

---

## Regras de construção

### O que construir manualmente vs. importar do DS

| Construir manualmente | Importar do Design System Dock |
|---|---|
| Frame wrapper da página | **Componentes**: `DsButton`, `DsInput`, `DsCard`, `DsAlert`... |
| Frames de seção | **Variáveis**: cores (fills, strokes), spacing (padding, gap), raios |
| Grids de layout (rows, columns) | **Text styles**: heading, body, caption, label |
| | **Effect styles**: shadows `ds-shadow-*` |

**Nunca hardcode hex ou px de espaçamento** quando uma variável do DS existe. Use:
- `setBoundVariable("paddingLeft", spacingVar)` para espaçamento e raios
- `setBoundVariableForPaint(..., colorVar)` para cores
- `node.textStyleId = style.id` para estilos de texto
- `node.effectStyleId = style.id` para sombras

### Naming dos frames

Siga a convenção: `Screen/{nome-da-tela}` para frames de tela, `{NomeDaSeção}` para seções.

Exemplos:
```
Screen/Landing
  Header
  Hero
  Seção de Proposta
  CTA
  Footer
```

### Overrides de texto em instâncias

Use `setProperties()` com as chaves de component property — mais confiável que `node.characters`:

```js
instance.setProperties({ "Label#2:0": "Texto real do código" });

// Para instâncias aninhadas que expõem TEXT props próprias:
const heading = cardInstance.findOne(n => n.type === "INSTANCE" && n.name === "Text Heading");
if (heading) heading.setProperties({ "Text#2104:5": "Título do card" });
```

Só use `node.characters` direto para texto que NÃO é gerenciado por nenhuma component property.

---

## Recuperação de Erros

Seguir o processo de recuperação de erros do skill `figma-use`:

1. **PARE** em erro — não faça retry imediatamente.
2. **Leia a mensagem de erro** para entender o que deu errado.
3. Se o erro não estiver claro, chame `get_metadata` ou `get_screenshot` para inspecionar o arquivo.
4. **Corrija o script** baseado na mensagem de erro.
5. **Faça retry** — seguro porque scripts com falha são atômicos (nada é criado se um script lança erro).

Como este skill trabalha incrementalmente (uma seção por chamada), erros são naturalmente
escopados a uma única seção. Seções anteriores de chamadas bem-sucedidas permanecem intactas.

---

## Boas Práticas

- **Sempre buscar antes de construir.** O DS provavelmente tem o componente, variável ou estilo necessário.
- **Buscar amplamente.** Tente sinônimos e termos parciais. `DsButton` pode aparecer como "button", "btn", "cta".
- **Preferir tokens do DS a valores hardcoded.** Use variable bindings para cores, espaçamento e raios.
- **Preferir instâncias de componentes a construções manuais.**
- **Trabalhar seção por seção.** Nunca construir mais de uma seção principal por chamada `use_figma`.
- **Retornar IDs de nós de toda chamada.** Você precisará deles para compor seções e recuperação de erros.
- **Validar visualmente após cada seção.** Use `get_screenshot` para capturar issues cedo.
- **Corresponder convenções existentes.** Se o arquivo já tem telas, corresponder naming, sizing e padrões de layout.
