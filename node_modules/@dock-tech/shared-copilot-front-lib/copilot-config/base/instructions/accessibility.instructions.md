---
applyTo: "src/**/*.vue"
description: "Baseline obrigatória de acessibilidade WCAG 2.2 AA e usabilidade (Nielsen) para todos os componentes Vue."
---

# Acessibilidade e Usabilidade — Baseline Obrigatória

## WCAG 2.2 AA — Obrigatório em toda criação/edição visual

### Conteúdo não-textual (1.1.1)
- Toda imagem informativa DEVE ter atributo `alt` descritivo.
- Imagens decorativas DEVEM ter `alt=""` e/ou `aria-hidden="true"`.
- Ícones sem texto adjacente DEVEM ter `aria-label` ou `title`.

### Contraste
- Texto normal: ratio ≥ 4.5:1 contra o fundo.
- Texto grande (≥18px bold ou ≥24px regular): ratio ≥ 3:1.
- Componentes UI e gráficos: ratio ≥ 3:1 contra adjacente.

### Foco e Navegação
- Todo elemento interativo DEVE ter foco visível (outline ou equivalente).
- Ordem de tab DEVE ser lógica (esquerda→direita, topo→base).
- Nunca usar `tabindex` > 0.
- Skip links quando há navegação complexa.
- Navegação por teclado: todos os controles acessíveis via Tab, Enter, Escape, Setas.

### Semântica e Labels
- Inputs DEVEM ter `<label>` associado ou `aria-label`.
- Botões DEVEM ter texto acessível (conteúdo textual ou `aria-label`).
- Usar elementos semânticos: `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`.
- Headings em ordem lógica (h1→h2→h3, sem pular níveis).

### Feedback e Erros
- Mensagens de erro: associadas ao campo via `aria-describedby`.
- Status changes: usar `aria-live` para anúncios dinâmicos.
- Não depender APENAS de cor para indicar estado (adicionar ícone, texto ou padrão).

### Redimensionamento de Texto (1.4.4)
- Texto DEVE ser redimensionável até 200% sem perda de conteúdo ou funcionalidade.
- Nunca usar unidades fixas (`px`) para `font-size` em texto de conteúdo — usar `rem` ou `em`.
- Layout não pode quebrar ao zoom de 200% no browser.

### Alvos Interativos (2.5.8)
- Tamanho mínimo de toque/click: 44×44px (ideal) ou 24×24px (mínimo AA).
- Espaçamento adequado entre alvos adjacentes.

---

## Heurísticas de Nielsen — Obrigatório em toda criação/edição visual

1. **Visibilidade do estado** — Loading states, selected states, error states sempre visíveis.
2. **Linguagem do usuário** — Rótulos em linguagem natural, não técnica.
3. **Controle e liberdade** — Botão voltar, cancelar, desfazer quando aplicável.
4. **Consistência** — Mesmo componente = mesmo comportamento visual em toda a app.
5. **Prevenção de erros** — Validação em tempo real, máscaras, confirmação destrutiva.
6. **Reconhecimento** — Ações e opções visíveis, não escondidas em menus.
7. **Flexibilidade** — Atalhos para usuários experientes quando viável.
8. **Estética minimalista** — Informação relevante sem ruído. Não simplificar demais.
9. **Recuperação de erros** — Mensagem clara do que deu errado + como corrigir.
10. **Ajuda** — Instruções inline quando o campo ou fluxo não é auto-explicativo.

---

## Regra Operacional

- Se violação evidente for detectada durante implementação: **corrigir antes de entregar**.
- Se a correção impactar layout/design: **propor e perguntar antes de aplicar**.
- Rodar `npm run test:a11y` após toda criação/edição de componente.
