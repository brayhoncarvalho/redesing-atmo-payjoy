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

function formatMonto(value: number) {
  return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Cliente — usa formInicial compartilhado para refletir no modal ─────────
const clienteTouched = ref({ primerNombre: false, primerApellido: false })

// ── Validação Tarjeta ──────────────────────────────────────────────────────
const tarjetaTouched = ref(false)
const tipoError     = computed(() => tarjetaTouched.value && !formTarjeta.tipo                    ? 'Obligatorio' : '')
const marcaError    = computed(() => tarjetaTouched.value && !formTarjeta.marca                   ? 'Obligatorio' : '')
const ultimos4Error = computed(() => tarjetaTouched.value && !/^\d{4}$/.test(formTarjeta.ultimos4) ? 'Debe tener 4 dígitos' : '')
const autorizError  = computed(() => tarjetaTouched.value && !formTarjeta.autorizacion.trim()     ? 'Obligatorio' : '')

const tarjetaValid = computed(() =>
  !!formTarjeta.tipo && !!formTarjeta.marca &&
  /^\d{4}$/.test(formTarjeta.ultimos4) && !!formTarjeta.autorizacion.trim()
)

// ── canSubmit — checkbox DEPOIS dos campos (ordem semântica correta) ───────
const canSubmit = computed(() => {
  if (!confirmacionPago.value) return false
  if (formaPagoFinal.value === 'tarjeta' && !tarjetaValid.value) return false
  return true
})

function handleGuardar() {
  tarjetaTouched.value = true
  if (!canSubmit.value) return
  guardarPago()
}

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
</script>

<template>
  <div class="step3">

    <!-- 1. Resumen de la venta -->
    <section class="card" aria-labelledby="v2-resumen-titulo">
      <h2 id="v2-resumen-titulo" class="card__title">Resumen de la venta</h2>
      <table class="resumen-table" role="table">
        <thead>
          <tr>
            <th class="rt__th">Identificación</th>
            <th class="rt__th">Descripción</th>
            <th class="rt__th rt__th--right">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="resumenVenta">
            <td class="rt__td">{{ resumenVenta.identificacion }}</td>
            <td class="rt__td">{{ resumenVenta.descripcion }}</td>
            <td class="rt__td rt__td--right">{{ formatMonto(resumenVenta.valor) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" />
            <td class="rt__total">Total: {{ resumenVenta ? formatMonto(resumenVenta.valor) : '$0.00' }}</td>
          </tr>
        </tfoot>
      </table>
    </section>

    <!-- 2. Cliente — apenas para Pago Parcial, claramente opcional -->
    <section v-if="tipoPago === 'parcial'" class="card" aria-labelledby="v2-cliente-titulo">
      <div class="card__head">
        <h2 id="v2-cliente-titulo" class="card__title mb-0">Cliente</h2>
        <span class="opt-badge">opcional</span>
      </div>
      <p class="card__hint">Si deseas asociar esta transacción a un cliente, completa los campos.</p>
      <div class="grid grid--2 mt-16">
        <div class="field">
          <label class="field__label" for="v2c-primer-nombre">
            Primer Nombre <span class="field__req" aria-hidden="true">*</span>
          </label>
          <input
            id="v2c-primer-nombre"
            v-model="formInicial.primerNombre"
            class="field__input"
            :class="{ 'field__input--error': clienteTouched.primerNombre && !formInicial.primerNombre.trim() }"
            type="text" autocomplete="given-name"
            :aria-invalid="clienteTouched.primerNombre && !formInicial.primerNombre.trim()"
            @blur="clienteTouched.primerNombre = true"
          />
          <p v-if="clienteTouched.primerNombre && !formInicial.primerNombre.trim()" class="field__error" role="alert">Campo obligatorio</p>
        </div>

        <div class="field">
          <label class="field__label" for="v2c-primer-apellido">
            Primer Apellido <span class="field__req" aria-hidden="true">*</span>
          </label>
          <input
            id="v2c-primer-apellido"
            v-model="formInicial.primerApellido"
            class="field__input"
            :class="{ 'field__input--error': clienteTouched.primerApellido && !formInicial.primerApellido.trim() }"
            type="text" autocomplete="family-name"
            :aria-invalid="clienteTouched.primerApellido && !formInicial.primerApellido.trim()"
            @blur="clienteTouched.primerApellido = true"
          />
          <p v-if="clienteTouched.primerApellido && !formInicial.primerApellido.trim()" class="field__error" role="alert">Campo obligatorio</p>
        </div>

        <div class="field">
          <label class="field__label" for="v2c-segundo-nombre">
            Segundo Nombre <span class="field__opt">(opcional)</span>
          </label>
          <input id="v2c-segundo-nombre" v-model="formInicial.segundoNombre" class="field__input" type="text" autocomplete="additional-name" />
        </div>

        <div class="field">
          <label class="field__label" for="v2c-segundo-apellido">
            Segundo Apellido <span class="field__opt">(opcional)</span>
          </label>
          <input id="v2c-segundo-apellido" v-model="formInicial.segundoApellido" class="field__input" type="text" />
        </div>
      </div>
    </section>

    <!-- 3. Forma de pago -->
    <section class="card" aria-labelledby="v2-forma-titulo">
      <h2 id="v2-forma-titulo" class="card__title">Forma de pago</h2>
      <fieldset class="forma-pago">
        <legend class="sr-only">Seleccione la forma de pago</legend>
        <label class="fpago" :class="{ 'fpago--selected': formaPagoFinal === 'efectivo' }">
          <input type="radio" name="v2-forma-pago" value="efectivo" class="sr-only" v-model="formaPagoFinal" />
          <span class="fpago__radio" aria-hidden="true"><span v-if="formaPagoFinal === 'efectivo'" class="fpago__radio-fill" /></span>
          <span class="fpago__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 9v6M18 9v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="fpago__body">
            <span class="fpago__title">Efectivo</span>
            <span class="fpago__desc">Cobrar en efectivo al cliente.</span>
          </span>
        </label>

        <label class="fpago" :class="{ 'fpago--selected': formaPagoFinal === 'tarjeta' }">
          <input type="radio" name="v2-forma-pago" value="tarjeta" class="sr-only" v-model="formaPagoFinal" />
          <span class="fpago__radio" aria-hidden="true"><span v-if="formaPagoFinal === 'tarjeta'" class="fpago__radio-fill" /></span>
          <span class="fpago__icon" :class="{ 'fpago__icon--active': formaPagoFinal === 'tarjeta' }" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 10h20" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 15h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="fpago__body">
            <span class="fpago__title">Tarjeta</span>
            <span class="fpago__desc">Realizar pago en TPV (Terminal punto de venta).</span>
          </span>
        </label>
      </fieldset>
    </section>

    <!-- 4. Comprobante -->
    <section class="card" aria-labelledby="v2-comprobante-titulo">
      <!-- Tarjeta: campos PRIMEIRO, confirmação DEPOIS -->
      <template v-if="formaPagoFinal === 'tarjeta'">
        <h2 id="v2-comprobante-titulo" class="card__title">Comprobante de tarjeta</h2>

        <div class="total-bar">
          <span class="total-bar__label">Total a pagar</span>
          <span class="total-bar__value">{{ resumenVenta ? formatMonto(resumenVenta.valor) : '$0.00' }}</span>
        </div>

        <!-- Campos da tarjeta ANTES do checkbox -->
        <div class="tarjeta-grid">
          <div class="field">
            <label class="field__label" for="v2-tipo-tarjeta">
              Tipo de Tarjeta <span class="field__req" aria-hidden="true">*</span>
            </label>
            <div class="field__select-wrap">
              <select id="v2-tipo-tarjeta" v-model="formTarjeta.tipo" class="field__select" :class="{ 'field__select--error': tipoError }" aria-required="true">
                <option value="" disabled>Seleccionar</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
              </select>
              <svg class="field__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <p v-if="tipoError" class="field__error" role="alert">{{ tipoError }}</p>
          </div>

          <div class="field">
            <label class="field__label" for="v2-marca-tarjeta">
              Marca <span class="field__req" aria-hidden="true">*</span>
            </label>
            <div class="field__select-wrap">
              <select id="v2-marca-tarjeta" v-model="formTarjeta.marca" class="field__select" :class="{ 'field__select--error': marcaError }" aria-required="true">
                <option value="" disabled>Seleccionar</option>
                <option value="mastercard">Mastercard</option>
                <option value="visa">Visa</option>
              </select>
              <svg class="field__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <p v-if="marcaError" class="field__error" role="alert">{{ marcaError }}</p>
          </div>

          <div class="field">
            <label class="field__label" for="v2-ultimos4">
              Últimos 4 dígitos <span class="field__req" aria-hidden="true">*</span>
            </label>
            <input
              id="v2-ultimos4" v-model="formTarjeta.ultimos4"
              class="field__input" :class="{ 'field__input--error': ultimos4Error }"
              type="text" inputmode="numeric" maxlength="4" placeholder="1234"
              aria-required="true"
              @input="formTarjeta.ultimos4 = formTarjeta.ultimos4.replace(/\D/g,'').slice(0,4)"
            />
            <p v-if="ultimos4Error" class="field__error" role="alert">{{ ultimos4Error }}</p>
          </div>

          <div class="field">
            <label class="field__label" for="v2-autorizacion">
              Autorización <span class="field__req" aria-hidden="true">*</span>
            </label>
            <input
              id="v2-autorizacion" v-model="formTarjeta.autorizacion"
              class="field__input" :class="{ 'field__input--error': autorizError }"
              type="text" placeholder="Cód. de autorización" aria-required="true"
            />
            <p v-if="autorizError" class="field__error" role="alert">{{ autorizError }}</p>
          </div>
        </div>

        <!-- Checkbox de confirmação DEPOIS dos campos -->
        <label class="confirm-check mt-20">
          <input type="checkbox" v-model="confirmacionPago" class="sr-only" />
          <span class="confirm-check__box" aria-hidden="true">
            <svg v-if="confirmacionPago" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="confirm-check__label">
            Confirmo que el cobro con <strong>tarjeta</strong> fue realizado exitosamente en la TPV.
          </span>
        </label>
      </template>

      <!-- Efectivo -->
      <template v-else>
        <h2 id="v2-comprobante-titulo" class="card__title">Pago en efectivo</h2>
        <div class="total-bar">
          <span class="total-bar__label">Total a pagar</span>
          <span class="total-bar__value">{{ resumenVenta ? formatMonto(resumenVenta.valor) : '$0.00' }}</span>
        </div>
        <label class="confirm-check mt-20">
          <input type="checkbox" v-model="confirmacionPago" class="sr-only" />
          <span class="confirm-check__box" aria-hidden="true">
            <svg v-if="confirmacionPago" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="confirm-check__label">
            Confirmo que el monto en efectivo fue recibido y el cliente está de acuerdo con la venta.
          </span>
        </label>
      </template>
    </section>

    <!-- Footer global -->
    <div class="step3-footer">
      <button class="btn btn--ghost" type="button" :disabled="isLoadingGuardar" @click="handleCancelar">Cancelar</button>
      <button class="btn btn--primary" type="button" :disabled="!canSubmit || isLoadingGuardar" @click="handleGuardar">
        <svg v-if="isLoadingGuardar" class="btn__spin" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" stroke-width="2.5"/>
          <path d="M12 3a9 9 0 0 1 9 9" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <template v-if="isLoadingGuardar">Procesando...</template>
        <template v-else>{{ formaPagoFinal === 'efectivo' ? 'Registrar Pago' : 'Guardar' }}</template>
      </button>
    </div>

    <!-- Dialog de confirmação de cancelamento -->
    <Teleport to="body">
      <div v-if="showCancelDialog" class="cancel-overlay" role="dialog" aria-modal="true" aria-labelledby="v2-cancel-title" @click.self="showCancelDialog = false">
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
              <h4 id="v2-cancel-title" class="cancel-dialog__title">Cancelar pago</h4>
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
.step3 { display: flex; flex-direction: column; gap: 16px; }

/* Card */
.card {
  background: var(--color-bg-card); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-card);
}
.card__title { font-size: 15px; font-weight: 600; font-family: var(--font-heading); color: var(--color-gray-900); margin-bottom: 16px; }
.card__title.mb-0 { margin-bottom: 0; }
.card__head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.card__hint { font-size: 13px; color: var(--color-text-secondary); margin-bottom: 0; }

/* Opt badge */
.opt-badge {
  font-size: 11px; font-weight: 500; padding: 2px 8px;
  border-radius: 20px; background: var(--color-gray-100); color: var(--color-text-secondary);
}

/* Resumen table */
.resumen-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.rt__th { font-size: 12px; font-weight: 600; color: var(--color-brand-500); padding: 8px 0; border-bottom: 1px solid var(--color-border); text-align: left; }
.rt__th--right { text-align: right; }
.rt__td { padding: 12px 0; border-bottom: 1px solid var(--color-border); }
.rt__td--right { text-align: right; }
.rt__total { text-align: right; font-size: 14px; font-weight: 700; padding-top: 12px; }

/* Grid e campos */
.grid { display: grid; gap: 16px; }
.grid--2 { grid-template-columns: 1fr 1fr; }
.mt-16 { margin-top: 16px; }
.mt-20 { margin-top: 20px; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field__label { font-size: 13px; font-weight: 500; color: var(--color-text-label); display: flex; align-items: center; gap: 4px; }
.field__req { color: var(--color-danger); }
.field__opt { font-size: 11px; font-weight: 400; color: var(--color-text-secondary); }
.field__input {
  height: 40px; padding: 0 12px;
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  font-size: 14px; color: var(--color-text-primary); background: #fff;
  outline: none; font-family: var(--font-body); width: 100%;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field__input:focus { border-color: var(--color-brand-500); box-shadow: 0 0 0 3px rgba(1,157,244,0.15); }
.field__input--error { border-color: #dc2626; }
.field__input--error:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.15); }
.field__error { font-size: 12px; color: #dc2626; }
.field__select-wrap { position: relative; }
.field__select {
  width: 100%; height: 40px; padding: 0 36px 0 12px;
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  font-size: 14px; color: var(--color-text-primary); background: #fff;
  appearance: none; outline: none; cursor: pointer; font-family: var(--font-body);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field__select:focus { border-color: var(--color-brand-500); box-shadow: 0 0 0 3px rgba(1,157,244,0.15); }
.field__select--error { border-color: #dc2626; }
.field__chevron { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }

/* Forma pago */
.forma-pago { border: none; padding: 0; display: flex; gap: 12px; }
.fpago {
  flex: 1; display: flex; align-items: center; gap: 12px;
  padding: 16px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
  cursor: pointer; background: #fff; transition: border-color 0.15s, background 0.15s;
}
.fpago:hover { border-color: var(--color-gray-400); }
.fpago--selected { border-color: var(--color-brand-500); background: var(--color-brand-light); }
.fpago__radio {
  width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--color-gray-300);
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s;
}
.fpago--selected .fpago__radio { border-color: var(--color-brand-500); }
.fpago__radio-fill { width: 9px; height: 9px; border-radius: 50%; background: var(--color-brand-500); }
.fpago__icon { color: var(--color-gray-400); flex-shrink: 0; transition: color 0.15s; }
.fpago__icon--active { color: var(--color-brand-500); }
.fpago__body { display: flex; flex-direction: column; gap: 2px; }
.fpago__title { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.fpago__desc { font-size: 12px; color: var(--color-text-secondary); }

/* Total bar */
.total-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; background: var(--color-gray-50);
  border-radius: var(--radius-md); border: 1px solid var(--color-border);
  margin-bottom: 20px;
}
.total-bar__label { font-size: 14px; color: var(--color-text-secondary); font-weight: 500; }
.total-bar__value { font-size: 18px; font-weight: 700; color: var(--color-text-primary); font-family: var(--font-heading); }

/* Tarjeta form grid */
.tarjeta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* Checkbox de confirmação */
.confirm-check {
  display: flex; align-items: flex-start; gap: 10px; cursor: pointer;
  padding: 14px 16px; border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border); background: #fffbf0;
  transition: border-color 0.15s;
}
.confirm-check:has(input:checked) { border-color: var(--color-brand-500); background: var(--color-brand-light); }
.confirm-check__box {
  width: 18px; height: 18px; flex-shrink: 0; border-radius: 4px; margin-top: 1px;
  border: 2px solid var(--color-gray-300); background: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}
.confirm-check:has(input:checked) .confirm-check__box { background: var(--color-brand-500); border-color: var(--color-brand-500); }
.confirm-check__label { font-size: 14px; color: var(--color-text-primary); line-height: 1.5; }

/* Footer */
.step3-footer {
  display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px;
}

/* Botões */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 40px; padding: 0 20px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 500; font-family: var(--font-body);
  cursor: pointer; border: none; transition: background 0.15s;
}
.btn--primary { background: var(--color-brand-500); color: #fff; }
.btn--primary:hover:not(:disabled) { background: var(--color-brand-700); }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--ghost { background: transparent; color: var(--color-text-primary); border: 1px solid var(--color-border); }
.btn--ghost:hover:not(:disabled) { background: var(--color-gray-50); }
.btn--ghost:disabled { opacity: 0.5; cursor: not-allowed; }
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

.btn__spin { animation: spin 0.75s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }
</style>
