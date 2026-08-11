---
applyTo: "src/**/*.{vue,css,ts,js}"
description: >
  Disciplina de harmonia de cor — impede o "arco-íris" que a IA tende a produzir.
  Define a regra 60-30-10, acento único de marca, reserva das cores de feedback
  para estado, e hierarquia por peso/tamanho/espaço (não por cor nova).
  Complementa design-tokens (de onde vêm as cores) e ux-principles §8 (papéis semânticos).
  Enforçada por dock-ds/no-decorative-feedback-colors e dock-ds/no-unauthorized-colors.
---

# Harmonia de Cor — Paleta Disciplinada

## Princípio Inviolável

**Uma interface harmônica usa POUCAS cores com intenção — não muitas cores "porque existem".**
A hierarquia visual nasce de **peso, tamanho e espaço** — não de introduzir hues novos. Cor é o último recurso de hierarquia, nunca o primeiro.

> Se a marca é teal, a tela é **teal + neutros**. Não vira arco-íris só porque os tokens de feedback (verde, âmbar, azul, vermelho) existem na paleta. Eles existem para comunicar **estado** — não para decorar.

Esta é a causa nº 1 de UI que "parece de IA": espalhar cores semânticas como decoração, diluindo a atenção e confundindo o usuário sobre o que é clicável, o que é alerta e o que é só enfeite.

---

## A Regra 60-30-10

Toda tela distribui cor nesta proporção:

```
60%  →  NEUTRO dominante      (fundo, superfícies)      — carrega o layout
30%  →  NEUTRO secundário     (bordas, texto muted, cards)
10%  →  1 ÚNICO ACENTO        (a cor de ação da marca)  — guia o olho ao que importa
```

- O **acento** (`--color-action-primary`) aparece em ~10% da tela: o CTA principal, um destaque pontual. Nunca em tudo.
- Os **90% restantes são neutros.** É o branco/cinza/escuro que faz o acento saltar.
- **Hierarquia entre elementos neutros** se faz com **peso de fonte, tamanho e espaçamento** — ver `frontend-master` Parte 2 e `ux-principles` Regra 1.

**BLOCKER:** tela onde a cor de marca (ou qualquer acento) ocupa muito mais que ~10% da área visual — o acento perde força e a hierarquia colapsa.

---

## Cores de Feedback: SÓ para Estado

As cores de feedback têm **significado fixo** e uso **restrito a estado real**:

| Token | Significado | Uso permitido | NUNCA |
|-------|-------------|---------------|-------|
| `--color-feedback-danger` | Erro / destrutivo | Mensagem de erro, validação falha, ação destrutiva | Borda decorativa, fundo de card "porque ficou bonito" |
| `--color-feedback-success` | Confirmação | Sucesso de operação, campo válido | Ícone decorativo, divisória |
| `--color-feedback-warning` | Atenção | Aviso, validação parcial | Destaque de marketing |
| `--color-feedback-info` | Informação neutra | Dica, banner informativo | Fundo de seção, acento visual |

**Regra de ouro:** uma cor de feedback só aparece quando há um **estado** sendo comunicado — e idealmente acompanhada de `role="alert"`/`role="status"`, ícone e texto (cor nunca é o único comunicador — WCAG).

**BLOCKER:**
```
❌ Cor de feedback como background/borda de elemento sem estado
   (sem role="alert"/"status", sem aria-live, sem significado de status)
❌ Mais de 1 hue de feedback aparecendo junto como decoração
   (verde + âmbar + azul na mesma tela "para colorir" = arco-íris)
❌ Usar info-azul como se fosse a cor de marca
```

> Enforçado automaticamente por `dock-ds/no-decorative-feedback-colors`:
> dispara em (1) mistura de ≥2 hues de feedback no mesmo arquivo e (2) cor de feedback como background sem contexto de estado.

---

## Hierarquia SEM Cor Nova

Quando precisar destacar algo, suba nesta ordem **antes** de pensar em cor:

```
1. TAMANHO        → maior = mais importante           (poder máximo)
2. PESO           → bold vs regular
3. ESPAÇO         → isolar com whitespace
4. CONTRASTE      → texto escuro vs muted (mesma família neutra)
5. POSIÇÃO        → topo/centro vs rodapé
6. COR (acento)   → só o acento de marca, e só no elemento nº 1  (último recurso)
```

**Nunca** introduza um hue novo para criar hierarquia. Dois cinzas de contraste diferente resolvem 90% dos casos. O acento de marca resolve o 10% restante (o CTA).

---

## Paleta de Dados / Gráficos (exceção controlada)

Data-viz é o único contexto que legitimamente precisa de várias cores (séries de um gráfico). Mesmo assim:
- Use uma **paleta categórica derivada da marca** (tons análogos/monocromáticos do teal + 1–2 neutros), não as cores de feedback.
- Máximo ~6 categorias; acima disso, agrupe.
- Ver `data-viz.instructions.md`. As cores de feedback (danger/success) só entram em gráfico quando representam **estado** (ex: barra vermelha = inadimplência).

---

## Decisão — Que Cor Usar?

```
Preciso aplicar cor a um elemento
  ↓
É o CTA/elemento nº 1 da tela? → acento de marca (--color-action-primary)
  ↓ não
Está comunicando um ESTADO (erro/sucesso/aviso/info)? → cor de feedback correspondente + ícone + texto
  ↓ não
É texto/superfície/borda? → token NEUTRO (--color-text-*, --color-surface-*, --color-border-*)
  ↓ não
Quero "dar cor" para decorar? → ❌ PARE. Decoração não usa cor de estado nem hue novo.
                                  Resolva hierarquia com peso/tamanho/espaço.
```

---

## Anti-Patterns (o "jeitão de IA")

```
❌ Cada card de uma lista com uma cor de fundo diferente
❌ Ícones em verde, âmbar e azul lado a lado sem significar estado
❌ Gradiente multicolor decorativo fora do design system
❌ Usar a cor de "info" (azul) como se fosse a cor da marca
❌ Badges coloridos em >30% dos itens (Von Restorff — dilui o destaque)
❌ Borda colorida "para separar" quando um espaço/linha neutra basta
❌ Mais de 1 acento de marca competindo por atenção na mesma view
```

---

## Checklist de Harmonia

```
[ ] A tela é dominada por NEUTROS (~90%)?
[ ] Existe 1 único acento de marca, no elemento mais importante?
[ ] Cores de feedback aparecem SÓ onde há estado real?
[ ] Nenhum hue de feedback usado como decoração?
[ ] Hierarquia feita com peso/tamanho/espaço antes de cor?
[ ] Nenhum hue fora da paleta de marca/tokens?
[ ] (data-viz) paleta categórica derivada da marca, não de feedback?
```

---

## Relação com outras instruções

- **De onde vêm as cores:** `design-tokens.instructions.md` (3 camadas — primitive/semantic/component).
- **Papéis semânticos detalhados:** `ux-principles.instructions.md` §8 e `frontend-master` Parte 8.
- **Cor por tema:** `theming.instructions.md` (contraste validado por tema).
- **Enforcement:** `dock-ds/no-unauthorized-colors` (só tokens) + `dock-ds/no-decorative-feedback-colors` (anti-arco-íris).
