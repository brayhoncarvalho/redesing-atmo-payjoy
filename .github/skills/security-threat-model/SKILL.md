---
name: security-threat-model
description: "Gera um threat model AppSec baseado no repositório: mapeia trust boundaries, assets, capacidades do atacante, caminhos de abuso e mitigações. Use quando o usuário pedir 'threat model', 'modelagem de ameaças', 'análise de segurança do repositório', ou quiser enumerar abuse paths. Especialmente relevante para código fintech (pagamentos, PIX, dados LGPD)."
argument-hint: "Escopo do threat model (ex: 'toda a aplicação', 'apenas autenticação', 'fluxo PIX')"
---

# Threat Model — Dock Fintech

Threat model AppSec ancorado no código real do repositório. Nada genérico —
cada ameaça é vinculada a evidências no código, com priorização por impacto financeiro/regulatório.

---

## Contexto fintech Dock

Antes de iniciar, considerar os vetores de risco específicos de fintech:

| Ativo | Impacto de comprometimento |
|---|---|
| Dados CPF/CNPJ | Violação LGPD — multa + dano reputacional |
| Chaves PIX | Fraude financeira direta |
| Tokens de autenticação | Tomada de conta |
| Dados de cartão | PCI-DSS breach |
| Histórico de transações | Dados sensíveis de negócio |
| Credenciais de API Dock | Acesso a infraestrutura de pagamentos |

---

## Workflow (8 passos — não pular)

### 1) Coletar inputs e escopo

- Caminho do repo e paths in-scope
- Modelo de deploy, exposição à internet, auth esperada
- Arquitetura existente (ler `ARCHITECTURE.md` se existir)
- Perguntar ao usuário se algum fluxo específico é o foco (PIX, autenticação, APIs externas...)

### 2) Modelar o sistema

- Identificar componentes principais, data stores, integrações externas
- Separar runtime de CI/build/dev tooling
- **NÃO afirmar controles sem evidência no código**

### 3) Derivar boundaries, assets e entry points

- **Trust boundaries** — onde muda o nível de confiança (autenticado/anônimo, frontend/backend, interno/externo)
- **Assets de risco** — dados PII, credenciais, tokens, dados de transação, artefatos de build
- **Entry points** — endpoints, upload surfaces, parsers, triggers de jobs, logging sinks

### 4) Calibrar capacidades do atacante

- Descrever atacantes realistas baseados na exposição do sistema
- **Explicitar não-capacidades** — evitar inflar severidade com cenários impossíveis
- Para fintech: considerar script kiddies, fraude organizada, insider threat, regulador adversarial

### 5) Enumerar ameaças como abuse paths

Preferir objetivos do atacante mapeados a assets:

| Categoria | Exemplos no contexto Dock |
|---|---|
| **Exfiltração de dados** | CPF/CNPJ em logs, transações expostas via API |
| **Escalação de privilégio** | Bypass de autorização em operações financeiras |
| **Integridade** | Manipulação de valores de transação |
| **Disponibilidade** | DoS em fluxo crítico de pagamento |
| **Supply chain** | Dependência comprometida no `shared-design-system-vue-lib` |

### 6) Priorizar com likelihood × impact

- Qualitativo: baixo/médio/alto com justificativa curta
- **Crítico** = pre-auth RCE, auth bypass, acesso cross-tenant, exfiltração de dados sensíveis, roubo de chaves
- **Alto** = DoS de componente crítico, exposição parcial de dados, bypass de rate-limit com impacto mensurável
- **Médio** = info leaks de baixa sensibilidade, requer precondições prováveis
- **Baixo** = issues com mitigação trivial, precondições improváveis

### 7) Validar com o usuário

- Resumir os 3–5 assumptions que mais afetam o ranking
- Fazer 1–3 perguntas targeted: owner/ambiente, escala, authn/authz, exposição real, sensibilidade de dados
- **Aguardar confirmação antes de gerar o relatório final**

### 8) Escrever o threat model

Output: arquivo `threat-model.md` (ou `<nome-do-repo>-threat-model.md`) com:

```markdown
# Threat Model — <Projeto>

## Executive Summary
<3 bullets: escopo, ameaça principal, prioridade de remediação>

## Sistema e Escopo
<Componentes, integrações externas, o que está fora de escopo>

## Trust Boundaries
<Tabela: boundary | protocolo | auth | criptografia | validação>

## Assets de Risco
<Lista de assets com classificação de sensibilidade>

## Ameaças (ordenadas por prioridade)

### [CRÍTICO] AM-001 — <título>
- **Asset afetado:** <...>
- **Entry point:** <...>
- **Abuse path:** <descrição do ataque>
- **Evidência no código:** `<arquivo:linha>`
- **Likelihood:** Alto | **Impact:** Crítico
- **Mitigação existente:** <se houver>
- **Mitigação recomendada:** <específica, com local no código>

### [ALTO] AM-002 — ...

## Assumptions e Open Questions
<O que permanece incerto e como afeta o ranking>

## Controles Existentes
<Gitleaks, npm audit, DOMPurify, LGPD-gitleaks rules, etc.>
```

---

## Regras

- **Toda ameaça precisa de evidência no código** — não incluir ameaças hipotéticas sem ancoragem
- Distinguir mitigações existentes (com evidência) de recomendadas
- Preferir hints de implementação específicos ("enforce schema at gateway") vs genérico ("validate inputs")
- Para LGPD: qualquer ameaça envolvendo CPF/CNPJ/dados pessoais tem impact = crítico automaticamente

---

## Recursos

- `security.instructions.md` — regras de segurança do projeto
- `.gitleaks.toml` — secrets scanning rules (CPF, CNPJ, tokens Dock)
- `SECURITY.md` — política de disclosure
