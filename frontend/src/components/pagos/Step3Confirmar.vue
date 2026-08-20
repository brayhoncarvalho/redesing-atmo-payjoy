<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePagosPayjoy } from '@/composables/usePagosPayjoy'

const {
  resumenVenta,
  formaPagoFinal,
  confirmacionPago,
  formTarjeta,
  guardarPago,
  cancelar,
  isLoadingGuardar,
  tipoPago,
  formInicial,
} = usePagosPayjoy()

// Modal de confirmação de cancelamento
const showCancelDialog = ref(false)

function handleCancelar() {
  if (isLoadingGuardar.value) return
  showCancelDialog.value = true
}

function confirmarCancelamento() {
  showCancelDialog.value = false
  cancelar()
}

function formatMonto(value: number) {
  return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Cliente (opcional) ──────────────────────────────────────────────────
const showCliente = ref(false)
const clienteTouched = ref({ primerNombre: false, primerApellido: false })

function toggleCliente() {
  showCliente.value = !showCliente.value
  if (!showCliente.value) {
    Object.assign(formInicial, { primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '' })
    clienteTouched.value = { primerNombre: false, primerApellido: false }
  }
}

// ── Validação campos Tarjeta ──────────────────────────────────────────────
const tarjetaTouched = ref(false)

const tipoError      = computed(() => tarjetaTouched.value && !formTarjeta.tipo          ? 'Obligatorio' : '')
const marcaError     = computed(() => tarjetaTouched.value && !formTarjeta.marca         ? 'Obligatorio' : '')
const ultimos4Error  = computed(() => tarjetaTouched.value && !/^\d{4}$/.test(formTarjeta.ultimos4) ? 'Debe tener 4 dígitos' : '')
const autorizError   = computed(() => tarjetaTouched.value && !formTarjeta.autorizacion.trim() ? 'Obligatorio' : '')

const tarjetaValid = computed(() =>
  !!formTarjeta.tipo &&
  !!formTarjeta.marca &&
  /^\d{4}$/.test(formTarjeta.ultimos4) &&
  !!formTarjeta.autorizacion.trim()
)

// ── Validação global (habilita botão) ────────────────────────────────────
const canSubmit = computed(() => {
  if (!confirmacionPago.value) return false
  if (formaPagoFinal.value === 'tarjeta' && !tarjetaValid.value) return false
  if (tipoPago.value === 'parcial' && showCliente.value) {
    if (!formInicial.primerNombre.trim() || !formInicial.primerApellido.trim()) return false
  }
  return true
})

function handleGuardar() {
  tarjetaTouched.value = true
  if (tipoPago.value === 'parcial' && showCliente.value) {
    clienteTouched.value.primerNombre   = true
    clienteTouched.value.primerApellido = true
  }
  if (!canSubmit.value) return
  guardarPago()
}
</script>

<template>
  <div class="step3-wrapper">
    <!-- Resumen de la venta -->
    <section class="step-card" aria-labelledby="resumen-titulo">
      <h2 id="resumen-titulo" class="step-card__section-title">Resumen de la venta</h2>

      <table class="resumen-table" role="table" aria-label="Resumen de la venta">
        <thead>
          <tr>
            <th class="resumen-table__th resumen-table__th--id">Identificación</th>
            <th class="resumen-table__th resumen-table__th--desc">Descripción</th>
            <th class="resumen-table__th resumen-table__th--val">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="resumenVenta">
            <td class="resumen-table__td">{{ resumenVenta.identificacion }}</td>
            <td class="resumen-table__td">{{ resumenVenta.descripcion }}</td>
            <td class="resumen-table__td resumen-table__td--right">
              {{ formatMonto(resumenVenta.valor) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" />
            <td class="resumen-table__total">
              Total: {{ resumenVenta ? formatMonto(resumenVenta.valor) : '$0.00' }}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>

    <!-- Cliente (opcional) -->
    <section v-if="tipoPago === 'parcial'" class="step-card" aria-labelledby="cliente-titulo">
      <div class="cliente-header">
        <h2 id="cliente-titulo" class="step-card__section-title">Cliente (opcional)</h2>
        <button class="btn btn--ghost btn--sm" type="button" @click="toggleCliente">
          {{ showCliente ? 'Ocultar' : 'Agregar datos' }}
        </button>
      </div>

      <Transition name="cliente-expand">
        <div v-if="showCliente" class="cliente-form">
          <div class="cliente-form__grid">
            <div class="cliente-form__field">
              <label class="cliente-form__label" for="c-primer-nombre">
                Primer Nombre <span class="cliente-form__required" aria-hidden="true">*</span>
              </label>
              <input
                id="c-primer-nombre"
                v-model="formInicial.primerNombre"
                class="cliente-form__input"
                :class="{ 'cliente-form__input--error': clienteTouched.primerNombre && !formInicial.primerNombre.trim() }"
                type="text"
                autocomplete="given-name"
                :aria-invalid="clienteTouched.primerNombre && !formInicial.primerNombre.trim()"
                @blur="clienteTouched.primerNombre = true"
              />
              <p
                v-if="clienteTouched.primerNombre && !formInicial.primerNombre.trim()"
                class="cliente-form__error"
                role="alert"
              >Campo obligatorio</p>
            </div>

            <div class="cliente-form__field">
              <label class="cliente-form__label" for="c-segundo-nombre">Segundo Nombre</label>
              <input
                id="c-segundo-nombre"
                v-model="formInicial.segundoNombre"
                class="cliente-form__input"
                type="text"
                autocomplete="additional-name"
              />
            </div>

            <div class="cliente-form__field">
              <label class="cliente-form__label" for="c-primer-apellido">
                Primer Apellido <span class="cliente-form__required" aria-hidden="true">*</span>
              </label>
              <input
                id="c-primer-apellido"
                v-model="formInicial.primerApellido"
                class="cliente-form__input"
                :class="{ 'cliente-form__input--error': clienteTouched.primerApellido && !formInicial.primerApellido.trim() }"
                type="text"
                autocomplete="family-name"
                :aria-invalid="clienteTouched.primerApellido && !formInicial.primerApellido.trim()"
                @blur="clienteTouched.primerApellido = true"
              />
              <p
                v-if="clienteTouched.primerApellido && !formInicial.primerApellido.trim()"
                class="cliente-form__error"
                role="alert"
              >Campo obligatorio</p>
            </div>

            <div class="cliente-form__field">
              <label class="cliente-form__label" for="c-segundo-apellido">Segundo Apellido</label>
              <input
                id="c-segundo-apellido"
                v-model="formInicial.segundoApellido"
                class="cliente-form__input"
                type="text"
              />
            </div>
          </div>
        </div>
      </Transition>
    </section>

    <!-- Forma de pago -->
    <section class="step-card" aria-labelledby="forma-titulo">
      <h2 id="forma-titulo" class="step-card__section-title">Forma de pago</h2>

      <fieldset class="forma-pago__options">
        <legend class="sr-only">Seleccione la forma de pago</legend>

        <!-- Efectivo -->
        <label
          class="forma-card"
          :class="{ 'forma-card--selected': formaPagoFinal === 'efectivo' }"
        >
          <input
            type="radio"
            name="forma-pago-final"
            value="efectivo"
            class="forma-card__input"
            v-model="formaPagoFinal"
          />
          <span class="forma-card__dot" aria-hidden="true">
            <span v-if="formaPagoFinal === 'efectivo'" class="forma-card__dot-fill" />
          </span>
          <span class="forma-card__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 9v6M18 9v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="forma-card__content">
            <span class="forma-card__title">Efectivo</span>
            <span class="forma-card__desc">Cobrar en efectivo al cliente.</span>
          </span>
        </label>

        <!-- Tarjeta -->
        <label
          class="forma-card"
          :class="{ 'forma-card--selected': formaPagoFinal === 'tarjeta' }"
        >
          <input
            type="radio"
            name="forma-pago-final"
            value="tarjeta"
            class="forma-card__input"
            v-model="formaPagoFinal"
          />
          <span class="forma-card__dot" aria-hidden="true">
            <span v-if="formaPagoFinal === 'tarjeta'" class="forma-card__dot-fill" />
          </span>
          <span
            class="forma-card__icon"
            :class="{ 'forma-card__icon--active': formaPagoFinal === 'tarjeta' }"
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 10h20" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 15h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="forma-card__content">
            <span class="forma-card__title">Tarjeta</span>
            <span class="forma-card__desc">Realizar pago en TPV (Terminal punto de venta).</span>
          </span>
        </label>
      </fieldset>
    </section>

    <!-- Comprobante / confirmación dinámica -->
    <section class="step-card" aria-labelledby="comprobante-titulo">
      <!-- Tarjeta -->
      <template v-if="formaPagoFinal === 'tarjeta'">
        <h2 id="comprobante-titulo" class="step-card__section-title">Comprobante de tarjeta</h2>
        <p class="comprobante__total">
          Total a pagar: <strong>{{ resumenVenta ? formatMonto(resumenVenta.valor) : '$0.00' }}</strong>
        </p>
        <label class="confirm-check">
          <input
            type="checkbox"
            v-model="confirmacionPago"
            class="confirm-check__input"
          />
          <span class="confirm-check__box" aria-hidden="true">
            <svg v-if="confirmacionPago" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="confirm-check__label">
            Asegura que se realizó el cobro con <span class="confirm-check__link">tarjeta</span> en la TPV (Terminal punto de venta)
          </span>
        </label>

        <!-- Campos adicionais de tarjeta -->
        <div class="tarjeta-form">
          <div class="tarjeta-form__group">
            <label class="tarjeta-form__label" for="tipo-tarjeta">
              Tipo de Tarjeta <span class="tarjeta-form__required" aria-hidden="true">*</span>
            </label>
            <div class="tarjeta-form__select-wrap">
              <select
                id="tipo-tarjeta"
                v-model="formTarjeta.tipo"
                class="tarjeta-form__select"
                :class="{ 'tarjeta-form__select--error': tipoError }"
                required
                aria-required="true"
              >
                <option value="" disabled>Seleccionar</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
              </select>
              <svg class="tarjeta-form__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p v-if="tipoError" class="tarjeta-form__error" role="alert">{{ tipoError }}</p>
          </div>

          <div class="tarjeta-form__group">
            <label class="tarjeta-form__label" for="marca-tarjeta">
              Marca de la tarjeta <span class="tarjeta-form__required" aria-hidden="true">*</span>
            </label>
            <div class="tarjeta-form__select-wrap">
              <select
                id="marca-tarjeta"
                v-model="formTarjeta.marca"
                class="tarjeta-form__select"
                :class="{ 'tarjeta-form__select--error': marcaError }"
                required
                aria-required="true"
              >
                <option value="" disabled>Seleccionar</option>
                <option value="mastercard">Mastercard</option>
                <option value="visa">Visa</option>
              </select>
              <svg class="tarjeta-form__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p v-if="marcaError" class="tarjeta-form__error" role="alert">{{ marcaError }}</p>
          </div>

          <div class="tarjeta-form__group">
            <label class="tarjeta-form__label" for="ultimos4">
              Últimos 4 dígitos <span class="tarjeta-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="ultimos4"
              v-model="formTarjeta.ultimos4"
              class="tarjeta-form__input"
              :class="{ 'tarjeta-form__input--error': ultimos4Error }"
              type="text"
              inputmode="numeric"
              maxlength="4"
              placeholder="1234"
              pattern="[0-9]{4}"
              required
              aria-required="true"
              @input="formTarjeta.ultimos4 = formTarjeta.ultimos4.replace(/\D/g, '').slice(0, 4)"
            />
            <p v-if="ultimos4Error" class="tarjeta-form__error" role="alert">{{ ultimos4Error }}</p>
          </div>

          <div class="tarjeta-form__group">
            <label class="tarjeta-form__label" for="autorizacion">
              Autorización <span class="tarjeta-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="autorizacion"
              v-model="formTarjeta.autorizacion"
              class="tarjeta-form__input"
              :class="{ 'tarjeta-form__input--error': autorizError }"
              type="text"
              placeholder="Cód. de autorización"
              required
              aria-required="true"
            />
            <p v-if="autorizError" class="tarjeta-form__error" role="alert">{{ autorizError }}</p>
          </div>
        </div>

      </template>

      <!-- Efectivo -->
      <template v-else>
        <h2 id="comprobante-titulo" class="step-card__section-title">Pago en efectivo</h2>
        <p class="comprobante__total">
          Total a pagar: <strong>{{ resumenVenta ? formatMonto(resumenVenta.valor) : '$0.00' }}</strong>
        </p>
        <label class="confirm-check">
          <input
            type="checkbox"
            v-model="confirmacionPago"
            class="confirm-check__input"
          />
          <span class="confirm-check__box" aria-hidden="true">
            <svg v-if="confirmacionPago" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="confirm-check__label">
            Confirmo que esta cantidad fue entregada por el cliente y que está de acuerdo con la venta.
          </span>
        </label>
      </template>
    </section>

    <!-- Footer global -->
    <div class="step3-footer">
      <button class="btn btn--ghost" type="button" :disabled="isLoadingGuardar" @click="handleCancelar">Cancelar</button>
      <button
        class="btn btn--primary"
        type="button"
        :disabled="!canSubmit || isLoadingGuardar"
        @click="handleGuardar"
      >
        <template v-if="isLoadingGuardar">Procesando...</template>
        <template v-else>Registrar Pago</template>
      </button>
    </div>

    <!-- Dialog de confirmação de cancelamento -->
    <Teleport to="body">
      <div v-if="showCancelDialog" class="cancel-overlay" role="dialog" aria-modal="true" aria-labelledby="cancel-title" @click.self="showCancelDialog = false">
        <div class="cancel-dialog">
          <button class="cancel-dialog__close" type="button" aria-label="Cerrar" @click="showCancelDialog = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="cancel-dialog__body">
            <span class="cancel-dialog__icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="1.5"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <div>
              <h4 id="cancel-title" class="cancel-dialog__title">Cancelar pago</h4>
              <p class="cancel-dialog__text">¿Está seguro de que desea cancelar este pago?</p>
              <p class="cancel-dialog__warn">Esta acción no puede deshacerse.</p>
            </div>
          </div>
          <div class="cancel-dialog__actions">
            <button class="btn btn--ghost" type="button" @click="showCancelDialog = false">Cancelar</button>
            <button class="btn btn--danger" type="button" @click="confirmarCancelamento">Sí, cancelar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.step3-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.step-card__section-title {
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-heading);
  color: var(--color-gray-900);
  margin-bottom: 16px;
}

/* Tabela resumen */
.resumen-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.resumen-table__th {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-brand);
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

.resumen-table__th--val { text-align: right; }

.resumen-table__td {
  padding: 12px 0;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
}

.resumen-table__td--right { text-align: right; }

.resumen-table__total {
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  padding-top: 12px;
}

/* Cliente */
.cliente-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cliente-header .step-card__section-title { margin-bottom: 0; }

.cliente-form {
  margin-top: 20px;
  overflow: hidden;
}

.cliente-form__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.cliente-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cliente-form__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.cliente-form__required { color: #dc2626; }

.cliente-form__input {
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.cliente-form__input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(1, 157, 244, 0.15);
}

.cliente-form__input--error {
  border-color: #dc2626;
}

.cliente-form__input--error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

.cliente-form__error {
  font-size: 12px;
  color: #dc2626;
  margin-top: 2px;
}

/* Transição de expansão do cliente */
.cliente-expand-enter-active,
.cliente-expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  max-height: 300px;
}

.cliente-expand-enter-from,
.cliente-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Forma de pago */
.forma-pago__options {
  display: flex;
  gap: 12px;
  border: none;
  padding: 0;
}

.forma-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  flex: 1;
  transition: border-color 0.15s, background 0.15s;
  background: #fff;
  user-select: none;
}

.forma-card:hover { border-color: var(--color-gray-300); }

.forma-card--selected {
  border-color: var(--color-brand);
  background: var(--color-brand-light);
}

.forma-card__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.forma-card__dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--color-gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s;
}

.forma-card--selected .forma-card__dot { border-color: var(--color-brand); }

.forma-card__dot-fill {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-brand);
}

.forma-card__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-gray-100);
  color: var(--color-gray-500);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.forma-card__icon--active {
  background: var(--color-brand);
  color: #fff;
}

.forma-card__content { display: flex; flex-direction: column; gap: 2px; }

.forma-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.forma-card__desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Comprobante */
.comprobante__total {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.confirm-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.confirm-check__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.confirm-check__box {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid var(--color-gray-300);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
  transition: border-color 0.15s, background 0.15s;
}

.confirm-check__input:checked + .confirm-check__box {
  border-color: var(--color-brand);
  background: var(--color-brand);
}

.confirm-check__label {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.5;
}

.confirm-check__link {
  color: var(--color-brand);
  font-weight: 500;
}

/* Tarjeta form */
.tarjeta-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
}

.tarjeta-form__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tarjeta-form__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.tarjeta-form__required { color: var(--color-feedback-danger, #dc2626); }

.tarjeta-form__select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.tarjeta-form__select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  height: 40px;
  padding: 0 36px 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #fff;
  font-size: 14px;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}

.tarjeta-form__select:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
}

.tarjeta-form__chevron {
  position: absolute;
  right: 10px;
  color: var(--color-gray-500);
  pointer-events: none;
}

.tarjeta-form__input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}

.tarjeta-form__input::placeholder { color: var(--color-gray-400); }

.tarjeta-form__input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
}

.tarjeta-form__input--error {
  border-color: #dc2626;
}

.tarjeta-form__input--error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

.tarjeta-form__select--error {
  border-color: #dc2626;
}

.tarjeta-form__select--error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

.tarjeta-form__error {
  font-size: 12px;
  color: #dc2626;
  margin-top: 3px;
}

/* Footer */
.step3-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.btn {
  height: 36px;
  padding: 0 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s;
  font-family: var(--font-sans);
}

.btn--sm { height: 30px; padding: 0 12px; font-size: 13px; }

.btn--primary { background: var(--color-brand-500); color: #fff; }
.btn--primary:hover:not(:disabled) { background: var(--color-brand-700); }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn--ghost {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
.btn--ghost:hover { background: var(--color-gray-50); }

.btn--danger { background: #dc2626; color: #fff; }
.btn--danger:hover { background: #b91c1c; }

/* Cancel dialog */
.cancel-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
}
.cancel-dialog {
  background: #fff; border-radius: 12px; width: 420px; max-width: 90vw;
  padding: 24px; position: relative; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.cancel-dialog__close {
  position: absolute; top: 14px; right: 14px;
  background: transparent; border: none; cursor: pointer;
  color: var(--color-text-secondary, #6b7280); padding: 4px;
  border-radius: 4px; display: flex; align-items: center; justify-content: center;
}
.cancel-dialog__close:hover { background: var(--color-gray-100, #f3f4f6); }
.cancel-dialog__body { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
.cancel-dialog__icon { flex-shrink: 0; margin-top: 2px; }
.cancel-dialog__title { font-size: 15px; font-weight: 600; color: var(--color-gray-900, #111827); margin: 0 0 6px; }
.cancel-dialog__text { font-size: 14px; color: var(--color-gray-700, #374151); margin: 0 0 4px; }
.cancel-dialog__warn { font-size: 13px; color: #dc2626; margin: 0; }
.cancel-dialog__actions { display: flex; justify-content: flex-end; gap: 10px; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0;
  margin: -1px; overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border-width: 0;
}
</style>
