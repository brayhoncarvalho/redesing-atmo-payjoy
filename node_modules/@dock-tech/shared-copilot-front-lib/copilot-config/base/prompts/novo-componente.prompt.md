---
description: "Adicionar componente visual reutilizável, verificando primeiro se já existe no DS Dock (shared-design-system-vue-lib)."
name: "Novo Componente"
argument-hint: "Tipo de componente (ex: Card, Modal, Badge, Tabs)"
tools: [read, edit, search]
---

# Workflow: Novo Componente

## 1. Verificar Existência no DS

Antes de criar qualquer componente, verificar se já existe no `shared-design-system-vue-lib`:
- Buscar no código por imports existentes do pacote
- Consultar a skill `dock-ds-knowledge` se disponível
- Verificar node_modules/shared-design-system-vue-lib/

## 2. Se EXISTE no DS

- Importar diretamente: `import { ComponentName } from 'shared-design-system-vue-lib'`
- Mostrar ao usuário as props disponíveis e variantes
- Usar conforme documentação do pacote
- **NÃO recriar manualmente**

## 3. Se NÃO existe no DS

Perguntar ao usuário:
> "O componente `{Nome}` não existe no pacote shared-design-system-vue-lib. Devo:
> 1. Criar localmente em `src/components/shared/` seguindo os tokens do DS?
> 2. Aguardar inclusão no Design System? (abrir issue)"

Se criar local:
- Criar em `src/components/shared/{Nome}.vue`
- Usar tokens do DS (cores, fontes, espaçamentos do tailwind.config.js)
- Manter API similar ao padrão do DS (props: size, variant, disabled)
- Adicionar ao a11y.spec.ts

## 4. Checklist Final

- [ ] Componente usa tokens do DS (não inventa cores/fontes)
- [ ] Props tipadas com TypeScript
- [ ] Acessibilidade: role, aria-label, keyboard nav
- [ ] Responsivo (se aplicável)
