<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import RadioCard from '@/components/pagos/RadioCard.vue'
import { usePagosPayjoy } from '@/composables/usePagosPayjoy'
import { schemaStep1Inicial, schemaStep1Parcial } from '@/utils/validationSchemas'

const {
  tipoPago,
  formInicial,
  formParcial,
  buscarVenta,
  volverStep,
  isLoadingBuscar,
  currentStep,
} = usePagosPayjoy()

const tipoCobroOptions = [
  { value: 'financiamiento', label: 'Pago del financiamiento' },
  { value: 'otro', label: 'Otro cobro' },
]

const buscarPorOptions = [
  { value: 'DN', label: 'DN' },
  { value: 'DeviceTag', label: 'DeviceTag' },
  { value: 'IMEI', label: 'IMEI' },
]

// ── Schema dinâmico: muda conforme tipoPago ───────────────────────────────────
const validationSchema = computed(() =>
  tipoPago.value === 'inicial'
    ? toTypedSchema(schemaStep1Inicial)
    : toTypedSchema(schemaStep1Parcial)
)

const { errors, validate } = useForm({ validationSchema })

// ── Campos: Pago Inicial ──────────────────────────────────────────────────────
const { value: voucherValue,       handleBlur: blurVoucher  } = useField<string>('voucher')
const { value: primerNombreValue,  handleBlur: blurNombre   } = useField<string>('primerNombre')
const { value: segundoNombreValue                           } = useField<string>('segundoNombre')
const { value: primerApellidoValue, handleBlur: blurApellido } = useField<string>('primerApellido')
const { value: segundoApellidoValue                         } = useField<string>('segundoApellido')

// ── Campos: Pago Parcial ──────────────────────────────────────────────────────
const { value: tipoCobroValue    } = useField<string>('tipoCobro')
const { value: buscarPorValue    } = useField<string>('buscarPor')
const { value: valorBusquedaValue } = useField<string>('valorBusqueda')

// ── Sync vee-validate → composable ───────────────────────────────────────────
watch(voucherValue,        v => { formInicial.voucher          = (v ?? '').replace(/\D/g, '').slice(0, 6) })
watch(primerNombreValue,   v => { formInicial.primerNombre     = v ?? '' })
watch(segundoNombreValue,  v => { formInicial.segundoNombre    = v ?? '' })
watch(primerApellidoValue, v => { formInicial.primerApellido   = v ?? '' })
watch(segundoApellidoValue,v => { formInicial.segundoApellido  = v ?? '' })
watch(tipoCobroValue,      v => { formParcial.tipoCobro        = v ?? '' })
watch(buscarPorValue,      v => { formParcial.buscarPor        = v ?? '' })
watch(valorBusquedaValue,  v => { formParcial.valorBusqueda    = v ?? '' })

function onVoucherInput(e: Event) {
  voucherValue.value = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6)
}

// ── Errors expostos para o template ──────────────────────────────────────────
const voucherError    = computed(() => errors.value.voucher       ?? '')
const nombreError     = computed(() => errors.value.primerNombre  ?? '')
const apellidoError   = computed(() => errors.value.primerApellido ?? '')
const tipoCobroError  = computed(() => errors.value.tipoCobro     ?? '')
const buscarPorError  = computed(() => errors.value.buscarPor     ?? '')
const valorError      = computed(() => errors.value.valorBusqueda ?? '')

// ── handleBuscar ──────────────────────────────────────────────────────────────
async function handleBuscar() {
  const { valid } = await validate()
  if (!valid) return
  buscarVenta()
}

const buscarDisabled = computed(() => isLoadingBuscar.value)
</script>

<template>
  <section class="step-card" aria-labelledby="seccion-busqueda">
    <h2 id="seccion-busqueda" class="step-card__section-title">Búsqueda de la venta</h2>

    <!-- Tipo de pago -->
    <fieldset class="tipo-pago__fieldset">
      <legend class="tipo-pago__legend">Tipo de pago</legend>
      <div class="tipo-pago__options">
        <RadioCard
          value="inicial"
          title="Pago Inicial"
          description="Registrar el pago inicial de una venta nueva."
          v-model="tipoPago"
        />
        <RadioCard
          value="parcial"
          title="Pago Parcial"
          description="Abonar cuotas a un financiamiento existente."
          v-model="tipoPago"
        />
      </div>
    </fieldset>

    <!-- Formulário: Pago Inicial -->
    <template v-if="tipoPago === 'inicial'">
      <div class="voucher-row">
        <div class="form-field form-field--voucher">
          <label class="form-field__label" for="voucher">
            Voucher <span class="form-field__required" aria-hidden="true">*</span>
          </label>
          <input
            id="voucher"
            :value="formInicial.voucher"
            class="form-field__input"
            :class="{ 'form-field__input--error': voucherError }"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000123"
            required
            autocomplete="off"
            :aria-invalid="!!voucherError"
            aria-describedby="voucher-error"
            @input="onVoucherInput"
            @blur="blurVoucher"
          />
          <p v-if="voucherError" id="voucher-error" class="form-field__error" role="alert">{{ voucherError }}</p>
        </div>
      </div>

      <div class="form-grid form-grid--2">
        <div class="form-field">
          <label class="form-field__label" for="primer-nombre">
            Primer Nombre <span class="form-field__required" aria-hidden="true">*</span>
          </label>
          <input
            id="primer-nombre"
            v-model="primerNombreValue"
            class="form-field__input"
            :class="{ 'form-field__input--error': nombreError }"
            type="text"
            required
            autocomplete="given-name"
            :aria-invalid="!!nombreError"
            aria-describedby="primer-nombre-error"
            @blur="blurNombre"
          />
          <p v-if="nombreError" id="primer-nombre-error" class="form-field__error" role="alert">{{ nombreError }}</p>
        </div>

        <div class="form-field">
          <label class="form-field__label" for="primer-apellido">
            Primer Apellido <span class="form-field__required" aria-hidden="true">*</span>
          </label>
          <input
            id="primer-apellido"
            v-model="primerApellidoValue"
            class="form-field__input"
            :class="{ 'form-field__input--error': apellidoError }"
            type="text"
            required
            autocomplete="family-name"
            :aria-invalid="!!apellidoError"
            aria-describedby="primer-apellido-error"
            @blur="blurApellido"
          />
          <p v-if="apellidoError" id="primer-apellido-error" class="form-field__error" role="alert">{{ apellidoError }}</p>
        </div>

        <div class="form-field">
          <label class="form-field__label" for="segundo-nombre">Segundo Nombre</label>
          <input
            id="segundo-nombre"
            v-model="segundoNombreValue"
            class="form-field__input"
            type="text"
            autocomplete="additional-name"
          />
        </div>

        <div class="form-field">
          <label class="form-field__label" for="segundo-apellido">Segundo Apellido</label>
          <input
            id="segundo-apellido"
            v-model="segundoApellidoValue"
            class="form-field__input"
            type="text"
          />
        </div>
      </div>
    </template>

    <!-- Formulário: Pago Parcial -->
    <template v-else>
      <div class="form-grid form-grid--3">
        <div class="form-field">
          <label class="form-field__label" for="tipo-cobro">
            Tipo de cobro <span class="form-field__required" aria-hidden="true">*</span>
          </label>
          <div class="form-field__select-wrap">
            <select
              id="tipo-cobro"
              v-model="tipoCobroValue"
              class="form-field__select"
              :class="{ 'form-field__select--error': tipoCobroError }"
              :aria-invalid="!!tipoCobroError"
              required
            >
              <option value="" disabled>Seleccione una opción</option>
              <option
                v-for="opt in tipoCobroOptions"
                :key="opt.value"
                :value="opt.value"
              >{{ opt.label }}</option>
            </select>
            <span class="form-field__select-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
          <p v-if="tipoCobroError" class="form-field__error" role="alert">{{ tipoCobroError }}</p>
        </div>

        <div class="form-field">
          <label class="form-field__label" for="buscar-por">
            Buscar por <span class="form-field__required" aria-hidden="true">*</span>
          </label>
          <div class="form-field__select-wrap">
            <select
              id="buscar-por"
              v-model="buscarPorValue"
              class="form-field__select"
              :class="{ 'form-field__select--error': buscarPorError }"
              :aria-invalid="!!buscarPorError"
              required
            >
              <option value="" disabled>Seleccione una opción</option>
              <option
                v-for="opt in buscarPorOptions"
                :key="opt.value"
                :value="opt.value"
              >{{ opt.label }}</option>
            </select>
            <span class="form-field__select-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
          <p v-if="buscarPorError" class="form-field__error" role="alert">{{ buscarPorError }}</p>
        </div>

        <div class="form-field">
          <label class="form-field__label" for="valor-busqueda">
            Valor de búsqueda <span class="form-field__required" aria-hidden="true">*</span>
          </label>
          <div class="form-field__input-icon-wrap">
            <span class="form-field__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="#9ca3af" stroke-width="1.5"/>
                <path d="M10.5 10.5L13.5 13.5" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <input
              id="valor-busqueda"
              v-model="valorBusquedaValue"
              class="form-field__input form-field__input--has-icon"
              :class="{ 'form-field__input--error': valorError }"
              type="text"
              placeholder="Introduce el DN, DeviceTag o IMEI"
              required
              autocomplete="off"
              :aria-invalid="!!valorError"
            />
          </div>
          <p v-if="valorError" class="form-field__error" role="alert">{{ valorError }}</p>
        </div>
      </div>
    </template>

    <!-- Footer de ações -->
    <div class="step-card__footer">
      <button
        v-if="currentStep > 1"
        class="btn btn--ghost"
        type="button"
        @click="volverStep"
      >Volver</button>
      <button
        class="btn btn--primary"
        type="button"
        :disabled="buscarDisabled || isLoadingBuscar"
        @click="handleBuscar"
      >{{ isLoadingBuscar ? 'Buscando...' : 'Buscar' }}</button>
    </div>
  </section>
</template>

<style scoped>
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

.tipo-pago__fieldset {
  border: none;
  padding: 0;
  margin-bottom: 24px;
}

.tipo-pago__legend {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-label);
  margin-bottom: 10px;
  display: block;
}

.tipo-pago__options {
  display: flex;
  gap: 12px;
}

.voucher-row {
  margin-bottom: 16px;
}

.form-field--voucher {
  max-width: 240px;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form-grid--2 { grid-template-columns: 1fr 1fr; }
.form-grid--3 { grid-template-columns: 1fr 1fr 1fr; }

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-label);
}

.form-field__required { color: var(--color-danger); margin-left: 1px; }

.form-field__input {
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-primary);
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: var(--font-sans);
  width: 100%;
}

.form-field__input:focus {
  border-color: var(--color-brand-500);
  box-shadow: 0 0 0 3px rgba(1, 157, 244, 0.15);
}

.form-field__input--error {
  border-color: #dc2626;
}

.form-field__input--error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

.form-field__error {
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-field__select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.form-field__select {
  width: 100%;
  height: 38px;
  padding: 0 36px 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-primary);
  background: #fff;
  appearance: none;
  outline: none;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-field__select:focus {
  border-color: var(--color-brand-500);
  box-shadow: 0 0 0 3px rgba(1, 157, 244, 0.15);
}

.form-field__select--error {
  border-color: #dc2626;
}

.form-field__select--error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

.form-field__select-arrow {
  position: absolute;
  right: 10px;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.form-field__input-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.form-field__icon {
  position: absolute;
  left: 10px;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.form-field__input--has-icon {
  padding-left: 32px;
}

.step-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.btn {
  height: 36px;
  padding: 0 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s, box-shadow 0.15s;
  font-family: var(--font-sans);
}

.btn--primary {
  background: var(--color-brand-500);
  color: #fff;
}

.btn--primary:hover { background: var(--color-brand-700); }

.btn--ghost {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn--ghost:hover { background: var(--color-gray-50); }
</style>
