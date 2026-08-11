<script setup lang="ts">
import { ref, computed } from 'vue'
import { ESTADO_OPTIONS, CANAL_OPTIONS, type HistorialPagoRecord } from '@/constants/historialPagos'

const props = defineProps<{
  rows: HistorialPagoRecord[]
  selectedIds: string[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]]
  openDetail: [record: HistorialPagoRecord]
  openIntegration: [record: HistorialPagoRecord]
}>()

// ── Column visibility ──────────────────────────────────────────
interface ColDef { key: string; label: string; visible: boolean }
const columns = ref<ColDef[]>([
  { key: 'numeroAutorizacion', label: 'N° Autorización', visible: true },
  { key: 'idTransaccion', label: 'ID Transacción', visible: true },
  { key: 'fechaCreacion', label: 'Fecha / Hora', visible: true },
  { key: 'monto', label: 'Monto', visible: true },
  { key: 'estado', label: 'Estado', visible: true },
  { key: 'pasoFlujo', label: 'Paso en flujo', visible: true },
  { key: 'canal', label: 'Canal', visible: false },
  { key: 'tienda', label: 'Tienda', visible: false },
  { key: 'usuario', label: 'Usuario', visible: false },
])
const showColMenu = ref(false)
const visibleColumns = computed(() => columns.value.filter((c) => c.visible))

// ── Selection ─────────────────────────────────────────────────
const allSelected = computed(
  () => props.rows.length > 0 && props.rows.every((r) => props.selectedIds.includes(r.id)),
)

function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  emit('update:selectedIds', checked ? props.rows.map((r) => r.id) : [])
}

function toggleRow(id: string) {
  const next = props.selectedIds.includes(id)
    ? props.selectedIds.filter((x) => x !== id)
    : [...props.selectedIds, id]
  emit('update:selectedIds', next)
}

// ── Helpers ───────────────────────────────────────────────────
function formatEstado(value: string) {
  return ESTADO_OPTIONS.find((o) => o.value === value)?.label ?? value
}

function formatCanal(value: string) {
  return CANAL_OPTIONS.find((o) => o.value === value)?.label ?? value
}

function cellValue(row: HistorialPagoRecord, key: string): string {
  if (key === 'estado') return formatEstado(row.estado)
  if (key === 'canal') return formatCanal(row.canal)
  return String(((row as unknown) as Record<string, unknown>)[key] ?? '—')
}

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
</script>

<template>
  <!-- Toolbar -->
  <div class="rt-toolbar">
    <span class="rt-count">
      <template v-if="loading">
        <span class="rt-skeleton rt-skeleton--inline" />
      </template>
      <template v-else>{{ rows.length }} resultado{{ rows.length !== 1 ? 's' : '' }}</template>
    </span>

    <!-- Column visibility toggle -->
    <div class="rt-col-menu-wrap">
      <button
        class="rt-icon-btn"
        type="button"
        aria-label="Configurar columnas visibles"
        :aria-expanded="showColMenu"
        @click="showColMenu = !showColMenu"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        Columnas
      </button>
      <div v-if="showColMenu" class="rt-col-menu" role="menu" aria-label="Columnas visibles">
        <label
          v-for="col in columns"
          :key="col.key"
          class="rt-col-option"
          :class="{ 'rt-col-option--checked': col.visible }"
        >
          <input v-model="col.visible" type="checkbox" class="sr-only" />
          <span class="rt-col-check" aria-hidden="true">
            <svg v-if="col.visible" width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          {{ col.label }}
        </label>
      </div>
      <div v-if="showColMenu" class="rt-col-backdrop" @click="showColMenu = false" />
    </div>
  </div>

  <!-- Table -->
  <div class="rt-wrap" role="region" aria-label="Resultados de búsqueda">
    <table class="rt-table" aria-live="polite">
      <thead>
        <tr>
          <th class="rt-th rt-th--check" scope="col">
            <input
              type="checkbox"
              class="rt-checkbox"
              :checked="allSelected"
              :disabled="rows.length === 0"
              aria-label="Seleccionar todos"
              @change="toggleAll"
            />
          </th>
          <th v-for="col in visibleColumns" :key="col.key" class="rt-th" scope="col">
            {{ col.label }}
          </th>
          <th class="rt-th rt-th--actions" scope="col">Acciones</th>
        </tr>
      </thead>

      <!-- Loading skeleton -->
      <tbody v-if="loading" aria-busy="true">
        <tr v-for="i in 5" :key="i" class="rt-row">
          <td class="rt-td rt-td--check"><span class="rt-skeleton rt-skeleton--check" /></td>
          <td v-for="col in visibleColumns" :key="col.key" class="rt-td">
            <span class="rt-skeleton rt-skeleton--cell" />
          </td>
          <td class="rt-td rt-td--actions"><span class="rt-skeleton rt-skeleton--check" /></td>
        </tr>
      </tbody>

      <!-- Empty -->
      <tbody v-else-if="rows.length === 0">
        <tr>
          <td :colspan="visibleColumns.length + 2" class="rt-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="rt-empty__icon">
              <circle cx="11" cy="11" r="8" stroke="var(--color-border)" stroke-width="1.5" />
              <path d="M21 21l-4.35-4.35" stroke="var(--color-border)" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <p class="rt-empty__text">No se encontraron resultados</p>
          </td>
        </tr>
      </tbody>

      <!-- Data rows -->
      <tbody v-else>
        <tr
          v-for="row in rows"
          :key="row.id"
          class="rt-row"
          :class="{ 'rt-row--selected': selectedIds.includes(row.id) }"
        >
          <td class="rt-td rt-td--check">
            <input
              type="checkbox"
              class="rt-checkbox"
              :checked="selectedIds.includes(row.id)"
              :aria-label="`Seleccionar fila ${row.numeroAutorizacion || row.id}`"
              @change="toggleRow(row.id)"
            />
          </td>

          <td
            v-for="col in visibleColumns"
            :key="col.key"
            class="rt-td"
          >
            <span
              v-if="col.key === 'estado'"
              class="badge"
              :class="estadoClass(row.estado)"
            >{{ formatEstado(row.estado) }}</span>
            <span v-else>{{ cellValue(row, col.key) }}</span>
          </td>

          <!-- Inline actions (hover reveal) -->
          <td class="rt-td rt-td--actions">
            <div class="rt-actions" role="group" :aria-label="`Acciones para ${row.numeroAutorizacion || row.id}`">
              <button
                class="rt-action-btn"
                type="button"
                title="Ver detalles"
                aria-label="Ver detalles del pago"
                @click="emit('openDetail', row)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.8" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
                </svg>
              </button>
              <button
                class="rt-action-btn"
                type="button"
                title="Integraciones"
                aria-label="Ver integraciones"
                @click="emit('openIntegration', row)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.rt-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid var(--color-border);
}

.rt-count {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.rt-col-menu-wrap {
  position: relative;
}

.rt-icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 2rem;
  padding: 0 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.13s;
}

.rt-icon-btn:hover { background: var(--color-gray-50); }
.rt-icon-btn:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

.rt-col-menu {
  position: absolute;
  top: calc(100% + 0.375rem);
  right: 0;
  z-index: 200;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  min-width: 12rem;
  padding: 0.375rem 0;
}

.rt-col-backdrop {
  position: fixed;
  inset: 0;
  z-index: 199;
}

.rt-col-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  cursor: pointer;
}

.rt-col-option:hover { background: var(--color-gray-50); }

.rt-col-check {
  width: 1rem;
  height: 1rem;
  border: 1.5px solid var(--color-border);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-brand);
}

.rt-col-option--checked .rt-col-check {
  background: var(--color-brand);
  border-color: var(--color-brand);
  color: #fff;
}

.rt-wrap {
  overflow-x: auto;
}

.rt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.rt-th {
  padding: 0.625rem 0.875rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  background: var(--color-gray-50);
  border-bottom: 2px solid var(--color-border);
}

.rt-th--check,
.rt-td--check {
  width: 2.5rem;
  padding-left: 1rem;
}

.rt-th--actions,
.rt-td--actions {
  width: 5.5rem;
  text-align: center;
}

.rt-checkbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--color-brand);
}

.rt-row {
  border-bottom: 1px solid var(--color-border);
  transition: background 0.1s;
}

.rt-row:hover { background: var(--color-brand-light); }
.rt-row--selected { background: color-mix(in srgb, var(--color-brand) 8%, transparent); }

.rt-td {
  padding: 0.75rem 0.875rem;
  color: var(--color-text-primary);
  white-space: nowrap;
  vertical-align: middle;
}

.rt-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.rt-action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-brand);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.13s;
}

.rt-action-btn:hover { background: var(--color-brand-light); }
.rt-action-btn:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

/* Badges */
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
.rt-skeleton {
  display: block;
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-50) 50%, var(--color-gray-100) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

.rt-skeleton--inline { height: 0.875rem; width: 6rem; }
.rt-skeleton--cell   { height: 0.875rem; width: 80%; }
.rt-skeleton--check  { height: 1rem; width: 1rem; border-radius: 2px; }

@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

.rt-empty {
  text-align: center;
  padding: 3rem 1rem;
}

.rt-empty__icon { margin: 0 auto 0.75rem; display: block; }

.rt-empty__text {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
