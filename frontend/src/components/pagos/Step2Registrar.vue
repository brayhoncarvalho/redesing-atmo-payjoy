<script setup lang="ts">
import { computed } from 'vue'
import { usePagosPayjoy } from '@/composables/usePagosPayjoy'

const {
  tipoPago,
  formInicial,
  ventaDescripcion,
  ventaTotal,
  valorPagoInicial,
  dispositivo,
  opcionesPago,
  opcionSeleccionada,
  seleccionarOpcion,
  aceptarPago,
  volverStep,
  cancelar,
} = usePagosPayjoy()

const clienteNombre = computed(() => {
  const p = formInicial
  return [p.primerNombre, p.segundoNombre, p.primerApellido, p.segundoApellido]
    .filter(Boolean).join(' ')
})

function formatMonto(value: number) {
  return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>

<template>
  <!-- ── Pago Inicial: resumo + valor inicial ── -->
  <section v-if="tipoPago === 'inicial'" class="step-card" aria-labelledby="detalle-titulo">
    <h2 id="detalle-titulo" class="step-card__section-title">Resultado de la búsqueda</h2>
    <dl class="device-info">
      <div class="device-info__item">
        <dt class="device-info__key">CLIENTE</dt>
        <dd class="device-info__value">{{ clienteNombre || '—' }}</dd>
      </div>
      <div class="device-info__item">
        <dt class="device-info__key">VOUCHER</dt>
        <dd class="device-info__value">{{ formInicial.voucher || '—' }}</dd>
      </div>
      <div class="device-info__item">
        <dt class="device-info__key">DESCRIPCIÓN</dt>
        <dd class="device-info__value">{{ ventaDescripcion || '—' }}</dd>
      </div>
      <div class="device-info__item">
        <dt class="device-info__key">VALOR TOTAL DE LA VENTA</dt>
        <dd class="device-info__value">{{ formatMonto(ventaTotal) }}</dd>
      </div>
    </dl>

    <div class="valor-inicial-box">
      <span class="valor-inicial-box__label">VALOR DEL PAGO INICIAL</span>
      <span class="valor-inicial-box__monto">{{ formatMonto(valorPagoInicial) }}</span>
    </div>

    <div class="step-card__footer">
      <button class="btn btn--ghost" type="button" @click="cancelar">Cancelar</button>
      <button class="btn btn--primary" type="button" @click="aceptarPago">Registrar Pago Inicial</button>
    </div>
  </section>

  <!-- ── Pago Parcial: detalle dispositivo + opciones ── -->
  <template v-else>
    <div class="step-cards-stack">
    <section class="step-card" aria-labelledby="detalle-titulo">
      <h2 id="detalle-titulo" class="step-card__section-title">Detalle del dispositivo</h2>
      <dl class="device-info">
        <div class="device-info__item">
          <dt class="device-info__key">DEVICETAG</dt>
          <dd class="device-info__value">{{ dispositivo?.deviceTag ?? '—' }}</dd>
        </div>
        <div class="device-info__item">
          <dt class="device-info__key">IMEI</dt>
          <dd class="device-info__value">{{ dispositivo?.imei ?? '—' }}</dd>
        </div>
        <div class="device-info__item">
          <dt class="device-info__key">DN</dt>
          <dd class="device-info__value">{{ dispositivo?.dn ?? '—' }}</dd>
        </div>
      </dl>
    </section>

    <section class="step-card" aria-labelledby="opciones-titulo">
      <div class="opciones-pago">
        <fieldset class="opciones-pago__fieldset">
          <legend class="opciones-pago__label" id="opciones-titulo">Seleccioná una opción de pago</legend>
          <label
            v-for="opcion in opcionesPago"
            :key="opcion.id"
            class="opcion-row"
            :class="{ 'opcion-row--selected': opcionSeleccionada === opcion.id }"
          >
            <input type="radio" class="opcion-row__input" name="opcion-pago"
              :value="opcion.id" :checked="opcionSeleccionada === opcion.id"
              @change="seleccionarOpcion(opcion.id)" />
            <span class="opcion-row__dot" aria-hidden="true">
              <span v-if="opcionSeleccionada === opcion.id" class="opcion-row__dot-fill" />
            </span>
            <span class="opcion-row__content">
              <span class="opcion-row__title">{{ opcion.label }}</span>
              <span class="opcion-row__desc">{{ opcion.description }}</span>
            </span>
            <span class="opcion-row__monto">{{ formatMonto(opcion.monto) }}</span>
          </label>
        </fieldset>
      </div>
      <div class="step-card__footer">
        <button class="btn btn--ghost" type="button" @click="volverStep">Volver</button>
        <button class="btn btn--primary" type="button" :disabled="!opcionSeleccionada" @click="aceptarPago">Aceptar</button>
      </div>
    </section>
    </div>
  </template>
</template>

<style scoped>
.step-cards-stack {
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

.device-info {
  display: flex;
  gap: 48px;
  margin-bottom: 20px;
}

.device-info__item { display: flex; flex-direction: column; gap: 4px; }

.device-info__key {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.device-info__value {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.valor-inicial-box {
  background: var(--color-brand-light, #e0f3fe);
  border: 1px solid var(--color-brand, #019df4);
  border-radius: var(--radius-md, 8px);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}
.valor-inicial-box__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-brand, #019df4);
}
.valor-inicial-box__monto {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary, #212529);
}

.opciones-pago__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-label);
  margin-bottom: 12px;
  display: block;
  border: none;
  padding: 0;
}

.opciones-pago__fieldset {
  border: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opcion-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  background: #fff;
}

.opcion-row:hover { border-color: var(--color-gray-300); }

.opcion-row--selected {
  border-color: var(--color-brand);
  background: var(--color-brand-light);
}

.opcion-row__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.opcion-row__dot {
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

.opcion-row--selected .opcion-row__dot { border-color: var(--color-brand); }

.opcion-row__dot-fill {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-brand);
}

.opcion-row__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.opcion-row__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.opcion-row__desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.opcion-row__monto {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
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
  transition: background 0.15s;
  font-family: var(--font-sans);
}

.btn--primary {
  background: var(--color-brand);
  color: #fff;
}
.btn--primary:hover:not(:disabled) { background: var(--color-brand-hover); }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn--ghost {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
.btn--ghost:hover { background: var(--color-gray-50); }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border-width: 0;
}
</style>
