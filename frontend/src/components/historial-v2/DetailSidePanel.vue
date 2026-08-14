<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { HISTORIAL_PAGOS_TEXT, ESTADO_OPTIONS, type HistorialPagoRecord } from '@/constants/historialPagos'

const props = defineProps<{ record: HistorialPagoRecord | null }>()

const emit = defineEmits<{
  close: []
  cancel: [record: HistorialPagoRecord]
  copyId: [id: string]
}>()

const page = ref<1 | 2>(1)
const showCancelConfirm = ref(false)

const safe = computed(() => props.record!)

// Reset ao trocar de registro
watch(() => props.record?.id, () => {
  page.value = 1
  showCancelConfirm.value = false
})

function formatEstado(v: string) {
  return ESTADO_OPTIONS.find((o) => o.value === v)?.label ?? v
}

function estadoClass(estado: string) {
  const map: Record<string, string> = {
    concluido: 'sp-badge--success',
    cancelado: 'sp-badge--danger',
    rechazado: 'sp-badge--warning',
    'en-progreso': 'sp-badge--info',
    registrando: 'sp-badge--info',
    expirado: 'sp-badge--neutral',
  }
  return map[estado] ?? 'sp-badge--neutral'
}
</script>

<template>
  <Transition name="sp-slide">
    <aside
      v-if="record"
      class="sp-panel"
      role="complementary"
      aria-label="Detalles del pago seleccionado"
    >
      <!-- Header sticky -->
      <div class="sp-header">
        <h2 class="sp-title">{{ HISTORIAL_PAGOS_TEXT.detailModalTitle }}</h2>
      </div>

      <!-- Tabs -->
      <div class="sp-tabs" role="tablist">
        <button
          class="sp-tab"
          :class="{ 'sp-tab--active': page === 1 }"
          type="button"
          role="tab"
          :aria-selected="page === 1"
          @click="page = 1"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Resumen
        </button>
        <button
          class="sp-tab"
          :class="{ 'sp-tab--active': page === 2 }"
          type="button"
          role="tab"
          :aria-selected="page === 2"
          @click="page = 2"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.8"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.8"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.8"/>
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.8"/>
          </svg>
          Detalles
        </button>
      </div>

      <div class="sp-body">

        <!-- ── Página 1: Resumen ─────────────────────────── -->
        <template v-if="page === 1">
          <div class="sp-store">
            <p class="sp-store__name">{{ safe.storeName }}</p>
            <p class="sp-store__id">{{ HISTORIAL_PAGOS_TEXT.summaryStoreIdLabel }}: {{ safe.storePdvId }}</p>
          </div>

          <dl class="sp-dl">
            <div class="sp-dl__row">
              <dt>{{ HISTORIAL_PAGOS_TEXT.summaryDateHour }}</dt>
              <dd>{{ safe.fechaCreacion }}</dd>
            </div>
            <div class="sp-dl__row">
              <dt>{{ HISTORIAL_PAGOS_TEXT.summaryPaymentType }}</dt>
              <dd class="sp-dl__bold">{{ safe.tipoPago }}</dd>
            </div>
            <div class="sp-dl__row">
              <dt>{{ HISTORIAL_PAGOS_TEXT.summaryPaymentMethod }}</dt>
              <dd class="sp-dl__bold">{{ safe.formaPago }}</dd>
            </div>
          </dl>

          <p class="sp-section-title">{{ HISTORIAL_PAGOS_TEXT.detailSectionTitle }}</p>
          <dl class="sp-dl">
            <div class="sp-dl__row">
              <dt>{{ HISTORIAL_PAGOS_TEXT.summaryDeviceTag }}</dt>
              <dd>{{ safe.deviceTag }}</dd>
            </div>
            <div class="sp-dl__row">
              <dt>{{ HISTORIAL_PAGOS_TEXT.summaryImei }}</dt>
              <dd>{{ safe.imei }}</dd>
            </div>
            <div class="sp-dl__row">
              <dt>{{ HISTORIAL_PAGOS_TEXT.summaryReference }}</dt>
              <dd>{{ safe.referencia }}</dd>
            </div>
          </dl>

          <dl class="sp-dl sp-dl--total">
            <div class="sp-dl__row sp-dl__row--total">
              <dt class="sp-total-label">{{ HISTORIAL_PAGOS_TEXT.summaryTotal }}</dt>
              <dd class="sp-total-value">{{ safe.monto }}</dd>
            </div>
          </dl>

          <div class="sp-footer sp-footer--between">
            <button class="sp-btn sp-btn--danger" type="button" @click="showCancelConfirm = true">
              {{ HISTORIAL_PAGOS_TEXT.cancelPayment }}
            </button>
            <button class="sp-btn sp-btn--next" type="button" @click="page = 2">
              Detalles
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </template>

        <!-- ── Página 2: Detalles ───────────────────────── -->
        <template v-else>
          <div class="sp-card">
            <p class="sp-card__brand">{{ HISTORIAL_PAGOS_TEXT.detailPayjoySection }}</p>
            <div class="sp-grid">
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailIdTransaccion }}</span>
                <span class="sp-field__value">{{ safe.idTransaccion }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailNumeroAutorizacion }}</span>
                <span class="sp-field__value">{{ safe.numeroAutorizacion }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailFechaPago }}</span>
                <span class="sp-field__value">{{ safe.fechaPago }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailFechaCreacion }}</span>
                <span class="sp-field__value">{{ safe.fechaCreacion }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailMonto }}</span>
                <span class="sp-field__value">{{ safe.monto }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailServicio }}</span>
                <span class="sp-field__value">{{ safe.servicio }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailProducto }}</span>
                <span class="sp-field__value">{{ safe.producto }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailEstado }}</span>
                <span class="sp-badge" :class="estadoClass(safe.estado)">{{ formatEstado(safe.estado) }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailPasoFlujo }}</span>
                <span class="sp-field__value">{{ safe.pasoFlujo }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailUsuario }}</span>
                <span class="sp-field__value">{{ safe.usuario }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailIdDelPago }}</span>
                <span class="sp-field__value sp-field__value--copy">
                  {{ safe.idDelPago }}
                  <button class="sp-copy-btn" type="button" aria-label="Copiar ID del pago" @click="emit('copyId', safe.idDelPago)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="8" y="8" width="12" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/>
                      <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    </svg>
                  </button>
                </span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailTienda }}</span>
                <span class="sp-field__value">{{ safe.tienda }}</span>
              </div>
            </div>
          </div>

          <div v-if="safe.catalina" class="sp-card">
            <p class="sp-card__brand">{{ HISTORIAL_PAGOS_TEXT.detailCatalinaSection }}</p>
            <div class="sp-grid">
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailFechaEnvio }}</span>
                <span class="sp-field__value">{{ safe.catalina!.fechaEnvio }}</span>
              </div>
              <div class="sp-field">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailEstadoCatalina }}</span>
                <span class="sp-field__value">{{ safe.catalina!.estado }}</span>
              </div>
              <div class="sp-field sp-field--full">
                <span class="sp-field__label">{{ HISTORIAL_PAGOS_TEXT.detailInfoAdicional }}</span>
                <span class="sp-field__value">{{ safe.catalina!.informacionAdicional }}</span>
              </div>
            </div>
          </div>

          <div class="sp-footer sp-footer--between">
            <button class="sp-btn sp-btn--outline" type="button" @click="page = 1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Resumen
            </button>
            <button class="sp-btn sp-btn--outline" type="button" @click="emit('close')">Cerrar</button>
          </div>
        </template>

      </div>

      <!-- Confirmação de cancelamento -->
      <Transition name="sp-confirm-fade">
        <div v-if="showCancelConfirm" class="sp-confirm" role="alertdialog" aria-modal="true" aria-labelledby="sp-confirm-title">
          <div class="sp-confirm__card">
            <div class="sp-confirm__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--color-danger)" stroke-width="1.8"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="var(--color-danger)" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 id="sp-confirm-title" class="sp-confirm__title">Cancelar pago</h3>
            <p class="sp-confirm__msg">¿Está seguro de que desea cancelar este pago?</p>
            <p class="sp-confirm__warn">Esta acción no puede deshacerse.</p>
            <div class="sp-confirm__actions">
              <button class="sp-btn sp-btn--outline" type="button" @click="showCancelConfirm = false">Cancelar</button>
              <button class="sp-btn sp-btn--danger" type="button" @click="() => { emit('cancel', safe); showCancelConfirm = false }">Sí, cancelar</button>
            </div>
          </div>
        </div>
      </Transition>
    </aside>
  </Transition>
</template>

<style scoped>
.sp-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  width: 26rem;
  background: var(--color-bg-card);
  border-left: 1px solid var(--color-border);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-bg-card);
}

.sp-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.sp-close {
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

.sp-close:hover { background: var(--color-gray-100); }
.sp-close:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

.sp-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.sp-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.13s, border-color 0.13s;
}

.sp-tab:hover { color: var(--color-text-primary); }
.sp-tab--active { color: var(--color-brand); border-bottom-color: var(--color-brand); font-weight: 700; }
.sp-tab:focus-visible { outline: 2px solid var(--color-brand); outline-offset: -2px; }

.sp-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

/* Resumen */
.sp-store {
  text-align: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.sp-store__name {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--color-text-primary);
}

.sp-store__id { font-size: 0.8125rem; color: var(--color-text-secondary); margin-top: 0.125rem; }

.sp-section-title {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.sp-dl {
  display: grid;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.sp-dl--total { border-bottom: none; }

.sp-dl__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
}

.sp-dl__row dt { color: var(--color-text-secondary); }
.sp-dl__row dd { color: var(--color-text-primary); text-align: right; }
.sp-dl__bold { font-weight: 700; }

.sp-dl__row--total { align-items: flex-end; }
.sp-total-label { font-size: 1.125rem; font-weight: 700; color: var(--color-text-primary); }
.sp-total-value { font-size: 1.625rem; font-weight: 700; font-family: var(--font-heading); color: var(--color-text-primary); line-height: 1; }

/* Detalles cards */
.sp-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.sp-card__brand {
  font-size: 0.9375rem;
  font-weight: 700;
  text-align: center;
  color: var(--color-text-primary);
  margin-bottom: 0.875rem;
}

.sp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem 1.25rem;
}

.sp-field { display: grid; gap: 0.125rem; }
.sp-field--full { grid-column: span 2; }

.sp-field__label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-brand);
  text-transform: uppercase;
}

.sp-field__value { font-size: 0.875rem; color: var(--color-text-primary); word-break: break-word; }

.sp-field__value--copy { display: inline-flex; align-items: center; gap: 0.25rem; }

.sp-copy-btn {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: var(--color-brand);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sp-copy-btn:hover { background: var(--color-brand-light); }
.sp-copy-btn:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

.sp-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
}

.sp-badge--success { background: #d1fae5; color: #065f46; }
.sp-badge--danger  { background: #fee2e2; color: #991b1b; }
.sp-badge--warning { background: #fef3c7; color: #92400e; }
.sp-badge--info    { background: var(--color-brand-light); color: var(--color-brand); }
.sp-badge--neutral { background: var(--color-gray-100); color: var(--color-text-secondary); }

/* Footer */
.sp-footer {
  display: flex;
  padding-top: 0.25rem;
  gap: 0.625rem;
}

.sp-footer--between { justify-content: space-between; }

.sp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  height: 2.25rem;
  padding: 0 1.125rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.13s;
}

.sp-btn--outline {
  background: transparent;
  border: 1.5px solid var(--color-brand);
  color: var(--color-brand);
}

.sp-btn--outline:hover { background: var(--color-brand-light); }
.sp-btn--outline:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

.sp-btn--next {
  background: var(--color-brand);
  color: #fff;
}

.sp-btn--next:hover { background: var(--color-action-600); }
.sp-btn--next:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }

.sp-btn--danger {
  background: var(--color-danger);
  color: #fff;
}

.sp-btn--danger:hover { filter: brightness(0.9); }
.sp-btn--danger:focus-visible { outline: 2px solid var(--color-danger); outline-offset: 2px; }

/* Confirm overlay */
.sp-confirm {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.sp-confirm__card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  width: 100%;
  max-width: 20rem;
  display: grid;
  gap: 0.5rem;
  text-align: center;
  box-shadow: var(--shadow-card);
}

.sp-confirm__icon { display: flex; justify-content: center; margin-bottom: 0.25rem; }
.sp-confirm__title { font-size: 1rem; font-weight: 700; color: var(--color-text-primary); }
.sp-confirm__msg { font-size: 0.9375rem; color: var(--color-text-primary); }
.sp-confirm__warn { font-size: 0.8125rem; color: var(--color-brand); }

.sp-confirm__actions {
  display: flex;
  gap: 0.625rem;
  justify-content: center;
  margin-top: 0.375rem;
}

/* Transitions */
.sp-slide-enter-active, .sp-slide-leave-active { transition: transform 0.22s ease; }
.sp-slide-enter-from, .sp-slide-leave-to { transform: translateX(100%); }

.sp-confirm-fade-enter-active, .sp-confirm-fade-leave-active { transition: opacity 0.15s ease; }
.sp-confirm-fade-enter-from, .sp-confirm-fade-leave-to { opacity: 0; }

@media (max-width: 40rem) {
  .sp-panel { width: 100%; }
  .sp-grid { grid-template-columns: 1fr; }
  .sp-field--full { grid-column: span 1; }
}
</style>
