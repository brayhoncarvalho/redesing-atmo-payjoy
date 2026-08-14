<script setup lang="ts">
import { computed } from 'vue'
import { usePagosPayjoy } from '@/composables/usePagosPayjoy'

const {
  showConfirmModal,
  cerrarModal,
  finalizarPago,
  resumenVenta,
  dispositivo,
  formTarjeta,
  formaPagoFinal,
  tipoPago,
  formInicial,
  transaccionId,
  transaccionFecha,
} = usePagosPayjoy()

// Mock — viria do contexto de sessão do usuário
const STORE_NAME = 'CAC TAPACHULA'
const STORE_ID   = '21050015'

const clienteNome = computed(() => {
  const { primerNombre, segundoNombre, primerApellido, segundoApellido } = formInicial
  const partes = [primerNombre, segundoNombre, primerApellido, segundoApellido].filter(Boolean)
  return partes.join(' ')
})

const referenciaPago = computed(() =>
  formaPagoFinal.value === 'tarjeta'
    ? formTarjeta.autorizacion || '—'
    : formInicial.voucher || '—'
)

const tipoPagoLabel = computed(() =>
  tipoPago.value === 'inicial' ? 'Pago Inicial' : 'Pago Parcial'
)

const marcaLabel: Record<string, string> = {
  mastercard: 'Mastercard',
  visa:       'Visa',
}

function formatMonto(value: number) {
  return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="showConfirmModal"
        class="m-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-resumen-title"
        @click.self="cerrarModal"
      >
        <div class="m-card">

          <!-- Cabeçalho -->
          <div class="m-header">
            <div class="m-header__check" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="var(--color-brand)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 id="modal-resumen-title" class="m-header__title">Resumen de la transacción</h2>
            <p class="m-header__store">{{ STORE_NAME }}</p>
            <p class="m-header__store-id">ID PDV: {{ STORE_ID }}</p>
          </div>

          <!-- Meta: data + tipo de pago -->
          <div class="m-meta">
            <div class="m-meta__row">
              <span class="m-meta__label">Fecha / Hora:</span>
              <span class="m-meta__value">{{ transaccionFecha }}</span>
            </div>
            <div class="m-meta__row">
              <span class="m-meta__label">Tipo de pago:</span>
              <span class="m-meta__value">{{ tipoPagoLabel }}</span>
            </div>
          </div>

          <!-- Tabela de transação -->
          <div class="m-table">
            <!-- Forma de pago -->
            <div class="m-table__row">
              <span class="m-table__label">Forma de pago</span>
              <span class="m-table__value m-table__value--pago">
                <span class="m-pago-icon" aria-hidden="true">
                  <svg v-if="formaPagoFinal === 'tarjeta'" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M2 10h20" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                </span>
                {{ formaPagoFinal === 'tarjeta' ? 'Tarjeta' : 'Efectivo' }}
              </span>
            </div>

            <div v-if="clienteNome" class="m-table__row">
              <span class="m-table__label">Cliente</span>
              <span class="m-table__value">{{ clienteNome }}</span>
            </div>

            <template v-if="dispositivo">
              <div class="m-table__row">
                <span class="m-table__label">DeviceTag</span>
                <span class="m-table__value">{{ dispositivo.deviceTag }}</span>
              </div>
              <div class="m-table__row">
                <span class="m-table__label">IMEI</span>
                <span class="m-table__value">{{ dispositivo.imei }}</span>
              </div>
            </template>

            <div class="m-table__row">
              <span class="m-table__label">Referencia de pago</span>
              <span class="m-table__value">{{ referenciaPago }}</span>
            </div>

            <div class="m-table__row">
              <span class="m-table__label">ID de transacción</span>
              <span class="m-table__value">{{ transaccionId }}</span>
            </div>

            <div class="m-table__row m-table__row--total">
              <span class="m-table__label">Total</span>
              <span class="m-table__value m-table__value--total">
                {{ resumenVenta ? formatMonto(resumenVenta.valor) : '$0.00' }}
              </span>
            </div>
          </div>

          <!-- Detalle condicional por forma de pago -->
          <!-- Tarjeta -->
          <div v-if="formaPagoFinal === 'tarjeta'" class="m-card-detail">
            <p class="m-card-detail__title">DETALLE DE TARJETA</p>
            <div class="m-card-detail__row">
              <span class="m-card-detail__label">Tipo de tarjeta</span>
              <span class="m-card-detail__value">{{ formTarjeta.tipo === 'debito' ? 'Débito' : 'Crédito' }}</span>
            </div>
            <div class="m-card-detail__row">
              <span class="m-card-detail__label">Marca de la tarjeta</span>
              <span class="m-card-detail__value">{{ marcaLabel[formTarjeta.marca] ?? formTarjeta.marca }}</span>
            </div>
            <div class="m-card-detail__row">
              <span class="m-card-detail__label">Últimos 4 dígitos</span>
              <span class="m-card-detail__value">●●●● {{ formTarjeta.ultimos4 }}</span>
            </div>
            <div class="m-card-detail__row">
              <span class="m-card-detail__label">Autorización</span>
              <span class="m-card-detail__value">{{ formTarjeta.autorizacion }}</span>
            </div>
          </div>

          <!-- Efectivo -->
          <div v-else class="m-card-detail">
            <p class="m-card-detail__title">DETALLE DE EFECTIVO</p>
            <div class="m-card-detail__row">
              <span class="m-card-detail__label">Total pagado</span>
              <span class="m-card-detail__value m-card-detail__value--total">
                {{ resumenVenta ? formatMonto(resumenVenta.valor) : '$0.00' }}
              </span>
            </div>
          </div>

          <!-- Footer único -->
          <div class="m-footer m-footer--single">
            <button class="btn btn--primary" type="button" @click="finalizarPago">Finalizar</button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop ── */
.m-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

/* ── Card ── */
.m-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px 28px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

/* ── Fechar ── */
.m-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-gray-400);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.m-close:hover { color: var(--color-gray-700); }

/* ── Header ── */
.m-header {
  text-align: center;
  margin-bottom: 20px;
}

.m-header__check {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #e8f4fd;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.m-header__title {
  font-size: 17px;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--color-gray-900);
  margin-bottom: 6px;
}

.m-header__store {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-gray-900);
  margin-bottom: 2px;
}

.m-header__store-id {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* ── Meta ── */
.m-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.m-meta__row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.m-meta__label { color: var(--color-text-primary); font-weight: 600; }

.m-meta__value {
  font-weight: 400;
  color: var(--color-gray-900);
}

/* ── Transaction table ── */
.m-table {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}

.m-table__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
  gap: 12px;
}

.m-table__row:last-child { border-bottom: none; }

.m-table__label {
  color: var(--color-gray-900, #212529);
  font-weight: 600;
  flex-shrink: 0;
}

.m-table__value {
  color: var(--color-gray-900);
  text-align: right;
}

/* Forma de pago value */
.m-table__value--pago {
  display: flex;
  align-items: center;
  gap: 6px;
}

.m-pago-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--color-brand);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Total row */
.m-table__row--total {
  background: var(--color-gray-50, #f8f9fa);
}

.m-table__value--total {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-gray-900);
}

/* ── Card detail ── */
.m-card-detail {
  border: 1.5px solid #bfd8f5;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 20px;
  background: #f5f9fe;
}

.m-card-detail__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-brand);
  margin-bottom: 10px;
}

.m-card-detail__row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 5px 0;
  gap: 12px;
}

.m-card-detail__label { color: var(--color-text-primary); font-weight: 600; }

.m-card-detail__value {
  color: var(--color-gray-900);
  font-weight: 400;
  text-align: right;
}

.m-card-detail__value--total {
  font-size: 15px;
  font-weight: 700;
}

/* ── Footer ── */
.m-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.m-footer--single {
  justify-content: flex-end;
}

/* ── Transition ── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-active .m-card,
.modal-fade-leave-active .m-card {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .m-card { transform: scale(0.96) translateY(8px); }
.modal-fade-leave-to .m-card   { transform: scale(0.96) translateY(8px); }
</style>
