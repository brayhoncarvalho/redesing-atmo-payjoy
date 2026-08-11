---
description: "Criar nova tela/screen Vue do zero com gate DS, scaffold completo, máscara/validação se form, teste a11y e registro de rota."
name: "Nova Tela"
argument-hint: "Nome da tela e descrição do que ela faz (ex: 'Tela de login com email e senha')"
tools: [read, edit, search, execute]
---

# Workflow: Criar Nova Tela

Siga este workflow passo a passo:

## 1. Coletar Informações

Pergunte ao usuário (se não fornecido):
- Nome da tela (ex: "Login", "Cadastro", "Dashboard")
- Propósito / funcionalidade principal
- Se há campos de formulário, quais tipos de dados

## 2. Determinar Design System

Aplique o gate DS:
- Se o usuário mencionou "Figma", "print", "screenshot" → Modo Figma (pedir nó/print)
- Se NÃO mencionou Figma → Modo Storybook (usar shared-design-system-vue-lib automaticamente)
- Se ambíguo → Perguntar UMA vez

## 3. Verificar Componentes do DS

Se modo Storybook:
- Listar componentes necessários do `shared-design-system-vue-lib`
- Verificar se todos existem no pacote
- Se algum não existe → perguntar: criar local ou aguardar DS?

## 4. Gerar Scaffold

Criar `src/components/{Nome}Screen.vue` com:
- `<script setup lang="ts">`
- Imports do DS (se Storybook) ou styles locais (se Figma)
- Template com estrutura semântica (header, main, footer se aplicável)
- Props/emits tipados se necessário

## 5. Formulários (se aplicável)

Se a tela tem campos de formulário:
- Identificar tipo de cada campo (CPF, email, telefone, data, etc.)
- Importar/criar máscaras de `src/utils/masks.ts`
- Importar/criar validadores de `src/utils/validators.ts`
- Implementar: v-model + máscara em tempo real + validação no blur/submit + erro inline
- Se máscara/validator não existe ainda → criar + adicionar teste unitário

## 6. Registrar Rota

- Adicionar a nova tela no sistema de navegação (`App.vue` ou router)
- **APENAS se a tela estiver visualmente completa**
- Se incompleta → NÃO conectar à navegação ainda

## 7. Testes

- Adicionar componente ao array de `a11y.spec.ts`
- Rodar `npm run test:a11y` para verificar acessibilidade
- Rodar `npm run validate` para verificar conformidade geral

## 8. Validação Final

- Confirmar que todos os elementos interativos funcionam
- Verificar WCAG 2.2 AA: foco, contraste, labels, keyboard nav
- Se modo Figma → comparar visualmente com referência
