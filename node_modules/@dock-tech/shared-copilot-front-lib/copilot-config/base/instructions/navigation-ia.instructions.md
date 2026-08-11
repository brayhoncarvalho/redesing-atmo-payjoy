---
applyTo: "src/**/*.{vue,ts}"
description: >
  Arquitetura de Informação e padrões de navegação: modelos de navegação, estrutura de rotas/URL,
  breadcrumbs, estado ativo, scroll restoration, deep linking, back behavior, navegação mobile e wayfinding.
  Expande a regra de scroll-anchor vs SPA do copilot-instructions e integra com Vue Router.
---

# Arquitetura de Informação & Navegação

## Princípio

**O usuário deve sempre saber: onde estou, como cheguei aqui, e para onde posso ir.**
Esses são os três pilares do wayfinding (Nielsen — "visibilidade do estado do sistema" + "controle e liberdade"). Uma navegação que falha em qualquer um deles gera o sentimento de estar perdido — a causa #1 de abandono.

> Navegação não é um menu. É o mapa mental que o usuário constrói do seu produto. Estrutura clara > decoração.

---

## Modelos de Navegação — Escolher o Certo

| Modelo | Estrutura | Quando usar | Exemplo Dock |
|--------|-----------|-------------|--------------|
| **Flat** | Telas no mesmo nível | ≤5 destinos, sem hierarquia | Landing page com âncoras |
| **Hierárquico** | Pai → filhos → netos | Conteúdo com categorias/subcategorias | Console admin com módulos |
| **Hub-and-spoke** | Central → tarefas → volta ao hub | Tarefas isoladas que partem de um dashboard | Dashboard → "Nova proposta" → volta |
| **Stepper/Wizard** | Linear, sequencial | Fluxo com ordem obrigatória | Onboarding, proposta multi-etapa |

### Regra de profundidade
```
Profundidade máxima: 3 níveis de navegação.
Além de 3 níveis → o usuário se perde. Reorganize a IA, não adicione um 4º nível.
```

**BLOCKER:** Hierarquia de navegação com >3 níveis de profundidade sem justificativa de IA.

---

## Estrutura de Rotas / URL

A URL é parte da arquitetura de informação — ela DEVE ser legível, hierárquica e linkável.

```
✅ BOM — hierárquico, semântico, linkável
/propostas
/propostas/nova
/propostas/:id
/propostas/:id/editar
/clientes/:id/propostas

❌ RUIM
/page?id=42&view=2          (opaco, não semântico)
/proposta_nova_v2_final     (não hierárquico)
/#/screen3                  (hash routing sem necessidade)
```

### Regras de rota (Vue Router)
- Rotas nomeadas sempre (`name: 'proposta-detalhe'`) — navegação por nome, não por string de path.
- Parâmetros na URL refletem o estado navegável (deep linking funciona).
- Estado de UI efêmero (modal aberto, aba ativa) **pode** ir em query param se precisa ser linkável/restaurável.
- Lazy load de rotas (ver `performance.instructions.md`): `component: () => import(...)`.

```ts
// router — estrutura hierárquica espelha a IA
const routes = [
  {
    path: '/propostas',
    name: 'propostas',
    component: () => import('@/views/PropostasView.vue'),
    children: [
      { path: 'nova', name: 'proposta-nova', component: () => import('@/views/PropostaNovaView.vue') },
      { path: ':id', name: 'proposta-detalhe', component: () => import('@/views/PropostaDetalheView.vue'), props: true },
    ],
  },
]
```

---

## Scroll-Anchor vs SPA Routing (regra expandida)

> Esta seção expande a tabela já presente em `copilot-instructions.md`. **Sempre verificar a estrutura do Figma antes de decidir.**

```
Todas as seções empilhadas no MESMO frame   → SCROLL-ANCHOR (<a href="#id"> + IntersectionObserver)
Seções em frames SEPARADOS / telas distintas → SPA ROUTING (Vue Router)
Seções sobrepostas visível/oculto            → TAB PANELS (v-show no mesmo container)
```

**Decisão crítica:** Frame Figma com `height > 2000px` contendo tudo empilhado = quase sempre scroll-anchor. **NUNCA** transformar em tab-switching (esconde seções que deveriam estar visíveis no scroll).

---

## Breadcrumbs — Onde Estou

Obrigatório em navegação hierárquica com profundidade ≥2.

```vue
<nav aria-label="Trilha de navegação">
  <ol class="flex items-center gap-2 text-caption text-muted">
    <li v-for="(crumb, i) in trail" :key="crumb.to">
      <RouterLink
        v-if="i < trail.length - 1"
        :to="crumb.to"
        class="hover:text-action min-h-[44px] inline-flex items-center"
      >
        {{ crumb.label }}
      </RouterLink>
      <!-- Último item: página atual, não é link, marcado para a11y -->
      <span v-else aria-current="page" class="text-default font-medium">
        {{ crumb.label }}
      </span>
      <span v-if="i < trail.length - 1" aria-hidden="true" class="text-border">/</span>
    </li>
  </ol>
</nav>
```

### Regras de breadcrumb
- Fluxo esquerda→direita: raiz → ... → página atual (Jakob's Law).
- Página atual: `aria-current="page"`, **não** clicável.
- Gerado a partir da hierarquia de rotas (`route.matched`), não hardcoded.
- Separador é decorativo (`aria-hidden`).

---

## Estado Ativo — Wayfinding

O usuário precisa ver **onde está** em todo momento.

```vue
<!-- RouterLink já expõe classes de estado ativo -->
<RouterLink
  :to="{ name: 'propostas' }"
  class="nav-item min-h-[44px]"
  active-class="nav-item--active"          
  exact-active-class="nav-item--exact"     
>
  Propostas
</RouterLink>
```

```css
.nav-item--active {
  color: var(--color-action-primary);
  font-weight: var(--font-weight-semibold);
  /* indicador visual ALÉM da cor — daltônicos (ver ux-principles §8) */
  border-left: 3px solid var(--color-action-primary);
}
```

**BLOCKER:** Item de navegação ativo indicado apenas por cor (sem peso/borda/indicador) — viola "cor não é único comunicador".

---

## Comportamento de Back, Scroll e Deep Linking

### Scroll restoration
```ts
// router — restaura posição ao voltar (back/forward)
const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition          // back/forward → restaura
    if (to.hash) return { el: to.hash, behavior: 'smooth' }  // âncora
    return { top: 0 }                                // nova navegação → topo
  },
})
```

### Regras de navegação resiliente
- **Back do browser SEMPRE funciona** e faz o esperado (não quebrar com modal/estado).
- Modal/drawer aberto: fechar com back não deve sair da tela (gerenciar via history state ou query param).
- Deep link para qualquer estado navegável funciona ao colar a URL direto (sem depender de ter navegado a partir de outra tela).
- Refresh da página mantém o usuário no mesmo lugar lógico.

**BLOCKER:** Deep link que quebra ao ser acessado diretamente (depende de estado em memória de tela anterior).

---

## Navegação Mobile

| Padrão | Quando | Regra |
|--------|--------|-------|
| **Bottom nav** | 3–5 destinos primários | Thumb zone; ícone + label; estado ativo claro |
| **Hamburger** | Navegação secundária/extensa | Drawer com focus trap; fecha com ESC/back/overlay |
| **Tab bar** | Alternar views relacionadas | Swipe opcional; indicador de aba ativa |

```
Bottom nav: máximo 5 itens (Hick's Law). 6+ → agrupar em "Mais".
Alvos: mínimo 44×44px (Fitts). Posição inferior = thumb-friendly.
```

### Regras mobile
- Navegação primária em mobile preferencialmente em **bottom nav** (alcance do polegar) — não esconder tudo no hamburger.
- Hamburger drawer: focus trap, fecha com ESC, back e clique no overlay (ver `component-anatomy.instructions.md` — Modal).
- Indicador de aba/destino ativo sempre visível.

---

## Checklist de Navegação & IA

```
ESTRUTURA
  [ ] Modelo de navegação adequado ao conteúdo (flat/hierárquico/hub/wizard)?
  [ ] Profundidade ≤3 níveis?
  [ ] URLs semânticas, hierárquicas e linkáveis?
  [ ] Rotas nomeadas e lazy-loaded?

WAYFINDING
  [ ] Estado ativo visível (com indicador além da cor)?
  [ ] Breadcrumbs em hierarquia ≥2 níveis?
  [ ] aria-current="page" no item/página atual?
  [ ] Logo clicável volta à home (Jakob)?

RESILIÊNCIA
  [ ] Back do browser sempre funciona?
  [ ] Deep link funciona ao acessar URL direto?
  [ ] Scroll restaurado ao voltar?
  [ ] Refresh mantém contexto?

MOBILE
  [ ] Navegação primária acessível (bottom nav em vez de tudo no hamburger)?
  [ ] Drawer com focus trap + ESC/back/overlay?
  [ ] Alvos ≥44×44px?
```

## Anti-Patterns de Navegação

```
❌ Hierarquia com >3 níveis (usuário se perde)
❌ URL opaca (/page?id=2&v=3) em vez de semântica
❌ Estado ativo só por cor (daltônicos não percebem)
❌ Back do browser quebrando a tela ou pulando estados
❌ Deep link que falha ao acessar direto (depende de estado em memória)
❌ Esconder toda navegação primária no hamburger em mobile
❌ Drawer/menu sem focus trap ou sem fechar no ESC
❌ Transformar scroll-anchor (seções no mesmo frame) em tab-switching
❌ Logo não clicável ou que não volta à home
❌ Breadcrumb hardcoded em vez de derivado da hierarquia de rotas
❌ Scroll voltando ao topo ao usar back (perde o contexto do usuário)
```
