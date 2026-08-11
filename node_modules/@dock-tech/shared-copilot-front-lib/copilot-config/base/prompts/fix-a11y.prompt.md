---
description: "Auditar e corrigir violações de acessibilidade WCAG 2.2 AA em componentes Vue usando axe-core e revisão manual."
name: "Fix A11y"
argument-hint: "Componente ou tela com problemas de acessibilidade (ex: 'PropostaScreen')"
tools: [read, edit, execute, search]
---

# Workflow: Fix Acessibilidade

## 1. Rodar Audit Automatizado

```bash
npm run test:a11y
```

Capturar todas as violations reportadas pelo axe-core.

## 2. Para Cada Violation

### Classificar Impacto
- **Critical**: Bloqueia uso para usuários com deficiência (ex: sem label em input)
- **Serious**: Dificulta significativamente (ex: contraste insuficiente)
- **Moderate**: Causa inconveniência (ex: tab order não intuitiva)
- **Minor**: Melhoria recomendada (ex: landmark redundante)

### Explicar o Problema
- O que está errado em linguagem simples
- Quem é impactado (screen reader, keyboard, low vision, etc.)
- Qual critério WCAG 2.2 é violado

### Implementar Fix
- Aplicar a correção mínima necessária
- Não alterar layout/design sem perguntar

## 3. Verificação Manual (além do axe)

Coisas que axe NÃO detecta:
- [ ] Tab order faz sentido lógico?
- [ ] Focus trap em modals funciona?
- [ ] Mensagens de erro são anunciadas por screen reader?
- [ ] Estados (loading, success, error) têm aria-live?
- [ ] Cor NÃO é o único indicador de estado?
- [ ] Textos são compreensíveis fora de contexto?
- [ ] Alvos de toque ≥ 44x44px?

## 4. Re-rodar Teste

```bash
npm run test:a11y
```

Confirmar que violations foram resolvidas.
Se novas violations surgiram (pelo fix), resolver também.

## 5. Relatório Final

Listar:
- Violations encontradas (antes)
- Fixes aplicados
- Status final (passou/ainda tem issues)
- Recomendações manuais pendentes
