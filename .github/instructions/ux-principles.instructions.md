---
applyTo: "src/**/*.vue"
description: >
  Leis de UX, hierarquia visual e carga cognitiva aplicados automaticamente.
  Complementa accessibility.instructions.md e ui-states.instructions.md com
  princípios comportamentais e perceptivos de design centrado no usuário.
---

# UX Principles — Regras Aplicadas Automaticamente

## Propósito
Estas regras são aplicadas SEMPRE que um arquivo `.vue` for criado ou modificado.
Elas garantem que toda interface seja guiada por princípios de UX mensuráveis — não por intuição.

---

## REGRA 1 — Hierarquia Visual Obrigatória

Toda tela/componente DEVE ter 3 níveis visuais claros:

```
PRIMÁRIO: 1 elemento dominante por tela (CTA principal, título hero)
SECUNDÁRIO: 2–5 elementos de suporte (títulos de seção, ações secundárias)
TERCIÁRIO: Tudo o mais (corpo, labels, metadados)
```

**Checklist antes de implementar:**
- [ ] Existe exatamente 1 elemento PRIMÁRIO?
- [ ] O elemento primário é visivelmente maior/mais pesado/mais contrastante que os demais?
- [ ] Texto de corpo não tem o mesmo peso que títulos?

**BLOCKER:** Hierarquia plana (tudo igual), múltiplos elementos PRIMÁRIOS, H1 do mesmo tamanho do body.

---

## REGRA 2 — Lei de Fitts (Alvos Interativos)

```vue
<!-- ❌ ERRADO: botão minúsculo, difícil de clicar -->
<button class="text-sm px-1 py-0.5">Confirmar</button>

<!-- ✅ CORRETO: área de clique adequada -->
<button class="min-h-[48px] px-6 py-3 text-base font-medium">Confirmar</button>
```

**Regras:**
- CTA principal: `min-height: 48px` desktop / `min-height: 56px` mobile
- Todo interativo mobile: `min-height: 44px; min-width: 44px`
- Ícone clicável sem label: wrapper com `min-w-[44px] min-h-[44px] flex items-center justify-center`

**BLOCKER:** Botão primário menor que botão secundário na mesma tela.

---

## REGRA 3 — Lei de Hick (Limite de Escolhas)

```vue
<!-- ❌ ERRADO: 5 ações primárias visíveis -->
<div class="flex gap-2">
  <button class="btn-primary">Salvar</button>
  <button class="btn-primary">Exportar</button>
  <button class="btn-primary">Imprimir</button>
  <button class="btn-primary">Compartilhar</button>
  <button class="btn-primary">Duplicar</button>
</div>

<!-- ✅ CORRETO: 1 primário + restante agrupado ou secundário -->
<div class="flex gap-2">
  <button class="btn-primary">Salvar</button>
  <DropdownMenu label="Mais ações">
    <DropdownItem @click="exportar">Exportar</DropdownItem>
    <DropdownItem @click="imprimir">Imprimir</DropdownItem>
    <DropdownItem @click="compartilhar">Compartilhar</DropdownItem>
    <DropdownItem @click="duplicar">Duplicar</DropdownItem>
  </DropdownMenu>
</div>
```

**Regras:**
- Máximo 3 ações primárias visíveis simultaneamente
- Formulário com >6 campos: aplicar stepper ou grupos colapsáveis
- Menu com >7 itens: separar em grupos com divider

---

## REGRA 4 — Doherty Threshold (Feedback <400ms)

**Toda ação do usuário DEVE ter feedback visual em ≤100ms.**

```vue
<!-- ❌ ERRADO: sem feedback durante submit -->
<button @click="submit">Enviar</button>

<!-- ✅ CORRETO: loading + disabled durante submit -->
<button
  @click="submit"
  :disabled="isSubmitting"
  :aria-busy="isSubmitting"
  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
>
  <span v-if="isSubmitting" class="inline-flex items-center gap-2">
    <svg class="animate-spin h-4 w-4" aria-hidden="true">...</svg>
    Enviando...
  </span>
  <span v-else>Enviar</span>
</button>
```

**Operações assíncronas — tempo de resposta:**
| Duração | O que mostrar |
|---------|---------------|
| <400ms | Estado de loading no botão |
| 400ms–1s | Spinner na área de conteúdo |
| 1s–3s | Spinner + texto informativo |
| >3s | Progress bar + estimativa |
| >10s | Background + notificação ao concluir |

---

## REGRA 5 — Proximity (Gestalt — Agrupamento)

**Elementos relacionados devem estar mais próximos entre si do que de elementos não-relacionados.**

```vue
<!-- ❌ ERRADO: label, input e erro com mesmo espaçamento (gap 16px em tudo) -->
<div class="space-y-4">
  <label>Nome</label>
  <input v-model="nome" />
  <span class="error">Campo obrigatório</span>
  <label>Email</label>
  <input v-model="email" />
</div>

<!-- ✅ CORRETO: label/input/erro agrupados (8px interno), grupos separados (20px) -->
<div class="flex flex-col gap-5">
  <div class="flex flex-col gap-2">
    <label for="nome" class="font-medium text-sm">Nome</label>
    <input id="nome" v-model="nome" />
    <span v-if="nomeError" class="text-[#dc3545] text-xs">{{ nomeError }}</span>
  </div>
  <div class="flex flex-col gap-2">
    <label for="email" class="font-medium text-sm">Email</label>
    <input id="email" v-model="email" />
    <span v-if="emailError" class="text-[#dc3545] text-xs">{{ emailError }}</span>
  </div>
</div>
```

**Regra numérica:** `gap_entre_grupos ≥ 2× gap_dentro_do_grupo`

---

## REGRA 6 — Jakob's Law (Padrões Conhecidos)

**Não inove na forma quando inovar na função basta.**

| Elemento | Posição padrão esperada | NUNCA fazer |
|----------|------------------------|-------------|
| Logo | Canto superior esquerdo, clicável → home | Logo não clicável |
| Botões de dialog | Cancelar esquerda, Confirmar direita | Inverter posição |
| Erro de campo | Abaixo do input, vermelho | Acima do input, modal |
| Navegação principal | Topo ou sidebar esquerda | Sidebar direita sem justificativa |
| Logout/Perfil | Canto superior direito | Posição aleatória |
| Busca | Header, ícone de lupa | Rodapé |

---

## REGRA 7 — Progressive Disclosure

**Não mostre tudo de uma vez. Revele na medida que o usuário avança.**

```vue
<!-- ❌ ERRADO: formulário de 10 campos exposto de uma vez -->
<!-- ...10 campos planos... -->

<!-- ✅ CORRETO: formulário com 3 passos -->
<Stepper :current="step" :total="3">
  <StepPanel :active="step === 1">
    <!-- Apenas dados básicos (2-3 campos) -->
  </StepPanel>
  <StepPanel :active="step === 2">
    <!-- Dados complementares -->
  </StepPanel>
  <StepPanel :active="step === 3">
    <!-- Confirmação e submit -->
  </StepPanel>
</Stepper>
```

**Quando aplicar Progressive Disclosure:**
- Formulário com >6 campos → stepper ou seções colapsáveis
- Conteúdo técnico com detalhes opcionais → accordion/toggle
- Fluxo com decisões dependentes → mostrar próximo passo após decisão anterior

---

## REGRA 8 — Validation Timing (Prevenção antes de Correção)

```
Ordem de prioridade (aplicar de cima para baixo):
1. PREVENT  → Máscara que torna erro impossível (CPF, datas, moeda)
2. CONSTRAIN → Input type correto (type="email", type="number")
3. WARN     → Validação no blur (antes do submit, sinal amarelo/vermelho)
4. CORRECT  → Erro no submit (bloquear + scroll ao primeiro erro)
```

```vue
<!-- ✅ Validação no blur (não no keystroke) -->
<input
  v-model="email"
  type="email"
  @blur="validateEmail"
  :class="{ 'border-[#dc3545]': emailError, 'border-[#10b981]': emailValid }"
  :aria-invalid="!!emailError"
  :aria-describedby="emailError ? 'email-error' : undefined"
/>
<span
  v-if="emailError"
  id="email-error"
  role="alert"
  class="text-[#dc3545] text-xs mt-1"
>
  {{ emailError }}
</span>
```

**BLOCKER:** Validar no keystroke (agressivo), mostrar erro antes do usuário terminar de digitar.

---

## REGRA 9 — Undo > Confirmation Dialogs

```vue
<!-- ❌ ERRADO: dialog de confirmação para ação reversível -->
<button @click="showDeleteConfirm = true">Remover item</button>
<Dialog v-if="showDeleteConfirm">
  <p>Tem certeza que deseja remover?</p>
  <button @click="delete">Sim</button>
  <button @click="showDeleteConfirm = false">Não</button>
</Dialog>

<!-- ✅ CORRETO: ação + undo (para reversíveis) -->
<button @click="removeWithUndo(item)">Remover item</button>
<!-- Toast aparece com countdown de 5s -->
<Toast type="warning" :duration="5000">
  Item removido.
  <button @click="undoRemove(item)">Desfazer</button>
</Toast>
```

**Quando usar Confirmation Dialog:**
- Exclusão permanente e irreversível (conta, dados históricos)
- Ação com consequência financeira alta

**Quando usar Undo Toast:**
- Exclusão de item em lista (reversível)
- Arquivamento, ocultação
- Qualquer ação "desfazível"

---

## REGRA 10 — Success State Design (Peak-End Rule)

**O estado de sucesso deve ser visualmente positivo — não neutro.**

```vue
<!-- ❌ ERRADO: sucesso invisível -->
<p>Operação realizada.</p>

<!-- ✅ CORRETO: sucesso celebrativo e informativo -->
<div class="flex flex-col items-center py-12 text-center">
  <div class="w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center mb-4">
    <svg class="w-8 h-8 text-white" aria-hidden="true"><!-- checkmark --></svg>
  </div>
  <h2 class="text-xl font-bold text-[#242424]">Proposta enviada!</h2>
  <p class="text-[#5c5c5c] mt-2 max-w-sm">
    Sua proposta foi enviada com sucesso. Você receberá uma resposta em até 2 dias úteis.
  </p>
  <button class="mt-6 btn-primary" @click="goHome">Voltar ao início</button>
</div>
```

**Checklist do estado de sucesso:**
- [ ] Ícone visual positivo (check, estrela, confetti)
- [ ] Cor de sucesso (#10b981 ou primária)
- [ ] Mensagem confirma O QUE foi feito (não apenas "sucesso")
- [ ] Indica próximo passo ou ação disponível

---

## REGRA 11 — Affordance Design

Todo elemento deve parecer o que é:

```vue
<!-- ❌ ERRADO: texto que é botão mas não parece botão -->
<span @click="submit" class="text-[#00d8d8]">Confirmar</span>

<!-- ✅ CORRETO: botão com aparência de botão -->
<button
  @click="submit"
  class="bg-[#00d8d8] text-white px-6 py-3 rounded font-medium hover:bg-[#1cc0c0] cursor-pointer"
>
  Confirmar
</button>
```

| Tipo | Deve ter | Não deve ter |
|------|----------|-------------|
| Botão | bg/border, cursor:pointer, hover state | Visual idêntico a texto |
| Link | cor diferente + underline hover | Visual igual ao texto ao redor |
| Input | borda visível OU bg contrastante | Aparência de texto estático |
| Card clicável | cursor:pointer, hover state | Visual de bloco de texto |
| Ícone decorativo | `aria-hidden="true"` | Aparência de elemento interativo |

---

## Checklist Automático (aplicar antes de considerar a tela pronta)

```
HIERARQUIA
  [ ] 1 elemento primário dominante por tela?
  [ ] Máx 3 tamanhos de fonte diferentes?
  [ ] H1 visivelmente maior que H2?

INTERAÇÃO
  [ ] Todo interativo com hover + focus + active + disabled?
  [ ] Botão de submit com loading state?
  [ ] Validação de formulário no blur (não keystroke)?

ESTADOS
  [ ] Empty state com CTA?
  [ ] Error state com mensagem específica + retry?
  [ ] Success state visualmente positivo?

UX LAWS
  [ ] Máx 3 ações primárias simultâneas?
  [ ] Alvos ≥ 44×44px em mobile?
  [ ] Fluxo multi-step com progress indicator?
  [ ] Undo disponível para ações reversíveis?
```
