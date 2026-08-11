---
description: "Auditoria de seguranca AppSec orientada por OWASP Top 10 + OWASP ASVS, com classificacao de severidade e plano de mitigacao."
mode: agent
tools: read, search, execute
argument-hint: "Escopo da auditoria (arquivo, tela, fluxo ou modulo)"
---

# Audit Security - Protocolo AppSec

Voce foi acionado para auditar a seguranca do escopo: `{{ESCOPO}}`.

## Fase 1 - Preparacao

1. Ler `.github/agents/security-auditor.agent.md` se existir.
2. Ler `security.instructions.md` relevante do projeto.
3. Identificar superficie de ataque no escopo:
   - autenticacao e sessao
   - formularios e validacao
   - chamadas HTTP/fetch
   - renderizacao de HTML dinamico
   - dados sensiveis (PII, tokens, credenciais)

## Fase 2 - Checklist Tecnico

Verificar explicitamente:

1. Secrets expostos no frontend (`VITE_*` com key/token/secret/password).
2. Risco de XSS (`v-html`, `innerHTML`) sem sanitizacao.
3. Uso proibido de `eval`, `new Function`, `document.write`.
4. Open redirect e manipulacao insegura de URL.
5. Links externos com `target="_blank"` sem `rel="noopener noreferrer"`.
6. Suposicao de seguranca apenas client-side (sem reforco backend).
7. Dependencias vulneraveis/desatualizadas.
8. Exposicao de erro interno para usuario final.

## Fase 3 - Mapeamento OWASP

Para cada achado, mapear para categoria OWASP Top 10:
- A01 Broken Access Control
- A02 Cryptographic Failures
- A03 Injection
- A04 Insecure Design
- A05 Security Misconfiguration
- A06 Vulnerable and Outdated Components
- A07 Identification and Authentication Failures
- A08 Software and Data Integrity Failures
- A09 Security Logging and Monitoring Failures
- A10 Server-Side Request Forgery (quando aplicavel)

## Fase 4 - Validacoes Automatizadas (quando disponivel)

Executar apenas o que existir no projeto:

```bash
npm audit --production
npm run lint:dock-ds
npm run validate
```

Se algum comando nao existir, registrar como gap de automacao (nao inventar resultado).

## Fase 5 - Relatorio Obrigatorio

Entregar sempre nesse formato:

```markdown
# Security Audit - {Escopo}

## Resumo
- Critical: X
- High: X
- Medium: X
- Low: X

## Achados (ordenados por severidade)
| # | Severidade | OWASP | Evidencia | Risco | Correcao |
|---|------------|-------|-----------|-------|----------|
| 1 | High | A03 Injection | src/... | ... | ... |

## Gaps de Automacao
- ...

## Plano de Mitigacao
1. Acao imediata (critical/high)
2. Acao de curto prazo
3. Acao estrutural
```

## Regras de Execucao

- Priorizar findings por severidade (critical -> low).
- Nao expor secrets no output.
- Nao afirmar mitigacao sem evidencia objetiva.
- Se houver risco critical, recomendar bloqueio de merge ate correcao.
