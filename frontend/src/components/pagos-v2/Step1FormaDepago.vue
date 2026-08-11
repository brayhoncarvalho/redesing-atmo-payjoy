<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePagosPayjoy } from '@/composables/usePagosPayjoy'

const {
  tipoPago,
  formInicial,
  formParcial,
  buscarVenta,
  isLoadingBuscar,
  currentStep,
} = usePagosPayjoy()

const tipoCobroOptions = [
  { value: 'financiamiento', label: 'Pago del financiamiento' },
  { value: 'otro',           label: 'Otro cobro' },
]
const buscarPorOptions = [
  { value: 'DN',        label: 'DN' },
  { value: 'DeviceTag', label: 'DeviceTag' },
  { value: 'IMEI',      label: 'IMEI' },
]

const voucherTouched = computed(() => formInicial.voucher.length > 0)
const voucherError   = computed(() => {
  if (!voucherTouched.value) return ''
  if (!/^\d+$/.test(formInicial.voucher)) return 'Solo se permiten digitos numericos.'
  if (formInicial.voucher.length !== 6)   return 'Debe tener exactamente 6 digitos numericos.'
  return ''
})
function onVoucherInput(e: Event) {
  formInicial.voucher = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6)
}

const nombreTouched   = ref(false)
const apellidoTouched = ref(false)
const nombreError     = computed(() => nombreTouched.value   && !formInicial.primerNombre.trim()   ? 'Este campo es obligatorio.' : '')
const apellidoError   = computed(() => apellidoTouched.value && !formInicial.primerApellido.trim() ? 'Este campo es obligatorio.' : '')

const parcialTouched = ref(false)
const tipoCobroError = computed(() => parcialTouched.value && !formParcial.tipoCobro            ? 'Este campo es obligatorio.' : '')
const buscarPorError = computed(() => parcialTouched.value && !formParcial.buscarPor            ? 'Este campo es obligatorio.' : '')
const valorError     = computed(() => parcialTouched.value && !formParcial.valorBusqueda.trim() ? 'Este campo es obligatorio.' : '')

const buscarDisabled = computed(() => {
  if (tipoPago.value === 'inicial') {
    return !!voucherError.value || !formInicial.voucher || !formInicial.primerNombre.trim() || !formInicial.primerApellido.trim()
  }
  return !formParcial.tipoCobro || !formParcial.buscarPor || !formParcial.valorBusqueda.trim()
})

function handleBuscar() {
  if (tipoPago.value === 'inicial') {
    nombreTouched.value = apellidoTouched.value = true
  } else {
    parcialTouched.value = true
  }
  if (buscarDisabled.value) return
  buscarVenta()
}
</script>

<template>
  <section class="card" aria-labelledby="v2-busqueda-titulo">

    <div class="card__header">
      <h2 id="v2-busqueda-titulo" class="card__title">Búsqueda de la venta</h2>
      <span class="card__step-label">Paso 1 de 3</span>
    </div>

    <div class="tipo-pago-row">
      <div class="segmented" role="tablist" aria-label="Tipo de pago">
        <button
          type="button"
          role="tab"
          class="segmented__btn"
          :class="{ 'segmented__btn--active': tipoPago === 'inicial' }"
          :aria-selected="tipoPago === 'inicial'"
          @click="tipoPago = 'inicial'"
        >Pago Inicial</button>
        <button
          type="button"
          role="tab"
          class="segmented__btn"
          :class="{ 'segmented__btn--active': tipoPago === 'parcial' }"
          :aria-selected="tipoPago === 'parcial'"
          @click="tipoPago = 'parcial'"
        >Pago Parcial</button>
      </div>
      <p class="tipo-pago__desc">
        {{ tipoPago === 'inicial' ? 'Enganche de una venta nueva, con voucher en mano.' : 'Pago de cuota de un financiamiento activo.' }}
      </p>
    </div>

    <template v-if="tipoPago === 'inicial'">
      <div class="voucher-row">
        <div class="voucher-field">
          <label class="field__label" for="v2-voucher">
            Voucher <span class="field__req" aria-hidden="true">*</span>
          </label>
          <div class="field__input-wrap">
            <input
              id="v2-voucher"
              :value="formInicial.voucher"
              class="field__input field__input--counter"
              :class="{ 'field__input--error': voucherError }"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="000123"
              autocomplete="off"
              :aria-invalid="!!voucherError"
              @input="onVoucherInput"
            />
            <span class="field__counter" aria-hidden="true">{{ formInicial.voucher.length }}/6</span>
          </div>
          <p v-if="voucherError" class="field__error" role="alert">{{ voucherError }}</p>
        </div>
        <div class="voucher-hint">
          <svg class="voucher-hint__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="8" stroke="#2196f3" stroke-width="1.5"/>
            <path d="M9 8v5" stroke="#2196f3" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="9" cy="5.5" r="0.75" fill="#2196f3"/>
          </svg>
          <p class="voucher-hint__text">Los 6 dígitos están impresos en el voucher entregado por el cliente, arriba del código de barras.</p>
        </div>
      </div>

      <div class="field-group">
        <p class="field-group__title">Datos del cliente</p>
        <div class="grid grid--2">
          <div class="field">
            <label class="field__label" for="v2-primer-nombre">
              Primer Nombre <span class="field__req" aria-hidden="true">*</span>
            </label>
            <input
              id="v2-primer-nombre"
              v-model="formInicial.primerNombre"
              class="field__input"
              :class="{ 'field__input--error': nombreError }"
              type="text"
              autocomplete="given-name"
              :aria-invalid="!!nombreError"
              @blur="nombreTouched = true"
            />
            <p v-if="nombreError" class="field__error" role="alert">{{ nombreError }}</p>
          </div>
          <div class="field">
            <label class="field__label" for="v2-primer-apellido">
              Primer Apellido <span class="field__req" aria-hidden="true">*</span>
            </label>
            <input
              id="v2-primer-apellido"
              v-model="formInicial.primerApellido"
              class="field__input"
              :class="{ 'field__input--error': apellidoError }"
              type="text"
              autocomplete="family-name"
              :aria-invalid="!!apellidoError"
              @blur="apellidoTouched = true"
            />
            <p v-if="apellidoError" class="field__error" role="alert">{{ apellidoError }}</p>
          </div>
          <div class="field">
            <label class="field__label" for="v2-segundo-nombre">
              Segundo Nombre <span class="field__opt">(opcional)</span>
            </label>
            <input id="v2-segundo-nombre" v-model="formInicial.segundoNombre" class="field__input" type="text" autocomplete="additional-name" />
          </div>
          <div class="field">
            <label class="field__label" for="v2-segundo-apellido">
              Segundo Apellido <span class="field__opt">(opcional)</span>
            </label>
            <input id="v2-segundo-apellido" v-model="formInicial.segundoApellido" class="field__input" type="text" />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="field-group">
        <p class="field-group__title">Criterios de búsqueda</p>
        <div class="grid grid--3">
          <div class="field">
            <label class="field__label" for="v2-tipo-cobro">
              Tipo de cobro <span class="field__req" aria-hidden="true">*</span>
            </label>
            <div class="field__select-wrap">
              <select id="v2-tipo-cobro" v-model="formParcial.tipoCobro" class="field__select" :class="{ 'field__select--error': tipoCobroError }" :aria-invalid="!!tipoCobroError">
                <option value="" disabled>Seleccione una opción</option>
                <option v-for="o in tipoCobroOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
              <svg class="field__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <p v-if="tipoCobroError" class="field__error" role="alert">{{ tipoCobroError }}</p>
          </div>
          <div class="field">
            <label class="field__label" for="v2-buscar-por">
              Buscar por <span class="field__req" aria-hidden="true">*</span>
            </label>
            <div class="field__select-wrap">
              <select id="v2-buscar-por" v-model="formParcial.buscarPor" class="field__select" :class="{ 'field__select--error': buscarPorError }" :aria-invalid="!!buscarPorError">
                <option value="" disabled>Seleccione una opción</option>
                <option v-for="o in buscarPorOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
              <svg class="field__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <p v-if="buscarPorError" class="field__error" role="alert">{{ buscarPorError }}</p>
          </div>
          <div class="field">
            <label class="field__label" for="v2-valor-busqueda">
              Valor de búsqueda <span class="field__req" aria-hidden="true">*</span>
            </label>
            <div class="field__icon-wrap">
              <svg class="field__icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="#9ca3af" stroke-width="1.5"/>
                <path d="M10.5 10.5L13.5 13.5" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input id="v2-valor-busqueda" v-model="formParcial.valorBusqueda" class="field__input field__input--icon" :class="{ 'field__input--error': valorError }" type="text" placeholder="DN, DeviceTag o IMEI" autocomplete="off" :aria-invalid="!!valorError" />
            </div>
            <p v-if="valorError" class="field__error" role="alert">{{ valorError }}</p>
          </div>
        </div>
      </div>
    </template>

    <div class="card__footer">
      <p class="card__footer-hint">Completá los campos obligatorios (*).</p>
      <div class="card__footer-actions">
        <button class="btn btn--ghost" type="button">Limpiar</button>
        <button class="btn btn--primary" type="button" :disabled="buscarDisabled || isLoadingBuscar" @click="handleBuscar">
          <svg v-if="isLoadingBuscar" class="btn__spin" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" stroke-width="2.5"/>
            <path d="M12 3a9 9 0 0 1 9 9" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <svg v-else width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="5" stroke="white" stroke-width="1.5"/>
            <path d="M10.5 10.5L13.5 13.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ isLoadingBuscar ? 'Buscando...' : 'Buscar venta' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--color-bg-card, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-lg, 12px);
  padding: 28px;
  box-shadow: var(--shadow-card, 0 1px 4px rgba(0,0,0,0.08));
}
.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.card__title {
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-heading, inherit);
  color: var(--color-gray-900, #111827);
  margin: 0;
}
.card__step-label {
  font-size: 13px;
  color: var(--color-text-muted, #6b7280);
}
.tipo-pago-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.tipo-pago__desc {
  font-size: 13px;
  color: var(--color-text-muted, #6b7280);
  margin: 0;
}
.segmented {
  display: inline-flex;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
}
.segmented__btn {
  height: 36px;
  padding: 0 18px;
  border: none;
  border-right: 1px solid var(--color-border, #e5e7eb);
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-body, inherit);
  color: var(--color-text-secondary, #6b7280);
  background: transparent;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.segmented__btn:last-child { border-right: none; }
.segmented__btn--active { background: #2196f3; color: #fff; }
.segmented__btn:hover:not(.segmented__btn--active) { background: var(--color-gray-50, #f9fafb); }
.segmented__btn:focus-visible { outline: 2px solid #2196f3; outline-offset: 2px; }

.voucher-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.voucher-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-shrink: 0;
}
.voucher-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #f0f7ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px 14px;
  flex: 1;
  min-width: 220px;
  margin-top: 23px;
}
.voucher-hint__icon { flex-shrink: 0; margin-top: 1px; }
.voucher-hint__text { font-size: 13px; color: #1e40af; margin: 0; line-height: 1.5; }

.field__input-wrap { position: relative; display: flex; align-items: center; }
.field__input--counter { padding-right: 44px; width: 200px; }
.field__counter {
  position: absolute; right: 10px;
  font-size: 12px; color: var(--color-text-muted, #9ca3af);
  pointer-events: none; white-space: nowrap;
}

.field-group { margin-bottom: 20px; }
.field-group__title {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--color-text-secondary, #6b7280);
  margin-bottom: 14px; padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.grid { display: grid; gap: 16px; }
.grid--2 { grid-template-columns: 1fr 1fr; }
.grid--3 { grid-template-columns: 1fr 1fr 1fr; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field__label {
  font-size: 13px; font-weight: 500; color: var(--color-text-label, #374151);
  display: flex; align-items: center; gap: 4px;
}
.field__req { color: #dc2626; }
.field__opt { font-size: 11px; font-weight: 400; color: var(--color-text-muted, #9ca3af); }

.field__input {
  height: 40px; padding: 0 12px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-sm, 6px);
  font-size: 14px; color: var(--color-text-primary, #111827);
  background: #fff; outline: none; font-family: var(--font-body, inherit);
  width: 100%; box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field__input:focus { border-color: #2196f3; box-shadow: 0 0 0 3px rgba(33,150,243,0.15); }
.field__input--error { border-color: #dc2626; }
.field__error { font-size: 12px; color: #dc2626; }

.field__select-wrap { position: relative; }
.field__select {
  width: 100%; height: 40px; padding: 0 36px 0 12px;
  border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-sm, 6px);
  font-size: 14px; color: var(--color-text-primary, #111827); background: #fff;
  appearance: none; outline: none; cursor: pointer; font-family: var(--font-body, inherit);
  transition: border-color 0.15s;
}
.field__select:focus { border-color: #2196f3; }
.field__select--error { border-color: #dc2626; }
.field__chevron { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }

.field__icon-wrap { position: relative; }
.field__icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.field__input--icon { padding-left: 34px; }

.card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border, #e5e7eb);
  flex-wrap: wrap;
}
.card__footer-hint { font-size: 13px; color: var(--color-text-muted, #9ca3af); margin: 0; }
.card__footer-actions { display: flex; gap: 10px; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 40px; padding: 0 20px; border-radius: var(--radius-sm, 6px);
  font-size: 14px; font-weight: 500; font-family: var(--font-body, inherit);
  cursor: pointer; border: none; transition: background 0.15s;
}
.btn--primary { background: #2196f3; color: #fff; }
.btn--primary:hover:not(:disabled) { background: #1976d2; }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--ghost {
  background: transparent; color: var(--color-text-primary, #111827);
  border: 1px solid var(--color-border, #e5e7eb);
}
.btn--ghost:hover { background: var(--color-gray-50, #f9fafb); }
.btn__spin { animation: spin 0.75s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>