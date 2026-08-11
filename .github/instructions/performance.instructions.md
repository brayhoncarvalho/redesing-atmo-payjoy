---
applyTo: "src/**/*.{ts,vue}"
description: "Padrões de performance frontend: lazy loading, bundle budget, otimização de imagens, Core Web Vitals e tree-shaking."
---

# Performance — Padrões Obrigatórios

## Princípio
**Performance é feature, não otimização prematura.** Budgets definidos, mensurados e respeitados desde o início.

---

## 1. Bundle Budget

### Limites por tipo de projeto

| Projeto | JS (gzip) | CSS (gzip) | Total (gzip) | LCP Target |
|---------|-----------|-----------|--------------|------------|
| Landing Page | ≤ 80 KB | ≤ 20 KB | ≤ 100 KB | ≤ 2.5s |
| Console App | ≤ 200 KB | ≤ 40 KB | ≤ 250 KB | ≤ 2.5s |

### Validação (vite.config.ts)
```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Alertar se chunk exceder limite
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Separar vendor em chunk próprio
            return 'vendor'
          }
        },
      },
    },
    // Reportar tamanho dos chunks
    chunkSizeWarningLimit: 100, // KB
  },
})
```

### Script de verificação
```json
{
  "scripts": {
    "build:analyze": "vite build --mode production && npx vite-bundle-visualizer"
  }
}
```

---

## 2. Lazy Loading

### Rotas (code splitting obrigatório)
```ts
// src/router/index.ts
const routes = [
  {
    path: '/',
    component: () => import('@/views/HomePage.vue'), // lazy
  },
  {
    path: '/proposta',
    component: () => import('@/views/PropostaPage.vue'), // lazy
  },
]
```

### Componentes pesados
```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// Componente pesado carregado sob demanda
const SimuladorSection = defineAsyncComponent(() =>
  import('@/components/SimuladorSection.vue')
)
</script>
```

### Imagens
```vue
<!-- Lazy load para imagens abaixo do fold -->
<img src="/image.webp" loading="lazy" alt="..." width="400" height="300" />

<!-- Imagem above-the-fold: NÃO usar lazy, usar priority -->
<img src="/hero.webp" fetchpriority="high" alt="..." width="414" height="500" />
```

### Regras
- Rotas SEMPRE lazy loaded (exceto home/shell).
- Componentes > 50KB: considerar lazy load.
- Imagens below the fold: `loading="lazy"`.
- Imagem hero (above fold): `fetchpriority="high"`, sem lazy.

---

## 3. Tree-Shaking

### Regras de import
```ts
// ❌ ERRADO — importa o pacote inteiro
import * as DockDS from 'shared-design-system-vue-lib'

// ❌ ERRADO — barrel import pode impedir tree-shaking
import { DsButton, DsInput } from 'shared-design-system-vue-lib'
// (ok SE o pacote tiver sideEffects: false no package.json)

// ✅ CORRETO — import direto do componente (se disponível)
import DsButton from 'shared-design-system-vue-lib/components/DsButton'
```

### Verificação
- Pacotes com `sideEffects: false` no package.json são tree-shakeable.
- Se o pacote DS não suporta, usar barrel import mas verificar bundle size.
- Lodash: usar `lodash-es` ou imports individuais (`import debounce from 'lodash/debounce'`).

---

## 4. Core Web Vitals — Targets

| Métrica | Target (bom) | Medição |
|---------|-------------|---------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | Lighthouse / PageSpeed |
| **INP** (Interaction to Next Paint) | ≤ 200ms | Chrome UX Report |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | Lighthouse / Layout Instability API |

### Como garantir

#### LCP ≤ 2.5s
- Precarregar fontes críticas: `<link rel="preload" href="/fonts/Roboto.woff2" as="font" crossorigin>`
- Precarregar imagem hero: `<link rel="preload" href="/hero.webp" as="image">`
- CSS crítico inline no `<head>` (Vite faz automaticamente para CSS do entry).
- Não bloquear render com JS síncrono no `<head>`.

#### INP ≤ 200ms
- Não fazer computação pesada no main thread.
- Usar `requestAnimationFrame` para atualizações visuais.
- Debounce em inputs que disparam recomputação pesada.
- `v-memo` para listas grandes que não mudam frequentemente.

#### CLS ≤ 0.1
- Imagens com `width` e `height` explícitos (aspect-ratio reservado).
- Fontes com `font-display: swap` + `size-adjust` para minimizar shift.
- Não injetar conteúdo acima do viewport após load (banners, toasts no topo).
- Skeleton com dimensões idênticas ao conteúdo final.

---

## 5. Fontes — Otimização

### Regras
- Hospedar fontes localmente (`public/fonts/`) — não depender de Google Fonts CDN em produção.
- Carregar apenas pesos utilizados (300, 400, 500, 600, 700 — não carregar 100, 200, 800, 900).
- Usar `woff2` (melhor compressão).
- `font-display: swap` obrigatório.
- Preload da fonte principal (Roboto Regular 400).

### Implementação
```css
/* src/style.css */
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/Roboto-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

```html
<!-- index.html -->
<link rel="preload" href="/fonts/Roboto-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

---

## 6. Otimização de Imagens

### Formato preferencial
| Caso | Formato | Razão |
|------|---------|-------|
| Fotos, banners | WebP (fallback JPG) | 25-35% menor que JPG |
| Ícones, logos | SVG inline ou sprite | Escalável, pequeno |
| Ilustrações com transparência | WebP (fallback PNG) | Menor que PNG |
| Animações simples | CSS animation > GIF | GIF é pesado |

### Regras
- Imagens em `public/` devem ser otimizadas (squoosh, sharp, imagemin).
- Nunca commitar imagens > 200KB sem otimização.
- Usar `<picture>` com `<source>` para formatos modernos + fallback.
- SVG inline para ícones repetidos (evita requests HTTP).

---

## 7. Prevenção de Memory Leaks

### Regras em componentes Vue
- `setInterval` / `setTimeout` → limpar no `onUnmounted`.
- `addEventListener` → `removeEventListener` no `onUnmounted`.
- `AbortController` para cancelar fetch quando componente desmonta.
- Observadores (`IntersectionObserver`, `ResizeObserver`) → `.disconnect()` no `onUnmounted`.

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

let intervalId: ReturnType<typeof setInterval>

onMounted(() => {
  intervalId = setInterval(() => { /* ... */ }, 5000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>
```

---

## 8. Scripts de Performance

```json
{
  "scripts": {
    "build:analyze": "vite build && npx vite-bundle-visualizer",
    "perf:lighthouse": "npx lighthouse http://localhost:4173 --output=json --output-path=./lighthouse.json",
    "perf:size": "npx size-limit"
  }
}
```

### size-limit config (package.json)
```json
{
  "size-limit": [
    { "path": "dist/assets/*.js", "limit": "80 KB", "gzip": true },
    { "path": "dist/assets/*.css", "limit": "20 KB", "gzip": true }
  ]
}
```

---

## Anti-Patterns (NUNCA fazer)

❌ Importar pacote inteiro quando só precisa de 1 função
❌ Imagens sem width/height (causa CLS)
❌ Fontes de CDN externo em produção
❌ JS síncrono bloqueando render no `<head>`
❌ `setInterval` sem cleanup no unmount
❌ Bundle > 100KB (gzip) para landing page
❌ Imagens > 200KB não otimizadas
❌ Lazy load na imagem hero (above fold)
❌ Computação pesada no main thread sem debounce
❌ GIF animado quando CSS animation resolve
