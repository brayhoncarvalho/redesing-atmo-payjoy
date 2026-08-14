<script setup lang="ts">
import { ref, computed } from 'vue'
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
  cancelar,
} = usePagosPayjoy()

const showCancelDialog = ref(false)

function confirmarCancelamento() {
  showCancelDialog.value = false
  cancelar()
}

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
        <button class="btn btn--ghost" type="button" @click="showCancelDialog = true">Cancelar</button>
        <button class="btn btn--primary" type="button" :disabled="!opcionSeleccionada" @click="aceptarPago">Aceptar</button>
      </div>
    </section>
    </div>
  </template>

  <!-- Dialog de confirmação de cancelamento -->
  <Teleport to="body">
    <div v-if="showCancelDialog" class="cancel-overlay" role="dialog" aria-modal="true" aria-labelledby="cancel-title" @click.self="showCancelDialog = false">
      <div class="cancel-dialog">
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

.cancel-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
}
.cancel-dialog {
  background: #fff; border-radius: 12px; width: 420px; max-width: 90vw;
  padding: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.cancel-dialog__body { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
.cancel-dialog__icon { flex-shrink: 0; margin-top: 2px; }
.cancel-dialog__title { font-size: 15px; font-weight: 600; color: var(--color-gray-900, #111827); margin: 0 0 6px; }
.cancel-dialog__text { font-size: 14px; color: var(--color-gray-700, #374151); margin: 0 0 4px; }
.cancel-dialog__warn { font-size: 13px; color: #dc2626; margin: 0; }
.cancel-dialog__actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn--danger { background: #dc2626; color: #fff; border: none; }
.btn--danger:hover { background: #b91c1c; }

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
