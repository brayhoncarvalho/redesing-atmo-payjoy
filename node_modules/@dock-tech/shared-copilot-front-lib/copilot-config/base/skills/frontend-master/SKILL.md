---
name: frontend-master
description: >
  Skill mestre de Front-end Engineering + UX/UI Design.
  Ative quando: criar tela, criar componente, revisar UI, tomar decisão de layout, escolher padrão de interação.
  Contém: UX Laws com enforcement, hierarquia visual, carga cognitiva, anatomia de interação, sistema de tipografia, ritmo de espaçamento, máquina de estados de componente, auditoria pós-implementação.
triggers:
  - nova tela
  - novo componente
  - refatorar UI
  - revisar interface
  - melhorar UX
  - clean UI
  - fluid interface
---

# Frontend Master — Skill de UX/UI Engineering

> **Ativar antes de qualquer geração de UI.** Este skill funciona como guardrail inteligente: bloqueia anti-patterns, guia decisões e garante que o resultado seja limpo, fluido e centrado no usuário.

---

## PRÉ-VOO OBRIGATÓRIO — Antes de escrever qualquer linha de UI

Execute mentalmente estas 4 perguntas antes de codar:

1. **Qual é o objetivo do usuário nesta tela?** (não o da empresa — o do usuário)
2. **Qual é a ÚNICA ação mais importante?** (será o elemento visual dominante)
3. **O que pode dar errado?** (planejar os estados de erro antes do happy path)
4. **Quais estados esta tela/componente possui?** (mapear a máquina de estados)

Se não souber responder qualquer uma delas, **pergunte ao usuário antes de começar.**

---

## PARTE 1 — LEIS DE UX COM ENFORCEMENT

Cada lei tem: definição, regra de código, condição de BLOQUEIO.

---

### LEI 1 — Fitts: Alvos Grandes e Próximos

**Definição:** Targets maiores e mais próximos do cursor/polegar são mais fáceis de acionar.

**Regras de código:**
- CTA primário: `min-height: 48px; min-width: 120px` (desktop) / `min-height: 56px` (mobile)
- Todo elemento interativo mobile: `min-height: 44px; min-width: 44px`
- Ícones clicáveis sem label: área clicável `44×44px` mínima (use padding se necessário)
- Posição do CTA principal: thumb zone (mobile = 60-70% inferior da tela)

**BLOCKER:**
```
❌ Botão primário menor que botão secundário na mesma tela
❌ Área clicável menor que 44×44px em mobile
❌ Link de ação crítica em área de difícil acesso
```

---

### LEI 2 — Hick: Menos Escolhas, Mais Velocidade

**Definição:** Tempo de decisão cresce logaritmicamente com o número de opções.

**Regras de código:**
- Máximo 3 ações primárias visíveis simultaneamente
- Menus com >7 itens devem ter grupos ou busca
- Formulários com >5 campos: aplicar progressive disclosure (por etapas ou grupos colapsáveis)
- Navegação principal: máximo 7 itens

**BLOCKER:**
```
❌ >3 botões de ação primária na mesma área
❌ Formulário com >8 campos sem agrupamento ou stepper
❌ Menu com >10 itens sem categorização
```

---

### LEI 3 — Miller: 7±2 Chunks de Memória

**Definição:** A memória de trabalho suporta 7±2 itens independentes.

**Regras de código:**
- Listas: paginar ou virtualizar se >10 itens
- Grupos de itens relacionados: máximo 7 por grupo
- Steps em formulário multi-etapa: máximo 7 steps
- Tabs de navegação: máximo 7 abas visíveis

**BLOCKER:**
```
❌ Lista plana sem paginação/virtualização com >20 itens
❌ Grupo de radio/checkboxes com >9 opções sem busca
```

---

### LEI 4 — Jakob: Use Padrões Conhecidos

**Definição:** Usuários esperam que seu produto funcione como outros que já conhecem.

**Padrões obrigatórios:**
- Logo: canto superior esquerdo, clicável, volta à home
- Navegação principal: topo (horizontal) ou lateral esquerda (vertical)
- Breadcrumb: abaixo do header, fluxo esquerda→direita
- Botão primário: direita (em footers/dialogs) — `Cancel | Confirm`
- Busca: ícone de lupa ou campo visível no header
- Logout/perfil: canto superior direito
- Erro de formulário: abaixo do campo, vermelho
- Link: sublinhado ou cor diferente do texto

**BLOCKER:**
```
❌ Botão "Confirmar" à ESQUERDA do "Cancelar" (inverte padrão)
❌ Logo não clicável / clicável mas não navega para home
❌ Erros de formulário acima do campo ou em modais separados
❌ Navegação principal que viola padrão de posição sem justificativa UX forte
```

---

### LEI 5 — Proximity (Gestalt): Agrupe o que Pertence Junto

**Definição:** Elementos próximos são percebidos como relacionados.

**Regras de espaçamento:**
```
gap ENTRE grupos ≥ 2× gap DENTRO do grupo

Exemplo:
├── Label "CPF" (8px abaixo → input)
├── Input CPF       (8px abaixo → erro inline)
└── [erro inline]

                    ← gap de 24px entre campos ≠ de 8px interno

├── Label "CNPJ"
└── Input CNPJ
```

**BLOCKER:**
```
❌ Label mais próximo do campo de CIMA que do campo de BAIXO ao qual pertence
❌ Botão de ação separado visualmente do formulário que ele submete
❌ Gap entre itens do mesmo grupo igual ao gap entre grupos diferentes
```

---

### LEI 6 — Aesthetic-Usability: Bonito Parece Mais Usável

**Definição:** Interfaces mais bonitas são percebidas como mais fáceis de usar — mesmo sem mudança funcional.

**Regras de código:**
- Espaçamento consistente (grid de 4px)
- Alinhamento estrito (sem elementos "quase alinhados")
- Hierarquia tipográfica clara (3 níveis, não 6 tamanhos diferentes)
- Ícones com estilo unificado (todos outline OU todos solid — nunca misturar)
- Sombras consistentes (1-2 níveis de elevação, não 5 valores diferentes de box-shadow)

**BLOCKER:**
```
❌ Mistura de ícones outline e solid no mesmo contexto
❌ >3 pesos de fonte diferentes em uma única tela
❌ Alinhamentos inconsistentes (elementos "quase alinhados")
❌ Espaçamentos que não seguem a grade de 4px
```

---

### LEI 7 — Doherty Threshold: Resposta em <400ms

**Definição:** Respostas em menos de 400ms mantêm o usuário em flow. Acima disso, o engajamento cai.

**Regras de código:**
| Tempo da operação | Feedback obrigatório |
|-------------------|---------------------|
| Qualquer clique/tap | Mudança visual CSS em 100ms (`:active`, `:hover`) |
| Submit de formulário | Botão entra em loading em 100ms |
| Operação <1s | Spinner ou skeleton |
| Operação 1s–3s | Spinner com texto ("Processando...") |
| Operação >3s | Progress bar OU background + notificação |
| Operação >10s | Background, liberar UI, notificar quando concluir |

**BLOCKER:**
```
❌ Ação sem nenhum feedback visual imediato (aparência de "botão quebrado")
❌ Botão que não desabilita/entra em loading durante submit
❌ Tela que "trava" sem indicação enquanto processa
```

---

### LEI 8 — Goal-Gradient: Mostre o Progresso

**Definição:** Usuários aceleram e persistem mais quando veem que estão perto do objetivo.

**Regras de código:**
- Fluxos com >2 etapas: **obrigatório** indicador de progresso (stepper, progress bar, "Etapa 2 de 4")
- Campos de texto longo: contador de caracteres próximo ao limite
- Upload/carregamento: percentual + estimativa de tempo restante

**BLOCKER:**
```
❌ Fluxo multi-step sem indicador de progresso
❌ Upload sem barra de progresso
❌ Formulário longo sem indicação de quanto falta
```

---

### LEI 9 — Peak-End: Projete o Final com Cuidado

**Definição:** As pessoas julgam uma experiência pelo pico emocional e pelo final — não pela média.

**Regras de código:**
- Estado de sucesso: deve ser visualmente celebrativo (ícone de confirmação, cor positiva, mensagem clara)
- Última tela de um fluxo: deve confirmar O QUE foi feito E qual é o próximo passo
- Erro no fim do fluxo: máxima clareza sobre o que falhou E como corrigir

**BLOCKER:**
```
❌ Tela de sucesso que parece a mesma que a de carregamento (sem celebração visual)
❌ Mensagem de confirmação que não diz o que foi confirmado
❌ Fluxo que termina sem indicar próximo passo ou estado final
```

---

### LEI 10 — Von Restorff: Destaque o Que É Único

**Definição:** Itens que diferem dos demais são melhor lembrados e percebidos como importantes.

**Regras de código:**
- Use cor, tamanho ou peso APENAS para destacar o elemento mais importante
- Badges, tags de "Novo", "Recomendado": aplique com parcimônia (máximo 1-2 por tela)
- CTA primário: visualmente diferente de TODOS os outros elementos interativos

**BLOCKER:**
```
❌ Múltiplos elementos com a mesma cor de destaque (dilui a atenção)
❌ CTA primário com mesmo peso visual que CTAs secundários
❌ Badge de destaque em >30% dos itens de uma lista
```

---

## PARTE 2 — HIERARQUIA VISUAL

### Sistema de 3 Níveis (Inviolável)

Toda tela deve ter exatamente **3 pesos visuais**:

```
NÍVEL 1 — PRIMÁRIO (1 elemento por tela)
  ↓ Maior, mais pesado, maior contraste, mais isolado
  Exemplo: CTA principal, título da hero section

NÍVEL 2 — SECUNDÁRIO (2–5 elementos)
  ↓ Médio, suporte ao primário
  Exemplo: títulos de seção, botões secundários, cards de destaque

NÍVEL 3 — TERCIÁRIO (todo o resto)
  ↓ Menor, mais leve, menor contraste
  Exemplo: texto de corpo, labels, metadados, links de suporte
```

### Como Criar Hierarquia (por propriedade, em ordem de poder)

| Propriedade | Exemplo | Poder |
|-------------|---------|-------|
| Tamanho | 32px vs 14px | Máximo |
| Peso | bold vs regular | Alto |
| Cor (contraste) | #242424 vs #777777 | Alto |
| Cor (hue) | teal vs cinza | Médio |
| Posição | centro/topo vs rodapé | Médio |
| Espaço em branco | isolamento via padding | Médio |
| Capitulação | UPPERCASE vs normal | Baixo |

### BLOCKER de Hierarquia
```
❌ Tela com zero elemento de destaque claro (hierarquia plana)
❌ Mais de 1 elemento em NÍVEL 1 (divide e dilui a atenção)
❌ Título H1 com mesmo tamanho do texto de corpo
❌ Botão primário com mesma cor que elementos decorativos
```

---

## PARTE 3 — GESTÃO DE CARGA COGNITIVA

### Os 5 Mandamentos

1. **REDUZA:** Remova tudo que não serve ao objetivo primário do usuário nessa tela. Se não sabe para que serve, remove.
2. **AGRUPE:** Informações relacionadas no mesmo container/área visual (Gestalt Proximity).
3. **SEQUENCIE:** Operações complexas em etapas — nunca exponha tudo de uma vez.
4. **GUIE:** O olhar do usuário deve ter um caminho claro (F-pattern em listas, Z-pattern em conteúdo simples).
5. **FAMILIARIZE:** Use padrões que o usuário já conhece — inove na função, não na forma.

### Teste dos 3 Segundos
Antes de qualquer entrega de UI, aplique este teste mentalmente:
> "Um usuário novo abrindo esta tela pela primeira vez consegue, em 3 segundos:
> 1. Entender ONDE está?
> 2. Entender O QUE pode fazer?
> 3. Ver QUAL é a ação principal?"

Se a resposta for NÃO para qualquer um: **a tela falha no teste e precisa ser revisada.**

### Progressive Disclosure — Quando Aplicar

| Situação | Aplicar PD? | Como |
|----------|-------------|------|
| Formulário com >6 campos | ✅ Obrigatório | Stepper ou grupos colapsáveis |
| Card com info densa | ✅ Recomendado | "Ver mais" / accordion |
| Tabela com muitas colunas | ✅ Recomendado | Colunas ocultas por default |
| Formulário simples com ≤5 campos | ❌ Desnecessário | Mostrar tudo |
| Tela de confirmação | ❌ Evitar | Mostrar resumo completo |

---

## PARTE 4 — SISTEMA DE TIPOGRAFIA

### Escala Fixa (usar apenas estes valores)
| Nível | Tamanho | Peso | Line-height | Uso |
|-------|---------|------|-------------|-----|
| Display | 40–48px | 700 | 1.1 | Hero, splash (uma vez por página) |
| H1 | 28–32px | 700 | 1.2 | Título principal da tela (UMA por tela) |
| H2 | 22–24px | 600 | 1.3 | Títulos de seção |
| H3 | 18–20px | 600 | 1.3 | Subtítulos, títulos de card |
| H4 | 16px | 600 | 1.4 | Títulos internos de componente |
| Body Large | 16px | 400 | 1.6 | Texto principal, parágrafos longos |
| Body | 14px | 400 | 1.5 | Corpo padrão |
| Label | 14px | 500 | 1.4 | Labels de formulário |
| Caption | 12px | 400 | 1.4 | Textos de suporte, erros inline |
| Micro | 10–11px | 400 | 1.3 | Badges, timestamps (nunca texto de leitura) |

### Regras Absolutas de Tipografia
```
✅ Máximo 1 H1 por tela
✅ Nunca usar H3 sem H2 acima (salvo componentes standalone)
✅ Comprimento máximo de linha: 65 caracteres (use max-width)
✅ Texto nunca justificado (only left-align para leitura)
✅ Truncar com ellipsis SOMENTE se tooltip com texto completo existir
✅ Nunca misturar mais de 2 famílias tipográficas no mesmo componente

❌ 5 tamanhos diferentes em uma única tela (usar no máximo 3)
❌ Texto de 10px como conteúdo de leitura
❌ Line-height < 1.4 para body text (dificulta leitura)
❌ Peso 300 (light) para texto menor que 16px (péssimo contraste)
```

---

## PARTE 5 — RITMO DE ESPAÇAMENTO

### Grade de 4px — Regra Universal

**Todos** os valores de spacing devem ser múltiplos de 4:
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 80 · 96 · 128`

### Escala Semântica
| Token | Valor | Uso canônico |
|-------|-------|--------------|
| `space-1` | 4px | Entre ícone e label |
| `space-2` | 8px | Entre elementos do mesmo grupo (label ↔ input) |
| `space-3` | 12px | Gap interno de componente composto |
| `space-4` | 16px | Entre grupos do mesmo nível (campo ↔ campo) |
| `space-5` | 24px | Entre seções pequenas |
| `space-6` | 32px | Entre seções médias |
| `space-8` | 40px | Entre seções grandes |
| `space-10` | 48px | Padding de card/container principal |
| `space-16` | 64px | Entre blocos de página |
| `space-24` | 96px | Margens de hero sections |

### Regra Gestalt de Espaçamento
```
gap_entre_grupos ≥ 2× gap_dentro_do_grupo

Correta hierarquia de espaços (do menor para o maior):
  icon ↔ label (4px)
  label ↔ input (8px)
  input ↔ mensagem de erro (4px)
  campo ↔ próximo campo (20px)
  grupo ↔ próximo grupo (40px)
  seção ↔ próxima seção (64px)
```

---

## PARTE 6 — MÁQUINA DE ESTADOS DE COMPONENTE

### Estados Obrigatórios por Tipo

**REGRA UNIVERSAL: Nenhum componente interativo pode ser considerado completo sem todos os seus estados implementados.**

#### Botão
| Estado | Visual | Código |
|--------|--------|--------|
| `default` | Cor base, cursor:pointer | - |
| `hover` | 10-15% mais escuro OU transform translateY(-1px) | `:hover` |
| `focus` | Focus ring 2px offset (WCAG) | `:focus-visible` |
| `active` | Pressed, escala 0.97 | `:active` |
| `loading` | Spinner + texto "Aguarde..." + `disabled` | `:disabled` |
| `disabled` | 40% opacity, cursor:not-allowed | `:disabled` |
| `success` (opcional) | Checkmark, cor success (auto-reverte em 2s) | via JS |

#### Input / Campo de Texto
| Estado | Visual |
|--------|--------|
| `empty` | Placeholder visível, borda default |
| `focus` | Borda primary color, label flutua (se floating label) |
| `filled` | Valor presente, borda default |
| `error` | Borda #dc3545, ícone de erro, mensagem abaixo |
| `success` | Borda #10b981, ícone de check |
| `disabled` | Background #e6e6e6, cursor:not-allowed, sem interação |
| `readonly` | Aparência de input, sem cursor de edição |

#### Select / Dropdown
| Estado | Visual |
|--------|--------|
| `closed/default` | Seta down visível |
| `focused` | Borda primary, seta muda para up |
| `open` | Lista visível, item ativo destacado |
| `selected` | Valor exibido no trigger |
| `error` | Borda vermelha |
| `disabled` | 40% opacity |

#### Checkbox / Toggle / Radio
| Estado | Visual |
|--------|--------|
| `unchecked` | Borda visível, interior vazio |
| `hover` | Borda primary hover |
| `focus` | Focus ring |
| `checked` | Fill color + ícone check |
| `indeterminate` | Fill parcial (só checkbox) |
| `disabled` | 40% opacity, cursor:not-allowed |

#### Card Clicável
| Estado | Visual |
|--------|--------|
| `default` | Sombra nível 1 |
| `hover` | Sombra nível 2 + transform translateY(-2px) |
| `focus` | Focus ring externo |
| `active` | Sombra nível 0 + translateY(0) |
| `selected` | Borda primary, ícone de seleção |
| `disabled` | 40% opacity |

---

## PARTE 7 — PADRÕES DE INTERAÇÃO

### Princípio de Feedback Imediato
**Toda ação do usuário deve ter resposta visual em ≤100ms.**

| Ação | Resposta imediata | Resposta de resultado |
|------|-------------------|----------------------|
| Clique em botão | Estado `:active` CSS | Loading → Success/Error |
| Digite no input | Valor aparece, máscara aplica | Validação no blur |
| Selecione option | Opção marcada visualmente | — |
| Arraste slider | Valor atualiza em tempo real | — |
| Upload de arquivo | Progress bar imediata | Confirmação de upload |
| Delete de item | Remoção otimista + undo | Confirmação/rollback |

### Regra Undo > Confirm
```
PREFIRA: Fazer a ação + oferecer Undo (5-10s)
EVITE:   Dialog de confirmação antes de toda ação

USE CONFIRM APENAS PARA:
  - Exclusão permanente irreversível (delete account, drop table)
  - Ação com consequência financeira alta (transferência, pagamento)
  
NUNCA USE CONFIRM PARA:
  - Exclusão reversível
  - Navegação para outra tela
  - Cancelamento de formulário (apenas limpar campos)
```

### Validação de Formulário — Sequência Correta
```
1. PREVENT (máscara, limitar caracteres) → erro impossível
2. WARN no blur (validação local, sem envio) → sinal amarelo/vermelho
3. CORRECT no submit (validação final) → bloquear + scroll ao primeiro erro
4. CONFIRM no sucesso → feedback positivo claro

NUNCA:
  - Validar no keystroke (agressivo, interrompe digitação)
  - Mostrar erro antes de o usuário terminar de digitar
  - Validação apenas no submit (tarde demais, frustrante)
```

### Otimistic UI — Quando Aplicar
```
APLICAR QUANDO:
  - Operação tem >95% de chance de sucesso
  - Rollback é simples (remover o item, reverter toggle)
  - Latência perceptível (>200ms)

Fluxo: Atualizar UI imediatamente → processar em background → rollback + erro se falhar

EXEMPLOS CORRETOS:
  ✅ Marcar item como concluído (toggle imediato)
  ✅ Like/dislike (toggle visual imediato)
  ✅ Reordenar lista via drag (reorder imediato)

EXEMPLOS INCORRETOS:
  ❌ Transferência bancária (nunca otimista — confirmar no servidor antes)
  ❌ Delete sem undo disponível (nunca otimista)
```

---

## PARTE 8 — SISTEMA DE COR SEMÂNTICO

> **Consuma sempre o TOKEN semântico — nunca o hex.** Os hex abaixo são só referência de qual primitive o token aponta; no código vai o token. Ver `design-tokens.instructions.md` (arquitetura) e `color-harmony.instructions.md` (disciplina de paleta).

### Papéis Semânticos (token → primitive de referência)
| Papel | Token a usar | (ref. primitive) | Quando usar | Quando NÃO usar |
|-------|--------------|------------------|-------------|-----------------|
| **Ação principal** | `--color-action-primary` | teal | CTA único mais importante | Status, decoração |
| **Destrutivo** | `--color-feedback-danger` | vermelho | Errors, delete, danger | Warnings |
| **Warning** | `--color-feedback-warning` | âmbar | Atenção, validação parcial | Erros reais |
| **Sucesso** | `--color-feedback-success` | verde | Confirmação, válido | Informação neutra |
| **Info** | `--color-feedback-info` | azul | Informação neutra | Ações, decoração |
| **Muted** | `--color-text-muted` | cinza | Secundário, desabilitado | Texto de leitura |

### Harmonia — Regra 60-30-10 (ver color-harmony.instructions.md)
```
60% neutro dominante + 30% neutro secundário + 10% UM acento de marca.
Hierarquia se faz com PESO / TAMANHO / ESPAÇO — cor é o último recurso.
Cores de feedback (danger/success/warning/info) SÓ comunicam estado, nunca decoram.
```

### Regras Invioláveis de Cor
```
✅ Consumir sempre o token semântico (var(--color-*)) — nunca hex hardcoded
✅ Nunca usar cor como único comunicador de estado (sempre + ícone ou texto)
✅ Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande (WCAG AA)
✅ --color-feedback-danger somente para erros reais — não para warnings
✅ --color-action-primary somente para ação principal — não para badges decorativos

❌ Hex hardcoded no componente (#00d8d8) — BLOQUEADO por dock-ds/no-unauthorized-colors
❌ Cores de feedback usadas como decoração — BLOQUEADO por dock-ds/no-decorative-feedback-colors
❌ Semáforo de cores sem label (daltônicos — 8% da população masculina)
❌ Vermelho para "obrigatório" em labels (reservar para erros)
❌ Verde apenas para "preenchido" (reservar para confirmação)
❌ Acento de marca em mais de 1 elemento CTA por view
```

---

## PARTE 9 — AFFORDANCE DESIGN

### Elementos Devem Parecer o Que São
| Tipo | Deve ter | Não deve ter |
|------|----------|-------------|
| Botão | Aparência clicável (bg, border, shape) | Visual idêntico a texto plano |
| Link | Sublinhado OU cor diferente do body | Visual igual ao texto ao redor |
| Input | Borda visível OU background contrastante | Visual de texto estático |
| Card clicável | Cursor pointer, hover state | Aparência de bloco de texto |
| Dropdown | Ícone de seta/chevron | Aparência de texto estático |
| Elemento arrastável | Ícone de drag handle OU cursor:grab | Aparência de elemento fixo |

### Anti-affordances (parecer interativo sem ser)
```
❌ Texto sublinhado que não é link
❌ Elementos com hover state mas não clicáveis
❌ Ícones que parecem botões mas são decorativos sem cursor:default explícito
❌ Cards visualmente "clicáveis" que não têm ação associada
```

---

## PARTE 10 — CHECKLIST PÓS-IMPLEMENTAÇÃO (GATE DE ENTREGA)

Execute ANTES de declarar qualquer componente ou tela como completo.

### Visual (BLOCKER se qualquer item falhar)
- [ ] Hierarquia visual clara? (1 primário, 2-5 secundários, resto terciário)
- [ ] Espaçamento segue grade de 4px?
- [ ] Tipografia usa apenas a escala definida (máximo 3 tamanhos por tela)?
- [ ] Ícones com estilo unificado (todos outline OU todos solid)?
- [ ] Nenhum elemento "quase alinhado" (alinhamento estrito)?
- [ ] Cores seguem o sistema semântico?

### UX (BLOCKER se qualquer item falhar)
- [ ] Teste dos 3 segundos passou?
- [ ] Ação primária é óbvia e acessível (Fitts)?
- [ ] Máximo 3 ações primárias visíveis (Hick)?
- [ ] Fluxo multi-step tem indicador de progresso (Goal-Gradient)?
- [ ] Estado de sucesso é visualmente positivo (Peak-End)?

### Estados de Componente (BLOCKER)
- [ ] Todos os estados obrigatórios do tipo implementados?
- [ ] Hover, focus, active, disabled presentes?
- [ ] Loading state no submit (botão desabilitado durante request)?
- [ ] Erro com mensagem específica e ação de recovery?
- [ ] Empty state com CTA se houver lista?

### Interação (BLOCKER)
- [ ] Toda ação tem feedback visual em ≤100ms?
- [ ] Validação de formulário acontece no blur (não keystroke)?
- [ ] Mensagem de erro específica com instrução de correção?
- [ ] Confirmação usada APENAS para ações irreversíveis?

### Acessibilidade (BLOCKER — WCAG 2.2 AA)
- [ ] Contraste mínimo 4.5:1 para texto?
- [ ] Focus ring visível em todos os interativos?
- [ ] Alvos mínimos de 44×44px (mobile)?
- [ ] Cor não é único comunicador de estado?
- [ ] Labels associadas aos inputs (for/id ou aria-label)?
- [ ] Erros anunciados via role="alert"?

### Performance (WARNING se falhar)
- [ ] Nenhum layout shift no carregamento (imagens com width/height)?
- [ ] Skeleton screens para conteúdo assíncrono?
- [ ] Animações somente em opacity/transform (não width/height)?
- [ ] prefers-reduced-motion respeitado?

---

## PARTE 11 — ANTI-PATTERNS ABSOLUTOS

Lista de coisas que **NUNCA** devem aparecer em qualquer entrega de front-end.

### Hierarquia e Visual
```
❌ Tela com hierarquia plana (tudo tem o mesmo peso visual)
❌ Mais de 1 elemento PRIMÁRIO na mesma tela
❌ 4+ tamanhos de fonte diferentes em uma única tela
❌ Mistura de estilos de ícone (outline + solid juntos)
❌ Box-shadow com 5 valores diferentes no mesmo contexto
❌ Gradientes decorativos que não existem no design system
```

### UX e Fluxo
```
❌ Tela sem ação principal clara
❌ Fluxo multi-step (>2 etapas) sem progress indicator
❌ Confirmação dialog para ações reversíveis
❌ Tela de sucesso genérica ("Operação realizada") sem especificar o que
❌ Erro vago ("Algo deu errado") sem instrução de correção
❌ Formulário que limpa todos os campos após erro de submit
❌ Botão que não dá feedback durante processamento
```

### Estados e Interação
```
❌ Componente interativo sem estado de hover
❌ Componente interativo sem estado de focus visível
❌ Botão sem estado de disabled/loading durante submit
❌ Input sem estado de error visual
❌ Lista vazia sem empty state explicativo
❌ Ação assíncrona sem loading indicator
```

### Acessibilidade
```
❌ Cor como único comunicador (sem ícone + texto)
❌ Input sem label associada
❌ Contraste < 4.5:1 para texto de leitura
❌ Elemento interativo não acessível por teclado
❌ Modal/dialog que não armadilha o foco (focus trap ausente)
❌ Imagem informativa sem alt text
```

### Performance e Animação
```
❌ Animação de width/height/margin/padding (causa reflow)
❌ Spinner permanente enquanto usuário pode fazer outra coisa
❌ Animação sem respeito ao prefers-reduced-motion
❌ Layout shift visível ao carregar (CLS > 0.1)
```

---

## REFERÊNCIA RÁPIDA — Decision Tree de UI

```
Criando componente ou tela? → Execute PRÉ-VOO (4 perguntas)
  ↓
Tem mais de 3 ações primárias? → Aplique Hick's Law (reduzir/esconder)
  ↓
Tem mais de 6 campos? → Aplique Progressive Disclosure (stepper/grupos)
  ↓
É multi-step (>2)? → Adicione progress indicator (Goal-Gradient)
  ↓
Tem ação assíncrona? → Mapeie todos os estados (loading, success, error)
  ↓
É interativo? → Implemente todos os estados de componente obrigatórios
  ↓
Antes de entregar → Execute Checklist Pós-Implementação
  ↓
Qualquer BLOCKER? → Corrigir antes de declarar completo
```
