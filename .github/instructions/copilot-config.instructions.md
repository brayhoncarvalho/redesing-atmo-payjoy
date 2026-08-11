---
applyTo: "**"
---

# Dock — Instruções Universais para o Copilot

> Este arquivo contém regras cross-projeto do Design System Dock.
> Regras projeto-específicas (cores, componentes, layout) ficam no repo individual.

---

## ⚠️ GATE DE DESIGN SYSTEM — Detecção Inteligente

O agente DEVE determinar qual Design System seguir **antes de qualquer alteração visual** (criar componente, ajustar estilo, adicionar tela, modificar layout).

### Lógica de detecção (em ordem de prioridade)

1. **Figma explícito** — Se o usuário mencionou "Figma", "print", "screenshot", "referência visual", "nó", "frame" ou anexou uma imagem de referência:
   → **Ativar modo Figma automaticamente.** Usar `DESIGN_SYSTEM.md` + prints como verdade visual.

2. **DS Storybook (default)** — Se o projeto tem `shared-design-system-vue-lib` instalado E o usuário NÃO mencionou Figma:
   → **Usar DS Storybook automaticamente. NÃO perguntar.**

3. **Ambíguo** — Se não ficou claro se há referência visual (ex: "crie uma tela de login" sem mais contexto):
   → **Perguntar UMA vez:**
   > "Esse trabalho parte de uma referência no Figma, ou devo seguir o DS Storybook publicado (`shared-design-system-vue-lib`)?"

4. **Conflito** — Se durante a implementação o Storybook define X mas o Figma mostra Y:
   → **Parar e perguntar** qual deve prevalecer naquele ponto específico.

5. **DS não instalado** — Se o projeto NÃO tem `shared-design-system-vue-lib`:
   → **Orientar instalação padrão** antes de seguir com UI:
      1) Conectar VPN
      2) Garantir `.npmrc` com:
         `registry=https://nexus.tools.dock.tech/repository/npm-all/`
         `//nexus.tools.dock.tech/repository/npm-internal/:_authToken=${NODE_AUTH_TOKEN}`
      3) Executar `npm install shared-design-system-vue-lib`
   → Se o usuário não puder instalar no momento, perguntar se deseja continuar em modo sem DS.

### Regras do gate
- Após determinar o modo, aplicar de forma consistente até o fim da tarefa.
- Se o usuário trocar o modo no meio de uma tarefa, ajustar imediatamente.
- **Nunca perguntar desnecessariamente** — se a detecção é clara (condições 1 ou 2), agir direto.
- **Nunca escolher silenciosamente quando ambíguo** — se condição 3, perguntar obrigatoriamente.

### Modo "Design System Dock (Storybook)" — DEFAULT
- Importar e usar componentes de `shared-design-system-vue-lib` (Button, Input, Select, Stepper, etc.).
- Usar tokens públicos do pacote (color, font, space, border, shadow).
- Importar `shared-design-system-vue-lib/style.css` no bootstrap.
- **Não recriar** componentes que já existem no pacote.
- Se um componente necessário não existir no pacote, perguntar se deve criar local ou aguardar inclusão no DS.

### Modo "Design System Figma (referência)" — OVERRIDE
- Seguir `DESIGN_SYSTEM.md` como fonte de verdade.
- Respeitar cores hex exatas, tipografia, dimensões e espaçamentos documentados.
- Todas as regras de fidelidade, prints, slider, backgrounds, etc. se aplicam integralmente.
- Antes de concluir, passar pelo checklist de fidelidade visual e nunca assumir detalhes ausentes.

---

## Revisão do Design Atual — Regra Obrigatória

Antes de editar uma tela ou componente existente, o agente DEVE:
1. **Inspecionar visualmente** a implementação atual.
2. **Identificar** se há estrutura simplificada, desalinhamento, ausência de estados visuais, hierarquia fraca, falta de completude ou desvio do DS selecionado.
3. **Se identificar oportunidades de melhoria**, listar as sugestões e **perguntar ao usuário** se pode elevar a qualidade visual, respeitando o DS escolhido e os padrões de UI/UX.
4. **NUNCA aplicar melhorias silenciosamente** — toda alteração de composição deve ser proposta e aprovada.
5. Se a UI estiver conforme o DS selecionado e visualmente completa, prosseguir sem perguntar.

---

## Baseline Obrigatória de Acessibilidade e Usabilidade

Toda criação visual nova e toda melhoria em interface existente DEVE seguir, no mínimo:

- **WCAG 2.2 nível AA** como baseline obrigatória de acessibilidade.
- **Heurísticas de Nielsen** como framework obrigatório de revisão de UX e usabilidade.

### WCAG 2.2 AA — Checklist Mínimo
- Contraste adequado entre texto, fundo, bordas e estados.
- Foco visível, navegação por teclado e ordem lógica de tabulação.
- Labels, nomes acessíveis, `aria-*` quando necessário e semântica correta.
- Mensagens de erro claras, associação com campos e instruções compreensíveis.
- Não depender apenas de cor para comunicar estado, erro, seleção ou prioridade.
- Alvos interativos adequados, estados consistentes e feedback perceptível.

### Nielsen Heuristics — Checklist Mínimo
- Visibilidade do estado do sistema: feedback claro em ações, seleção, erro e carregamento.
- Correspondência com o mundo real: rótulos, textos e fluxos compreensíveis.
- Controle e liberdade do usuário: correção, retorno, cancelamento sem fricção.
- Consistência e padrões: comportamento coerente com o DS escolhido.
- Prevenção de erros: validação, máscara e orientação antes do erro.
- Reconhecimento em vez de memorização: opções e próximos passos evidentes.
- Estética e design minimalista: clareza e completude sem ruído visual.

### Regra operacional
- Se a solução visual proposta violar WCAG 2.2 AA ou heurísticas de Nielsen, o agente deve corrigir ou apontar o desvio antes de implementar.

---

## Funcionalidade Interativa — Regras Universais

- **Todo componente interativo DEVE funcionar**, não apenas parecer visual.
- Sliders/ranges devem usar `<input type="range">` nativo estilizado.
- Botões de +/- devem alterar o state reativo.
- Seleção de opções deve refletir visualmente (estado selecionado vs normal).
- Valores calculados devem atualizar em tempo real conforme o state muda.
- Nunca crie componentes que parecem interativos mas são estáticos.
- Formulários devem ter `v-model` nos inputs e validação básica.

### Slider — Regras Críticas (Universais)

- **Posição dos botões:** botão `-` (decrementar) à ESQUERDA, botão `+` (incrementar) à DIREITA.
- **Thumb do slider:** DEVE ser branco puro (`#ffffff`), quadrado (24x24px), sem border-radius.
  - Usar `appearance: none`, `border: none`, `box-shadow: none` para remover estilos padrão do browser.
- **Centralização vertical:** thumb centralizado na track.
- **Track:** altura e cor definidas em `dock-ds.config.json → rules.slider`.
- **NUNCA inverter** a posição dos botões +/-.
- **NUNCA** usar cor no thumb que não seja branco.

---

## Ícones e Assets Visuais — Regras Universais

> ### 🚫 REGRA INVIOLÁVEL — Proibido deixar interface sem ícone
> **Nunca, em hipótese alguma, deixe um elemento de interface sem ícone quando o design exige um.**
> Se o agente não souber qual ícone usar, **deve parar e perguntar ao usuário** antes de continuar.
> Entregar uma interface com ícones ausentes é considerado falha crítica.
> Não há exceção: dúvida sobre ícone → perguntar. Ícone desconhecido → perguntar. Ícone não encontrado → perguntar.

- Quando o design exigir ícones, **pergunte ao usuário**:
  - "Você quer fornecer os ícones (exportar do Figma e salvar em `public/`)?"
  - "Ou prefere que eu crie SVGs inline baseados no design?"
- Se o usuário escolher fornecer: pare e aguarde.
- **Nunca crie ícones silenciosamente sem perguntar.**
- **Nunca omita um ícone por não encontrar referência exata** — nesse caso, descreva o que viu no design e pergunte qual ícone usar.

### Imagens
- Todas as imagens devem ficar em `public/`.
- Quando precisar de imagem nova, **peça ao usuário** para salvar em `public/`.
- Nunca gere URLs de imagens externas inventadas.
- Não monte placeholder visual temporário sem perguntar.

---

## Análise de Prints e Referências Visuais (Modo Figma)

- Quando o usuário enviar um **print/screenshot**, analise cada detalhe:
  - Posição, alinhamento, espaçamento
  - Quantidade de linhas do texto (reproduzir exatamente)
  - Peso do texto (regular, medium, bold)
  - Cores (conferir contra `DESIGN_SYSTEM.md`)
  - Tamanho relativo dos elementos
  - Bordas, sombras, separadores
  - Ícones e imagens
- **Compare pixel a pixel** com a implementação atual.
- Se algo diverge, ajuste o código.
- Se o print mostra algo que **não está no `DESIGN_SYSTEM.md`**, pare e pergunte.

### Checklist de Fidelidade Visual (Modo Figma)
- Estrutura: mesma ordem de blocos, mesma hierarquia, sem omitir seções.
- Layout: alinhamento, espaçamento e densidade visual equivalentes ao print.
- Tipografia: família, peso, tamanho, line-height e quebra de linha equivalentes.
- Cor e superfície: hex, bordas, radius, sombras e opacidade equivalentes.
- Estados: hover, focus, selected, error, loading e disabled quando visíveis no design.
- Assets: ícones e imagens só podem entrar com confirmação do usuário ou arquivos já presentes.
- Conteúdo: não resumir, não trocar copy, não reformatar blocos de texto sem evidência.
- Finalização: se o projeto tiver script disponível, rodar `npm run validate:figma` antes de considerar a tarefa pronta.

### Dúvidas e Elementos Não Claros
- **NUNCA implemente algo que não entendeu no print.**
- Crie lista numerada de dúvidas, descreva o que viu, pergunte antes de implementar.
- Não invente, não assuma, não crie elementos por conta própria.
- **Regra absoluta:** é melhor perguntar do que criar algo errado.
- Se faltarem ícones, imagens, ilustrações ou assets exportados, perguntar se o usuário vai fornecer em `public/` ou se deseja SVG inline criado manualmente.

---

## Estrutura de Componentes — Padrão Vue 3

- Use `<script setup lang="ts">` (Composition API).
- Tailwind CSS para estilização.
- Cada tela/seção é um componente em `src/components/`.

---

## O que NÃO fazer (Universais)

- Não adicionar animações não especificadas no design.
- Não mudar border-radius de componentes existentes.
- Não adicionar sombras não especificadas.
- Não trocar a ordem das seções.
- Não usar cores "parecidas" — usar o hex exato.
- Não usar fontes alternativas.
- Não criar imagens placeholder com URLs externas.
- Não "interpretar" prints — reproduzir exatamente.
- Não criar componentes interativos que não funcionam.
- Não criar ícones sem perguntar ao usuário.
- **Não deixar nenhum elemento de interface sem ícone** quando o design exige um — se houver dúvida sobre qual usar, perguntar obrigatoriamente antes de continuar.
- Não criar tela parcial, versão resumida, placeholder visual ou "stub funcional" quando o design mostra composição mais rica.
- Não pular header, footer, stepper, blocos visuais do design só para fazer o fluxo funcionar.
- Não ligar uma tela nova na navegação se ela ainda estiver incompleta visualmente.
