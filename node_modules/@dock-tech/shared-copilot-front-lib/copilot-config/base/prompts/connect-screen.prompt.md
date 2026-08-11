---
description: "Conectar tela nova ao fluxo de navegação (App.vue), respeitando a regra de só conectar se visualmente completa."
name: "Connect Screen"
argument-hint: "Nome da tela a conectar e de onde vem / para onde vai"
tools: [read, edit, search]
---

# Workflow: Conectar Tela à Navegação

## PRÉ-REQUISITO OBRIGATÓRIO

**Antes de conectar:** Verificar se a tela está visualmente completa.
- Se modo Figma: comparar com referência visual — todos os elementos presentes?
- Se modo Storybook: todos os componentes do DS importados e estilizados?
- Se INCOMPLETA → **NÃO conectar.** Informar o que falta.

## 1. Identificar Pontos de Conexão

Perguntar (se não informado):
- De qual tela/botão o usuário chega nesta nova tela?
- Para onde o usuário vai DEPOIS desta tela?
- Há botão "voltar"? Para onde leva?

## 2. Verificar Sistema de Navegação

Ler `App.vue` (ou router se existir):
- Como funciona a navegação? (ref + query string? Vue Router? Event emits?)
- Qual o padrão existente para trocar de tela?

## 3. Implementar Navegação

- Registrar a nova tela no switch/map de telas
- Adicionar handler no botão que leva a ela (`@click="navigate('nome-tela')"`)
- Adicionar handler no botão "voltar" (se aplicável)
- Manter consistência com o padrão de navegação existente

## 4. Testar Fluxo

- Verificar que navegar para a tela funciona
- Verificar que voltar funciona
- Verificar que a URL/query reflete a tela atual (se aplicável)
- Verificar que não há tela "presa" (sem saída)

## 5. Validar

- Rodar `npm run validate` para garantir que nada quebrou
- Confirmar que a tela conectada está completa visualmente
