---
applyTo: "src/**/*.{vue,css,ts}"
description: "Padrões de responsividade: breakpoints, layout adaptativo, fluid typography, imagens responsivas e critérios de validação por viewport."
---

# Responsividade — Padrões Obrigatórios

## Princípio
**Mobile-first, progressivamente adaptável.** Todo layout começa no menor viewport e escala para cima. Componentes devem se comportar bem em qualquer largura, sem quebra visual.

---

## 1. Breakpoints — Sistema Unificado

| Token | Largura | Uso principal | Tailwind prefix |
|-------|---------|---------------|-----------------|
| `xs` | < 375px | Dispositivos muito pequenos (legacy) | (default, sem prefix) |
| `sm` | ≥ 375px | Mobile padrão (iPhone SE+) | `sm:` |
| `md` | ≥ 768px | Tablet portrait | `md:` |
| `lg` | ≥ 1024px | Tablet landscape / Desktop pequeno | `lg:` |
| `xl` | ≥ 1280px | Desktop padrão | `xl:` |
| `2xl` | ≥ 1536px | Desktop wide | `2xl:` |

### Configuração Tailwind
```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '375px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
}
```

### Regras
- Escrever CSS/classes **mobile-first**: o padrão (sem prefix) é para mobile.
- Adicionar prefixos `md:`, `lg:`, `xl:` para adaptar em viewports maiores.
- **NUNCA** usar media queries com `max-width` — usar apenas `min-width` (mobile-first).

---

## 2. Container e Layout

### Landing Page (projeto atual)
```vue
<!-- Container mobile-first com expansão -->
<div class="w-full max-w-[414px] mx-auto md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1200px]">
  <!-- conteúdo -->
</div>
```

### Console App (admin/painel)
```vue
<!-- Layout com sidebar + main content -->
<div class="flex min-h-screen">
  <aside class="hidden md:flex md:w-64 lg:w-72 shrink-0">...</aside>
  <main class="flex-1 min-w-0 p-4 md:p-6 lg:p-8">...</main>
</div>
```

### Regras de container
- Backgrounds de seção: **sempre full-width** (`w-full`), sem margin lateral.
- Conteúdo dentro da seção: usar container com `max-w-*` e `mx-auto`.
- Em mobile: padding lateral `px-4` (16px) ou `px-6` (24px).
- Em desktop: padding pode ser maior (`px-8`, `px-12`) ou usar container centralizado.

---

## 3. Grid System Responsivo

### Padrão para cards/itens
```vue
<!-- 1 coluna mobile → 2 tablet → 3 desktop -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  <div v-for="item in items" :key="item.id">...</div>
</div>
```

### Padrão para formulários
```vue
<!-- Full-width mobile → 2 colunas tablet+ -->
<form class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
  <!-- Campos que ocupam linha inteira -->
  <div class="md:col-span-2">
    <label>Nome completo</label>
    <input ... />
  </div>
  <!-- Campos lado a lado em desktop -->
  <div>
    <label>CPF</label>
    <input ... />
  </div>
  <div>
    <label>Data de nascimento</label>
    <input ... />
  </div>
</form>
```

---

## 4. Tipografia Responsiva (Fluid Typography)

### Regras
- Títulos principais: tamanho menor em mobile, maior em desktop.
- Corpo de texto: manter legível (mínimo 14px mobile, 16px desktop).
- Nunca usar tamanho fixo que fique ilegível em telas pequenas.

### Implementação com clamp()
```css
/* Heading principal */
.heading-hero {
  font-size: clamp(1.5rem, 4vw + 1rem, 2.5rem); /* 24px → 40px */
}

/* Heading de seção */
.heading-section {
  font-size: clamp(1.25rem, 2vw + 0.75rem, 2rem); /* 20px → 32px */
}

/* Corpo */
.body-text {
  font-size: clamp(0.875rem, 1vw + 0.5rem, 1rem); /* 14px → 16px */
}
```

### Com Tailwind (alternativa)
```vue
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">Título</h1>
<p class="text-sm md:text-base">Corpo do texto</p>
```

---

## 5. Imagens Responsivas

### Regras
- Usar `<img>` com `srcset` e `sizes` para servir tamanho adequado.
- Imagens DEVEM ter `width` e `height` explícitos (previne CLS).
- Usar formatos modernos: WebP com fallback JPG/PNG.
- Lazy loading para imagens abaixo do fold.

### Implementação
```vue
<picture>
  <source
    srcset="/images/hero-mobile.webp 375w, /images/hero-tablet.webp 768w, /images/hero-desktop.webp 1200w"
    sizes="(max-width: 414px) 375px, (max-width: 768px) 768px, 1200px"
    type="image/webp"
  />
  <img
    src="/images/hero-desktop.jpg"
    alt="Descrição da imagem"
    width="1200"
    height="600"
    loading="lazy"
    class="w-full h-auto object-cover"
  />
</picture>
```

### Para ícones/SVG
- SVGs são responsivos por natureza — usar `viewBox` e controlar tamanho via CSS.
- Ícones: tamanho mínimo 24x24px (acessibilidade touch target).

---

## 6. Componentes que Adaptam Comportamento

### Stack / Collapse
```vue
<!-- Horizontal em desktop, vertical em mobile -->
<div class="flex flex-col gap-2 md:flex-row md:gap-4 md:items-center">
  <button>Ação 1</button>
  <button>Ação 2</button>
</div>
```

### Tabelas em mobile
```vue
<!-- Tabela → cards em mobile -->
<table class="hidden md:table w-full">...</table>
<div class="md:hidden space-y-3">
  <div v-for="row in data" :key="row.id" class="bg-white p-4 rounded shadow-sm">
    <p class="font-medium">{{ row.name }}</p>
    <p class="text-sm text-[#5c5c5c]">{{ row.value }}</p>
  </div>
</div>
```

### Navegação
- Mobile: bottom nav ou hamburger menu.
- Desktop: sidebar ou top nav horizontal.
- Usar `md:hidden` / `hidden md:flex` para alternar.

---

## 7. Touch Targets

### Regras (WCAG 2.2 AA)
- Alvo mínimo interativo: **24×24px** (AA mínimo).
- Alvo recomendado: **44×44px** (conforto).
- Espaçamento entre alvos: mínimo 8px.
- Em mobile, botões e links devem ter padding suficiente para toque.

```vue
<!-- Botão com target adequado -->
<button class="min-h-[44px] min-w-[44px] px-4 py-3">
  Ação
</button>

<!-- Link com área clicável adequada -->
<a href="/page" class="inline-flex items-center min-h-[44px] px-2">
  Link
</a>
```

---

## 8. Testes de Responsividade

### Checklist por viewport
Testar cada tela em pelo menos 3 breakpoints:

| Viewport | Largura | O que verificar |
|----------|---------|-----------------|
| Mobile | 375px | Layout single-column, text legível, touch targets, scroll vertical |
| Tablet | 768px | Grid adapta, imagens redimensionam, formulários reorganizam |
| Desktop | 1280px | Uso adequado do espaço, sem linhas muito longas (max ~80ch para texto) |

### Com Playwright
```ts
const viewports = [
  { width: 375, height: 812, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 800, name: 'desktop' },
]

for (const vp of viewports) {
  test(`layout correto em ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto('/')
    // assertions de layout
  })
}
```

---

## 9. Performance Responsiva

- Em mobile: priorizar First Contentful Paint (lazy load o que não é visível).
- Imagens hero: usar `fetchpriority="high"` apenas na imagem above-the-fold.
- Fontes: `font-display: swap` para evitar FOIT (Flash of Invisible Text).
- Scripts: defer/async para JS não-crítico.

---

## Anti-Patterns (NUNCA fazer)

❌ Layout fixo em pixels que não adapta (`width: 414px` hardcoded em tudo)
❌ `max-width` media queries (anti mobile-first)
❌ Texto ilegível em mobile (< 12px)
❌ Touch targets menores que 24×24px
❌ Imagens sem dimensões explícitas (causa CLS)
❌ Esconder conteúdo importante em mobile sem alternativa
❌ Scroll horizontal não intencional (overflow-x)
❌ Tabela HTML sem adaptação mobile (scroll lateral)
❌ Testar apenas em 1 viewport
