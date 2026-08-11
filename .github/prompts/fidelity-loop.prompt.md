---
description: >
  Implementa uma tela a partir de uma IMAGEM/print de referência e fecha o
  loop de fidelidade: renderiza o resultado, captura screenshot, compara com
  a referência em 6 dimensões e itera até atingir fidelidade aceitável.
  Resolve o ponto fraco de "imagem → código" (sem loop de medição).
mode: agent
tools: [read, edit, search, execute]
argument-hint: "Caminho/anexo da imagem de referência + nome do componente/tela alvo"
---

# Loop de Fidelidade — Imagem → Código

> **Por que este prompt existe:** gerar UI a partir de um print sem medir o
> resultado produz algo "plausível mas não verificável". Este protocolo
> adiciona o que faltava: **capturar a implementação e comparar com a
> referência**, em ciclo, até a divergência ser aceitável.

**Constraint:** usar componentes `Ds*` e tokens do Design System (ver skill `dock-ds` e `design-tokens`/`color-harmony`). Nunca hardcode de cor/spacing.

---

## Pré-requisitos (verificar antes de começar)

- [ ] Tenho a imagem de referência (anexo ou caminho)?
- [ ] Consigo **renderizar** o resultado? (app rodando via `npm run dev`, Storybook, ou preview)
- [ ] Consigo **capturar screenshot**? (ferramenta de preview/browser, Playwright, ou screenshot manual do usuário)

Se não posso renderizar nem capturar, **declaro isso ao usuário** e ofereço:
"Implemento a partir da imagem, mas sem o loop de medição não consigo garantir fidelidade — você pode me enviar um print do resultado para eu comparar."

> Honestidade > falsa garantia: sem captura, não afirme "ficou fiel".

---

## Fase 1 — Leitura estruturada da referência

Antes de codar, extraia da imagem (e registre):

```
LAYOUT      → grid, colunas, alinhamento, ordem dos blocos
ESPAÇAMENTO → ritmo aparente (mapear para escala de 4px / tokens --space-*)
COR         → 1 acento + neutros (mapear para tokens; ver color-harmony)
TIPOGRAFIA  → hierarquia (display/h1/h2/body), pesos
COMPONENTES → quais Ds* correspondem (botão→DsButton, campo→DsInput…)
ESTADOS     → algum estado visível? (erro, loading, selecionado)
```

Se algo na imagem **não existe no DS** (ícone, ilustração, componente): **PARE e pergunte** — não invente.

---

## Fase 2 — Implementação

Implemente usando `Ds*` + tokens. Aplique as instruções já ativas (hierarquia, estados, a11y, harmonia de cor). Não conecte à navegação ainda.

---

## Fase 3 — Captura (o passo que fecha o loop)

1. Renderize o componente/tela (dev server, Storybook story, ou preview).
2. Capture screenshot **no mesmo viewport** da referência (largura aproximada).
3. Se não houver ferramenta de captura automática, peça o print ao usuário.

---

## Fase 4 — Diff estruturado (referência × implementação)

Compare lado a lado nas 6 dimensões e classifique cada divergência:

```markdown
## Diff de Fidelidade — {tela} (iteração N)

| Dimensão | Referência | Implementação | Status |
|----------|-----------|---------------|--------|
| Layout/ordem | ... | ... | ✅ / 🔴 / 🟡 |
| Espaçamento | ... | ... | ... |
| Cor (acento + neutros) | ... | ... | ... |
| Tipografia (tamanho/peso) | ... | ... | ... |
| Hierarquia (o que domina) | ... | ... | ... |
| Estados | ... | ... | ... |

🔴 BLOCKER: cor/componente errado, layout quebrado, hierarquia invertida
🟡 WARNING: espaçamento 2–4px off, peso ligeiramente diferente
```

---

## Fase 5 — Iterar

- Há **BLOCKER**? Corrija e **volte à Fase 3** (recapture e re-compare).
- Só **WARNINGs**? Liste e pergunte ao usuário se ajusta agora ou depois.
- **Zero divergências relevantes?** Declare fidelidade atingida — mostrando o diff como evidência, não só afirmando.

**Critério de parada:** sem BLOCKER + WARNINGs aceitos pelo usuário. Máximo sugerido: 3 iterações; se não convergir, reporte o que trava (provável gap no DS ou ambiguidade na referência).

---

## Regras do Protocolo

- **Nunca afirme fidelidade sem ter capturado e comparado.** Sem evidência, diga que não foi medido.
- **Não invente** o que não está na referência nem no DS — pergunte.
- **Sempre via tokens/`Ds*`** — fidelidade não justifica hardcode.
- **Mostre o diff** como prova em cada iteração.
- Complementa o agente `design-reviewer` (revisão visual) e difere do `figma-fidelity-audit` (que só checa prontidão de artefatos, não compara pixels).
