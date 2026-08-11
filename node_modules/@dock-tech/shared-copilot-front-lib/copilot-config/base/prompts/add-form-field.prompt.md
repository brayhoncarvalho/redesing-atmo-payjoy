---
description: "Adicionar campo de formulário com máscara em tempo real, validação, feedback visual e testes unitários."
name: "Add Form Field"
argument-hint: "Tipo do campo: CPF, CNPJ, telefone, data, moeda BRL, CEP, email, nome"
tools: [read, edit, execute]
---

# Workflow: Adicionar Campo de Formulário

## 1. Identificar Tipo de Dado

Perguntar ao usuário (se não informado):
- Tipo: CPF | CNPJ | CPF/CNPJ auto | Telefone | Data | Moeda BRL | CEP | Email | Nome | Outro
- Obrigatório? (default: sim)
- Placeholder text?
- Label text?

## 2. Verificar Utils Existentes

Verificar se já existem em `src/utils/`:
- `masks.ts` → função de máscara para o tipo?
- `validators.ts` → função de validação para o tipo?

Se NÃO existem → criar (step 3).
Se já existem → pular para step 4.

## 3. Criar Máscara + Validação (se necessário)

### Em `src/utils/masks.ts`:
- Criar função pura `mask{Tipo}(value: string): string`
- Aplicar formatação progressiva ao digitar
- Retornar string formatada

### Em `src/utils/validators.ts`:
- Criar função pura `validate{Tipo}(value: string): string | null`
- Retornar `null` se válido, mensagem de erro se inválido
- Para CPF/CNPJ: validar dígitos verificadores (módulo 11)

### Em `src/utils/__tests__/`:
- Adicionar testes para a nova máscara
- Adicionar testes para a nova validação
- Testar: caso normal, caso vazio, caso inválido, caso limite

Rodar: `npm run test`

## 4. Implementar Campo no Componente

```vue
<template>
  <div>
    <label :for="fieldId">{{ label }}</label>
    <input
      :id="fieldId"
      v-model="displayValue"
      type="text"
      :placeholder="placeholder"
      :class="{ 'border-error': error }"
      :aria-describedby="error ? errorId : undefined"
      :aria-invalid="!!error"
      @input="onInput"
      @blur="onBlur"
    />
    <span v-if="error" :id="errorId" class="error-message" role="alert">
      {{ error }}
    </span>
  </div>
</template>
```

### Requisitos:
- `v-model` com valor formatado (display) e valor limpo (interno)
- Máscara aplicada em `@input`
- Validação em `@blur` e no submit do form
- Borda vermelha `#dc3545` quando erro
- Mensagem de erro inline, 12px, cor `#dc3545`
- `aria-describedby` apontando para mensagem de erro
- `aria-invalid="true"` quando inválido

## 5. Validação

- Rodar `npm run test` (unit tests)
- Rodar `npm run test:a11y` (acessibilidade)
- Verificar: foco visível, label associada, erro anunciado por screen reader
