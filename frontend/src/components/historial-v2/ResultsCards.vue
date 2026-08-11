<script setup lang="ts">
import { ESTADO_OPTIONS, CANAL_OPTIONS, type HistorialPagoRecord } from '@/constants/historialPagos'

defineProps<{ rows: HistorialPagoRecord[]; selectedIds: string[]; loading: boolean }>()

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]]
  openDetail: [record: HistorialPagoRecord]
}>()

function formatEstado(v: string) { return ESTADO_OPTIONS.find((o) => o.value === v)?.label ?? v }
function formatCanal(v: string)  { return CANAL_OPTIONS.find((o) => o.value === v)?.label ?? v }

function estadoClass(estado: string) {
  const map: Record<string, string> = {
    concluido: 'badge--success',
    cancelado: 'badge--danger',
    rechazado: 'badge--warning',
    'en-progreso': 'badge--info',
    registrando: 'badge--info',
    expirado: 'badge--neutral',
  }
  return map[estado] ?? 'badge--neutral'
}

function toggleRow(id: string, selectedIds: string[]) {
  const next = selectedIds.includes(id)
    ? selectedIds.filter((x) => x !== id)
    : [...selectedIds, id]
  emit('update:selectedIds', next)
}
</script>

<template>
  <!-- Skeleton -->
  <div v-if="loading" class="rc-grid" aria-busy="true">
    <div v-for="i in 6" :key="i" class="rc-card rc-card--skeleton">
      <div class="rc-skeleton rc-skeleton--title" />
      <div class="rc-skeleton rc-skeleton--line" />
      <div class="rc-skeleton rc-skeleton--line rc-skeleton--short" />
      <div class="rc-skeleton rc-skeleton--badge" />
    </div>
  </div>

  <!-- Empty -->
  <div v-else-if="rows.length === 0" class="rc-empty">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="var(--color-border)" stroke-width="1.5" />
      <path d="M21 21l-4.35-4.35" stroke="var(--color-border)" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <p class="rc-empty__text">No se encontraron resultados</p>
  </div>

  <!-- Cards grid -->
  <div v-else class="rc-grid">
    <article
      v-for="row in rows"
      :key="row.id"
      class="rc-card"
      :class="{ 'rc-card--selected': selectedIds.includes(row.id) }"
    >
      <!-- Checkbox + badge -->
      <div class="rc-card__top">
        <label class="rc-card__check-label">
          <input
            type="checkbox"
            class="rc-checkbox"
            :checked="selectedIds.includes(row.id)"
            :aria-label="`Seleccionar ${row.numeroAutorizacion || row.id}`"
            @change="toggleRow(row.id, selectedIds)"
          />
        </label>
        <span class="badge" :class="estadoClass(row.estado)">{{ formatEstado(row.estado) }}</span>
      </div>

      <!-- Título principal -->
      <p class="rc-card__id" :title="row.numeroAutorizacion">
        {{ row.numeroAutorizacion || '—' }}
      </p>
      <p class="rc-card__sub">{{ row.tienda }}</p>

      <!-- Campos -->
      <dl class="rc-card__dl">
        <div class="rc-card__row">
          <dt>Fecha</dt>
          <dd>{{ row.fechaCreacion }}</dd>
        </div>
        <div class="rc-card__row">
          <dt>Monto</dt>
          <dd class="rc-card__monto">{{ row.monto }}</dd>
        </div>
        <div class="rc-card__row">
          <dt>Canal</dt>
          <dd>{{ formatCanal(row.canal) }}</dd>
        </div>
        <div class="rc-card__row">
          <dt>Paso en flujo</dt>
          <dd>{{ row.pasoFlujo }}</dd>
        </div>
      </dl>

      <!-- Action -->
      <button
        class="rc-card__btn"
        type="button"
        @click="emit('openDetail', row)"
      >
        Ver detalles
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </article>
  </div>
</template>

<style scoped>
.rc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.rc-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.rc-card:hover {
  box-shadow: 0 2px 12px rgba(1, 157, 244, 0.12);
  border-color: var(--color-brand);
}

.rc-card--selected {
  border-color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand) 5%, var(--color-bg-card));
}

.rc-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rc-checkbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--color-brand);
}

.rc-card__id {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rc-card__sub {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.rc-card__dl {
  display: grid;
  gap: 0.25rem;
  margin-top: 0.25rem;
  flex: 1;
}

.rc-card__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  gap: 0.5rem;
}

.rc-card__row dt { color: var(--color-text-secondary); }
.rc-card__row dd { color: var(--color-text-primary); font-weight: 500; text-align: right; }

.rc-card__monto { font-weight: 700; color: var(--color-text-primary); }

.rc-card__btn {
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  height: 2.125rem;
  border: 1px solid var(--color-brand);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-brand);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.13s;
}

.rc-card__btn:hover { background: var(--color-brand-light); }
.rc-card__btn:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

/* Badges (same as table) */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.1875rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge--success { background: #d1fae5; color: #065f46; }
.badge--danger  { background: #fee2e2; color: #991b1b; }
.badge--warning { background: #fef3c7; color: #92400e; }
.badge--info    { background: var(--color-brand-light); color: var(--color-brand); }
.badge--neutral { background: var(--color-gray-100); color: var(--color-text-secondary); }

/* Skeleton */
.rc-card--skeleton {
  pointer-events: none;
}

.rc-skeleton {
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-50) 50%, var(--color-gray-100) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

.rc-skeleton--title  { height: 1rem; width: 70%; }
.rc-skeleton--line   { height: 0.75rem; width: 90%; }
.rc-skeleton--short  { width: 50%; }
.rc-skeleton--badge  { height: 1.25rem; width: 5rem; border-radius: 999px; }

@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* Empty */
.rc-empty {
  text-align: center;
  padding: 4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.rc-empty__text { color: var(--color-text-secondary); font-size: 0.9375rem; }
</style>
