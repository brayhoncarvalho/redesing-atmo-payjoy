<script setup lang="ts">
import {
  CANAL_OPTIONS,
  ESTADO_OPTIONS,
  BUSCAR_POR_OPTIONS,
  type HistorialPagosFilters,
} from '@/constants/historialPagos'

const props = defineProps<{ modelValue: HistorialPagosFilters; open: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: HistorialPagosFilters]
  search: []
  clear: []
  close: []
}>()

function onField<K extends keyof HistorialPagosFilters>(key: K, value: HistorialPagosFilters[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fd-fade">
      <div v-if="open" class="fd-overlay" aria-hidden="true" @click="emit('close')" />
    </Transition>
    <Transition name="fd-slide">
      <aside
        v-if="open"
        class="fd-drawer"
        role="complementary"
        aria-label="Filtros de búsqueda"
      >
        <div class="fd-header">
          <h2 class="fd-title">Filtros</h2>
          <button class="fd-close" type="button" aria-label="Cerrar filtros" @click="emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <form class="fd-body" @submit.prevent="emit('search'); emit('close')">
          <!-- Fechas -->
          <fieldset class="fd-fieldset">
            <legend class="fd-legend">Fecha</legend>
            <div class="fd-row">
              <div class="fd-field">
                <label class="fd-label" for="v2-fecha-inicio">Fecha inicio</label>
                <input
                  id="v2-fecha-inicio"
                  class="fd-input"
                  type="date"
                  :value="modelValue.fechaInicio"
                  @input="onField('fechaInicio', ($event.target as HTMLInputElement).value)"
                />
              </div>
              <div class="fd-field">
                <label class="fd-label" for="v2-fecha-fin">Fecha fin</label>
                <input
                  id="v2-fecha-fin"
                  class="fd-input"
                  type="date"
                  :value="modelValue.fechaFin"
                  @input="onField('fechaFin', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </fieldset>

          <!-- Canal -->
          <div class="fd-field">
            <label class="fd-label" for="v2-canal">Canal</label>
            <div class="fd-select-wrap">
              <select
                id="v2-canal"
                class="fd-input fd-select"
                :value="modelValue.canal"
                @change="onField('canal', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="opt in CANAL_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <svg class="fd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <!-- Estado -->
          <div class="fd-field">
            <label class="fd-label" for="v2-estado">Estado</label>
            <div class="fd-select-wrap">
              <select
                id="v2-estado"
                class="fd-input fd-select"
                :value="modelValue.estado"
                @change="onField('estado', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="opt in ESTADO_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <svg class="fd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <!-- Buscar por -->
          <fieldset class="fd-fieldset">
            <legend class="fd-legend">Búsqueda</legend>
            <div class="fd-field">
              <label class="fd-label" for="v2-buscar-campo">Buscar por</label>
              <div class="fd-select-wrap">
                <select
                  id="v2-buscar-campo"
                  class="fd-input fd-select"
                  :value="modelValue.buscarPorCampo"
                  @change="onField('buscarPorCampo', ($event.target as HTMLSelectElement).value as HistorialPagosFilters['buscarPorCampo'])"
                >
                  <option v-for="opt in BUSCAR_POR_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <svg class="fd-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <div class="fd-field">
              <label class="fd-label" for="v2-buscar-valor">Valor</label>
              <input
                id="v2-buscar-valor"
                class="fd-input"
                type="text"
                placeholder="Ingresá el valor"
                :value="modelValue.buscarPorValor"
                :disabled="!modelValue.buscarPorCampo"
                @input="onField('buscarPorValor', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </fieldset>

          <!-- Avanzados -->
          <fieldset class="fd-fieldset">
            <legend class="fd-legend">Avanzados</legend>
            <div class="fd-field">
              <label class="fd-label" for="v2-paso-flujo">Paso en flujo</label>
              <input
                id="v2-paso-flujo"
                class="fd-input"
                type="text"
                placeholder="Ej: Confirmación"
                :value="modelValue.pasoFlujo"
                @input="onField('pasoFlujo', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <div class="fd-field">
              <label class="fd-label" for="v2-tienda">Tienda</label>
              <input
                id="v2-tienda"
                class="fd-input"
                type="text"
                placeholder="Tienda"
                :value="modelValue.tienda"
                @input="onField('tienda', ($event.target as HTMLInputElement).value)"
              />
            </div>
            <div class="fd-field">
              <label class="fd-label" for="v2-usuario">Usuario</label>
              <input
                id="v2-usuario"
                class="fd-input"
                type="text"
                placeholder="Usuario"
                :value="modelValue.usuario"
                @input="onField('usuario', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </fieldset>
        </form>

        <div class="fd-footer">
          <button class="fd-btn fd-btn--ghost" type="button" @click="emit('clear')">Limpiar todo</button>
          <button class="fd-btn fd-btn--primary" type="button" @click="emit('search'); emit('close')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            Buscar
          </button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fd-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.35);
}

.fd-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1101;
  width: 22rem;
  background: var(--color-bg-card);
  border-left: 1px solid var(--color-border);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.fd-title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.fd-close {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fd-close:hover { background: var(--color-gray-100); }
.fd-close:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

.fd-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: grid;
  gap: 1.25rem;
  align-content: start;
}

.fd-fieldset {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.875rem;
  display: grid;
  gap: 0.75rem;
}

.fd-legend {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-brand);
  padding: 0 0.25rem;
}

.fd-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.fd-field {
  display: grid;
  gap: 0.25rem;
}

.fd-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.fd-input {
  height: 2.375rem;
  padding: 0 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  width: 100%;
}

.fd-input:focus {
  outline: 2px solid var(--color-brand);
  outline-offset: -1px;
  border-color: var(--color-brand);
}

.fd-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fd-select-wrap {
  position: relative;
}

.fd-select {
  appearance: none;
  padding-right: 2rem;
  cursor: pointer;
}

.fd-chevron {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text-secondary);
}

.fd-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.fd-btn {
  flex: 1;
  height: 2.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border: none;
  transition: background 0.15s;
}

.fd-btn--primary {
  background: var(--color-brand);
  color: #fff;
}

.fd-btn--primary:hover { background: var(--color-action-600); }
.fd-btn--primary:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

.fd-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.fd-btn--ghost:hover { background: var(--color-gray-50); }
.fd-btn--ghost:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

/* Transitions */
.fd-fade-enter-active, .fd-fade-leave-active { transition: opacity 0.2s ease; }
.fd-fade-enter-from, .fd-fade-leave-to { opacity: 0; }

.fd-slide-enter-active, .fd-slide-leave-active { transition: transform 0.22s ease; }
.fd-slide-enter-from, .fd-slide-leave-to { transform: translateX(100%); }

@media (max-width: 28rem) {
  .fd-drawer { width: 100%; }
  .fd-row { grid-template-columns: 1fr; }
}
</style>
