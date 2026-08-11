---
applyTo: "src/**/*.vue"
---

# Console App — Regras Específicas

## Layout
- Sidebar fixa à esquerda com navegação principal.
- Conteúdo principal em área com scroll independente.
- Responsivo: sidebar colapsa em telas < 768px (md breakpoint).
- Breadcrumbs em todas as telas internas.

## Tabelas
- SEMPRE usar `<DockTable>` do DS — nunca `<table>` nativo.
- Toda tabela DEVE ter: loading state, empty state, paginação, ordenação nas colunas relevantes.
- Para listas com > 10 itens, paginar (10/25/50 por página).
- Incluir campo de busca/filtro quando a lista pode ter > 20 itens.

## CRUD
- Listagem: tabela com ações (editar, excluir, visualizar).
- Criação/Edição: modal ou tela dedicada com formulário validado.
- Exclusão: modal de confirmação OBRIGATÓRIO antes de ação destrutiva.
- Toast de feedback após ação (sucesso/erro).

## Formulários
- Usar `<DsInput>`, `<DsSelect>`, `<DsButton>` do DS.
- Formulários complexos: dividir em steps (usar `<DsStepper>`).
- Validação inline em blur + validação geral no submit.
- Campos monetários: máscara BRL obrigatória.
- Campos de documento: máscara CPF/CNPJ obrigatória.

## Navegação
- Vue Router com guards de autenticação.
- 404 page com link para dashboard.
- Loading global durante navegação (NProgress ou similar).

## Feedback
- Toast para ações rápidas (salvar, excluir, copiar).
- Modal para confirmações destrutivas.
- Skeleton/shimmer durante carregamento de dados.
- Empty states com ilustração e CTA.
