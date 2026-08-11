---
name: dock-ds-knowledge
description: "Conhecimento completo do Design System Dock (shared-design-system-vue-lib). Use quando precisar saber quais componentes existem no pacote, suas props, variantes, tokens disponíveis e padrões de uso. Útil para decidir entre criar local ou importar do DS, consultar tokens, ou entender padrões de composição."
argument-hint: "Componente ou token que quer consultar (ex: 'Button', 'cores', 'Input props')"
---

# Design System Dock — Conhecimento do Pacote

> **Pacote:** `shared-design-system-vue-lib`
> **Import style:** `shared-design-system-vue-lib/style.css` (global)
> **Componentes:** Named exports do pacote

---

## Componentes Disponíveis

<!-- AUTO-GENERATED:components — não editar à mão; rode generate-ds-knowledge.mjs -->
> Gerado de `index.ts` em 2026-06-30. **56 componentes** importáveis.
> Para atualizar: `node scripts/generate-ds-knowledge.mjs --index <DS>/index.ts`.

### Formulário (18)
`DsCheckbox` · `DsCurrencyInput` · `DsDatePicker` · `DsDateRange` · `DsFileUpload` · `DsForm` · `DsFormField` · `DsFormSubmit` · `DsInput` · `DsOTPInput` · `DsRadioGroup` · `DsSearchInput` · `DsSecretField` · `DsSelect` · `DsSlider` · `DsSwitch` · `DsTextarea` · `DsTimeline`

### Ação (6)
`DsButton` · `DsCommandPalette` · `DsDropdown` · `DsIconButton` · `DsLink` · `DsMenuItem`

### Layout / Estrutura (5)
`DsBottomSheet` · `DsCard` · `DsDataGrid` · `DsDivider` · `DsStatCard`

### Navegação (6)
`DsAccordion` · `DsAccordionItem` · `DsBreadcrumb` · `DsPagination` · `DsStepper` · `DsTabs`

### Feedback / Estado (11)
`DsAlert` · `DsConfirmModal` · `DsEmptyState` · `DsModal` · `DsProgress` · `DsSkeleton` · `DsSpinner` · `DsTermTooltip` · `DsToast` · `DsToastProvider` · `DsTooltip`

### Exibição / Dados (8)
`DsAvatar` · `DsAvatarGroup` · `DsBadge` · `DsChart` · `DsChip` · `DsKbd` · `DsRoleBadge` · `DsTable`

### Fintech / RBAC (2)
`DsGate` · `DsPaywall`

### Composables (11)
`clearAuditSinks` · `detectLocale` · `registerAuditSink` · `useAuditLog` · `useAuthorization` · `useConfirm` · `useFormValidation` · `useI18n` · `useModal` · `useTheme` · `useToast`

> **Antes de criar qualquer componente, confirme nesta lista se ele já existe.** Importar do pacote > criar local > HTML cru.
<!-- AUTO-GENERATED:END -->

---

## Tokens Exportados

### Cores
Usar via Tailwind (tokens no `tailwind.config.js` extendendo o DS):
- `primary` — Cor principal da marca
- `secondary` — Cor secundária
- `success`, `warning`, `error`, `info` — Status
- `text-primary`, `text-secondary`, `text-muted` — Texto
- `surface`, `background`, `border` — Estruturais

### Tipografia
- Font families: `font-sans` (Roboto), `font-display` (Red Hat Display)
- Scale: `text-xs` → `text-4xl` (conforme Tailwind defaults + custom)

### Espaçamento
- Scale Tailwind padrão: `0.5` (2px) → `96` (384px)
- Custom tokens se definidos no pacote

### Shadows e Borders
- `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`
- `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-full`

---

## Padrões de Uso

### Import
```vue
<script setup lang="ts">
import { DsButton, DsInput } from 'shared-design-system-vue-lib'
</script>
```

### Variantes de Button
```vue
<DsButton variant="primary">Ação Principal</DsButton>
<DsButton variant="secondary">Secundário</DsButton>
<DsButton variant="ghost">Terciário</DsButton>
<DsButton variant="primary" size="sm">Pequeno</DsButton>
<DsButton variant="primary" :loading="true">Enviando...</DsButton>
```

### Formulário com Validação
```vue
<DsInput
  v-model="email"
  label="E-mail"
  type="email"
  :error="errors.email"
  placeholder="seu@email.com"
/>
```

---

## Anti-Patterns (NÃO fazer)

❌ **Recriar Button manualmente:**
```vue
<!-- ERRADO -->
<button class="bg-primary text-white px-4 py-2 rounded">Enviar</button>
```

✅ **Usar do pacote:**
```vue
<!-- CORRETO -->
<DsButton variant="primary">Enviar</DsButton>
```

❌ **Usar cor hex direto quando token existe:**
```vue
<!-- ERRADO -->
<p class="text-[#00d8d8]">Texto</p>
```

✅ **Usar token Tailwind:**
```vue
<!-- CORRETO -->
<p class="text-primary">Texto</p>
```

❌ **Criar input custom quando DsInput serve:**
```vue
<!-- ERRADO -->
<div class="input-wrapper">
  <label>Nome</label>
  <input class="border rounded px-3 py-2" />
</div>
```

✅ **Usar componente do DS:**
```vue
<!-- CORRETO -->
<DsInput v-model="nome" label="Nome" />
```

---

## Quando Criar Componente Local

Criar local (`src/components/shared/`) apenas se:
1. O componente NÃO existe no pacote (verificou)
2. O usuário CONFIRMOU que deve criar local (perguntou)
3. O componente respeita tokens do DS (cores, fontes, espaçamentos)
4. A API é consistente com os padrões do pacote (props tipadas, slots, emits)

Sempre preferir: **import do pacote > criar local > HTML raw**.
