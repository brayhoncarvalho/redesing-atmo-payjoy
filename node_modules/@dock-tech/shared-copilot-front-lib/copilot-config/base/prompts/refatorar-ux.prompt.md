---
description: >
  Refatora uma tela ou componente existente para atingir o padrão de UI limpa e fluída.
  Aplica hierarquia visual, leis de UX, estados completos e affordance correto.
  Nunca altera funcionalidade — apenas eleva a qualidade visual e de interação.
mode: agent
tools: read, search, execute, web
argument-hint: "Path do componente a refatorar (ex: src/components/HeroSection.vue)"
---

# Refatoração UX — Interface Limpa e Fluída

Você foi chamado para **refatorar o componente/tela**: `{{COMPONENTE_PATH}}`

**Objetivo:** Elevar a qualidade visual e de interação sem alterar funcionalidade.
**Constraint:** A funcionalidade deve permanecer 100% idêntica após a refatoração.

---

## PROTOCOLO DE REFATORAÇÃO

### Fase 1 — Diagnóstico (antes de qualquer alteração)

1. Ler `copilot-config/base/skills/frontend-master/SKILL.md`.
2. Ler o componente alvo e entender sua funcionalidade atual.
3. Ler `DESIGN_SYSTEM.md` se existir.
4. Produzir um **Relatório de Diagnóstico** identificando:

```markdown
## Diagnóstico — {ComponenteName}

### Problemas de Hierarquia Visual
- {problema 1}
- {problema 2}

### Estados Faltando
- {botão X sem hover/focus/loading}
- {input sem estado de error}

### Problemas de Spacing/Layout
- {espaçamento inconsistente}
- {alinhamento fora da grade de 4px}

### Problemas de Microcopy
- {label pouco descritiva}
- {botão sem verbo de ação}

### Oportunidades de Melhoria
- {hierarquia pode ser reforçada}
- {progressive disclosure aplicável}
```

5. **Apresentar o diagnóstico e AGUARDAR aprovação** antes de qualquer alteração de código.

---

### Fase 2 — Plano de Refatoração

Após o diagnóstico, apresentar o plano de mudanças:

```markdown
## Plano de Refatoração

### Mudanças Propostas

| Prioridade | Tipo | Elemento | Mudança | Motivo |
|------------|------|----------|---------|--------|
| 1 (BLOCKER) | Visual | Botão "Enviar" | Adicionar loading state | Doherty Threshold |
| 2 (BLOCKER) | A11y | Input "Email" | Adicionar aria-describedby | WCAG 2.2 AA |
| 3 (WARNING) | Visual | Espaçamento seção 2 | gap: 24px → 32px | Grade 4px |
| 4 (OPT) | UX | Empty state | Adicionar CTA | Hick's Law |

### O que NÃO será alterado
- Lógica de negócio (validações, cálculos, chamadas de API)
- Estrutura de dados (props, emits, v-model)
- Texto/copy de produto (apenas labels de ação se necessário)
```

6. **Apresentar o plano e AGUARDAR aprovação** antes de implementar.

---

### Fase 3 — Implementação da Refatoração

Executar as mudanças aprovadas, aplicando os seguintes padrões:

#### 3.1 — Hierarquia Visual
- Identificar o elemento PRIMÁRIO e garantir que ele é visivelmente dominante
- Rebaixar elementos secundários (outline style, peso menor, cor muted)
- Unificar tamanhos de fonte usando apenas a escala definida
- Alinhar todos os espaçamentos na grade de 4px

#### 3.2 — Estados de Componente
Para cada componente interativo, adicionar os estados faltantes:

```vue
<!-- Exemplo: Botão sem estados → Botão com todos estados -->

<!-- ANTES -->
<button @click="submit" class="bg-teal-500 text-white px-4 py-2 rounded">
  Enviar
</button>

<!-- DEPOIS -->
<button
  @click="submit"
  :disabled="isSubmitting"
  :aria-busy="isSubmitting"
  class="
    min-h-[48px] px-6 py-3 rounded font-medium
    bg-[#00d8d8] text-white
    hover:bg-[#1cc0c0]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d8d8] focus-visible:ring-offset-2
    active:scale-[0.97]
    disabled:opacity-40 disabled:cursor-not-allowed
    transition-all duration-100
  "
>
  <span v-if="isSubmitting" class="inline-flex items-center gap-2">
    <svg class="animate-spin h-4 w-4" aria-hidden="true"><!-- spinner --></svg>
    Enviando...
  </span>
  <span v-else>Enviar</span>
</button>
```

#### 3.3 — Espaçamento (Grade de 4px)
Substituir todos os valores não-múltiplos de 4 pelos equivalentes corretos:

| Valor atual | Substituir por |
|-------------|---------------|
| 6px | 8px |
| 10px | 8px ou 12px |
| 14px | 16px |
| 18px | 16px ou 20px |
| 22px | 24px |
| 26px | 24px |
| 30px | 32px |

#### 3.4 — Tipografia
Verificar e corrigir:
- H1: máximo 1 por tela
- Escala de tamanhos consistente com o sistema definido
- Line-height adequado (1.4-1.6 para body)
- Peso de fonte condizente com hierarquia

#### 3.5 — Affordance
```vue
<!-- ❌ Elemento interativo sem aparência interativa -->
<span @click="verMais" class="text-teal-500">Ver mais</span>

<!-- ✅ Link com aparência de link -->
<button
  @click="verMais"
  class="text-[#00d8d8] font-medium underline hover:text-[#1cc0c0] focus-visible:ring-1 transition-colors"
>
  Ver mais
</button>
```

#### 3.6 — Feedback de Ações Assíncronas
Para cada ação assíncrona identificada, garantir:

```vue
<script setup>
const isLoading = ref(false)
const error = ref<string | null>(null)

async function handleAction() {
  isLoading.value = true
  error.value = null
  try {
    await apiCall()
    // sucesso
  } catch (e) {
    error.value = 'Não foi possível completar a ação. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}
</script>
```

#### 3.7 — Mensagens e Microcopy
Padrões a aplicar:

| Situação | Antes (errado) | Depois (correto) |
|----------|---------------|-----------------|
| Botão de submit | "OK" / "Confirmar" | "[Verbo] [objeto]" → "Enviar proposta" |
| Erro de campo | "Inválido" | "CPF inválido. Verifique os dígitos." |
| Empty state | "Sem dados" | "Nenhuma proposta encontrada. Crie sua primeira proposta." |
| Sucesso | "Sucesso!" | "Proposta enviada! Você receberá retorno em até 2 dias úteis." |
| Loading | spinner vazio | "Enviando proposta..." |

#### 3.8 — Transições (se ausentes)
Adicionar transições nas mudanças de estado:

```vue
<!-- Aparição de erro inline -->
<Transition name="slide-down">
  <p v-if="error" class="text-[#dc3545] text-xs mt-1" role="alert">{{ error }}</p>
</Transition>

<!-- Troca de conteúdo (loading → conteúdo) -->
<Transition name="fade" mode="out-in">
  <div v-if="isLoading" class="skeleton" />
  <div v-else>{{ conteúdo }}</div>
</Transition>
```

---

### Fase 4 — Validação Pós-Refatoração

Após implementar, executar o checklist completo:

```markdown
## Checklist de Validação Pós-Refatoração

### Hierarquia Visual
- [ ] 1 elemento primário dominante?
- [ ] Espaçamentos na grade de 4px?
- [ ] Máximo 3 tamanhos de fonte?

### Interação
- [ ] Todos os botões com hover + focus + active + loading + disabled?
- [ ] Todos os inputs com focus + error + disabled?
- [ ] Loading state em todas as ações assíncronas?

### Feedback
- [ ] Erros com mensagem específica e instrução de correção?
- [ ] Sucesso com confirmação do que foi feito?
- [ ] Empty states com CTA?

### Acessibilidade
- [ ] Focus ring visível?
- [ ] Contraste ≥4.5:1?
- [ ] Cores não são únicos comunicadores?
- [ ] Labels em todos os inputs?

### Funcionalidade (regressão)
- [ ] Lógica de negócio inalterada?
- [ ] Todos os eventos/emits funcionando?
- [ ] v-model funcionando?
- [ ] Props tipadas corretas?
```

---

### Fase 5 — Sumário de Alterações

Emitir relatório final:

```markdown
## Sumário de Refatoração — {ComponenteName}

### Alterações Realizadas

| Categoria | Quantidade | Exemplos |
|-----------|------------|---------|
| Estados adicionados | X | hover, focus, loading em 3 botões |
| Espaçamentos corrigidos | X | 7 valores ajustados para grade de 4px |
| Microcopy melhorado | X | 4 labels e 2 mensagens de erro |
| Transições adicionadas | X | fade em 2 elementos, slide-down em 3 erros |
| ARIA attributes | X | aria-label, aria-describedby em 5 campos |

### Funcionalidade — Confirmação
✅ Sem alterações em lógica de negócio
✅ Todos os eventos/emits inalterados
✅ TypeScript sem erros

### Próximos passos recomendados (não incluídos nesta PR)
- {oportunidade de melhoria maior que não cabia nesta refatoração}
```

---

## Regras da Refatoração

- **Nunca alterar lógica de negócio** sem aprovação explícita do usuário.
- **Nunca remover funcionalidade** mesmo que pareça redundante.
- **Sempre apresentar diagnóstico + plano** antes de implementar.
- **Sempre executar o checklist de regressão** ao final.
- **Se o componente usa DS incorretamente:** apontar no diagnóstico, mas só corrigir com aprovação.
