---
applyTo: "src/**/*.vue"
---

# Landing Page — Regras Específicas

## Layout Mobile-First
- Container raiz: `w-full max-w-[414px] mx-auto`.
- Design otimizado para 375-414px.
- Seções com background colorido: width 100%, sem margens laterais.
- Padding interno para conteúdo: `px-6` ou `px-8`.

## Seções
- Cada seção é um componente Vue independente (`src/components/XxxSection.vue`).
- Ordem visual fixa conforme Figma/Storybook.
- Hero sempre no topo com header integrado.
- Footer sempre no final com fundo preto.

## Interatividade
- Simuladores/calculadoras: state reativo com cálculos em tempo real.
- Sliders: thumb branco 24x24 quadrado, track #b9b9b9 10px, botão - esquerda / + direita.
- CTAs: scroll suave para seção relevante ou navegação para próxima tela.
- Cards selecionáveis: estado visual claro (selecionado vs normal).

## Backgrounds
- Seções com fundo colorido (#1cc0c0, #e6e6e6, #000000) vão até as bordas do container.
- NUNCA `mx-*` em wrappers de seção.
- CSS global: `html, body { margin: 0; padding: 0; width: 100%; overflow-x: hidden; }`.

## Fontes
- Roboto: títulos, corpo, labels.
- Red Hat Display: botões CTA e textos do footer.
- Pesos: 300, 400, 500, 600, 700 — usar exatamente o que o design indica.

## Imagens e Ícones
- Todas em `public/`.
- Nunca URLs externas inventadas.
- Perguntar ao usuário antes de criar ícones SVG.
