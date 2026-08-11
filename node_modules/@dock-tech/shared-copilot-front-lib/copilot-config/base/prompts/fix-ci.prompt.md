---
mode: agent
description: "Inspeciona checks GitHub Actions com falha no PR atual, extrai os logs relevantes, propõe um plano de correção e implementa após aprovação explícita."
---

# Fix CI — Corrigir GitHub Actions com falha

## Workflow

1. **Verificar autenticação**
   ```bash
   gh auth status
   ```
   Se não autenticado: pedir para rodar `gh auth login` (escopos: `repo` + `workflow`).

2. **Resolver o PR atual**
   ```bash
   gh pr view --json number,url,headRefName
   ```

3. **Inspecionar checks com falha** (GitHub Actions apenas)
   ```bash
   gh pr checks <número> --json name,state,detailsUrl
   ```
   Para cada check falhando:
   ```bash
   # Extrair run_id da detailsUrl
   gh run view <run_id> --json name,workflowName,conclusion,status
   gh run view <run_id> --log 2>&1 | tail -200
   ```
   Se o log ainda estiver em progresso:
   ```bash
   gh api "/repos/<owner>/<repo>/actions/jobs/<job_id>/logs"
   ```

4. **Resumir as falhas para o usuário**
   - Nome do check, URL do run, snippet do log com o erro
   - Explicitar se algum log não estava disponível

5. **Propor plano de correção**
   - Listar as mudanças necessárias em ordem
   - **Aguardar aprovação explícita antes de implementar**

6. **Implementar após aprovação**
   - Uma correção de cada vez
   - Manter os testes rodando a cada mudança

7. **Verificar novamente**
   ```bash
   gh pr checks <número>
   ```

## Escopo

- ✅ Workflows GitHub Actions
- ❌ Providers externos (Buildkite, Jenkins/Everlast) — reportar só a URL de detalhes

## Nota sobre Everlast Pipeline

O CI da Dock roda no Everlast (Jenkins). Para falhas no Everlast, acessar
o link da pipeline diretamente no Jenkins — não é possível inspecionar via `gh`.
Para os workflows GitHub Actions do Design System (lint, typecheck, test, security),
o workflow acima se aplica normalmente.
