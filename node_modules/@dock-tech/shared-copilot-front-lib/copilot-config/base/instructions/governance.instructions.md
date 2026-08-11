---
applyTo: "**/*.{md,yaml,json}"
description: "Governança do framework: versionamento de instructions, ownership, exceções ao DS, métricas de adoção e processo de mudança."
---

# Governança — Padrões do Framework

## Princípio
**Regras só valem se forem mantidas, versionadas e mensuráveis.** A governança garante que o framework escala sem degradação.

---

## 1. Versionamento de Instructions

### Semver para o shared-copilot-front-lib
```
MAJOR.MINOR.PATCH

MAJOR: breaking change (regra removida, instrução renomeada, comportamento invertido)
MINOR: nova regra/instrução adicionada, nova feature do framework
PATCH: correção, esclarecimento, typo fix
```

### Exemplo
```
1.0.0 → 1.1.0 (adicionou security.instructions.md)
1.1.0 → 1.2.0 (adicionou responsiveness.instructions.md)
1.2.0 → 2.0.0 (removeu regra antiga de slider, mudou padrão de folder structure)
```

### CHANGELOG obrigatório
Toda mudança em instructions/prompts/agents DEVE ter entrada no `copilot-config/CHANGELOG.md`:

```markdown
## [1.2.0] - 2026-05-19
### Added
- `security.instructions.md` — regras de env vars, XSS, anti-bot
- `ui-states.instructions.md` — loading, error, empty states
- `responsiveness.instructions.md` — breakpoints e mobile-first

### Changed
- `dock-ds.config.json` — expandido preferImport de 6 para 38 componentes

### Fixed
- Typo em form-patterns: "moduloo" → "módulo"
```

---

## 2. Ownership (CODEOWNERS)

### Arquivo: `.github/CODEOWNERS`
```
# Design System Framework
copilot-config/                   @dock/ds-core-team
.github/instructions/             @dock/ds-core-team
.github/copilot-instructions.md   @dock/ds-core-team

# Instructions específicas
.github/instructions/security*    @dock/security-team @dock/ds-core-team
.github/instructions/a11y*        @dock/a11y-champions @dock/ds-core-team
.github/instructions/form*        @dock/frontend-leads

# Config de projeto
dock-ds.config.json               @dock/ds-core-team
dock.yaml                         @dock/platform-team
```

### Regras
- Toda mudança em instructions requer review de pelo menos 1 owner.
- Mudanças MAJOR requerem 2 approvals + label `instructions-breaking-change`.
- Owners são responsáveis por manter instrução atualizada e válida.

---

## 3. Exceções ao Design System

### Processo formal de exceção

Quando um projeto precisa desviar do DS (cor custom, componente fora do pacote, fonte diferente):

1. **Documentar** a exceção em `dock-ds.config.json`:
```json
{
  "exceptions": [
    {
      "rule": "no-unauthorized-colors",
      "value": "#ff6b35",
      "reason": "Cor de campanha sazonal aprovada pelo Design Lead",
      "approvedBy": "nome.sobrenome@dock.tech",
      "expiresAt": "2026-12-31",
      "ticket": "DOCK-1234"
    }
  ]
}
```

2. **Aprovação** obrigatória do DS Core Team (via PR review).
3. **Expiração** — toda exceção deve ter data de expiração ou ser permanente com justificativa.
4. **Ticket** — toda exceção deve estar vinculada a um ticket (Jira, GitHub Issue).

### Classificação de exceção
| Tipo | Exemplo | Processo |
|------|---------|----------|
| Temporária (campanha) | Cor sazonal, banner especial | Aprovação DS Lead, expira em 90 dias |
| Funcional (limitação do DS) | Componente que DS não oferece | Aprovação DS Lead + backlog para inclusão no DS |
| Permanente (requisito de negócio) | Marca parceira com cor obrigatória | Aprovação DS Lead + Design Director |

---

## 4. Métricas e Monitoramento

### Dashboard de adoção (gerado por compliance-report.mjs)

| Métrica | Como medir | Target | Frequência |
|---------|------------|--------|------------|
| DS Component Usage | % imports de `@dock-tech/*` vs nativos | ≥ 90% | Por PR |
| Color Compliance | % files sem hex fora da allowlist | 100% | Por PR |
| Font Compliance | % files sem fontes banidas | 100% | Por PR |
| A11y Score | Violations axe-core | 0 critical/serious | Por PR |
| Test Coverage (utils) | Vitest coverage | ≥ 95% | Por PR |
| Bundle Size | gzip total | ≤ budget | Por build |
| Overall Compliance Score | Média ponderada | ≥ 80 | Semanal |

### Tracking histórico
- `compliance-report.mjs` gera `.dock-compliance.json` a cada execução.
- CI deve armazenar como artefato para comparação histórica.
- Opcional: enviar para dashboard central (Grafana, DataDog, custom).

### Alertas
| Condição | Ação |
|----------|------|
| Score caiu > 10 pontos entre releases | Notificar DS Core Team |
| Novo projeto sem shared-copilot-front-lib | Alertar na criação do repo |
| Exceção expirada mas ainda em uso | Bloquear PR + notificar owner |

---

## 5. Processo de Mudança em Instructions

### Fluxo para alterar regra existente

```
1. Criar branch: instructions/change-description
2. Fazer a alteração
3. Atualizar CHANGELOG.md
4. Rodar testes: node copilot-config/tests/instruction-tests.mjs
5. Rodar evals: node copilot-config/tests/prompt-evals.mjs
6. Abrir PR com label: instructions-change
7. Obter approval de CODEOWNER
8. Merge → bumpar version no package.json
9. Comunicar no canal #dock-ds-frontend
```

### Fluxo para nova instrução

```
1. Criar branch: instructions/add-new-topic
2. Criar arquivo em .github/instructions/ com YAML frontmatter correto
3. Definir applyTo pattern adequado
4. Adicionar cenário de eval em copilot-config/evals/scenarios.json
5. Atualizar CHANGELOG.md
6. Rodar testes de integridade
7. Abrir PR com label: instructions-new
8. Obter approval de CODEOWNER
9. Merge → bumpar MINOR version
10. Comunicar
```

---

## 6. Deprecação de Regras

### Processo
1. Marcar regra como deprecated no arquivo (adicionar seção `## ⚠️ Deprecated`).
2. Manter funcionando por 1 release cycle (mínimo 2 semanas).
3. Remover na próxima MAJOR version.
4. Documentar alternativa/substituto no CHANGELOG.

### Exemplo
```markdown
## ⚠️ Deprecated — será removido na v3.0.0
A regra X foi substituída por Y. Migrar até 2026-06-30.
Substituto: ver `new-instruction.instructions.md`
```

---

## 7. Comunicação de Mudanças

| Tipo de mudança | Canal | Formato |
|-----------------|-------|---------|
| Nova instrução (MINOR) | Slack #dock-ds-frontend | Post com resumo + link para PR |
| Breaking change (MAJOR) | Slack #dock-ds-frontend + email DS mailing list | Post detalhado + migration guide |
| Bug fix (PATCH) | CHANGELOG apenas | Entrada no changelog |
| Nova exceção aprovada | Slack #dock-ds-frontend | Motivo + ticket + expiração |

---

## Anti-Patterns (NUNCA fazer)

❌ Mudar instrução sem CHANGELOG entry
❌ Aprovar exceção sem ticket vinculado
❌ Exceção sem data de expiração (exceto permanente com justificativa formal)
❌ Remover regra sem deprecation period
❌ Ignorar CODEOWNERS review
❌ Deploy de mudança de instrução sem rodar testes de integridade
❌ Score < 80 em compliance e continuar mergeando
❌ Múltiplos projetos com config divergente sem exceção formal
