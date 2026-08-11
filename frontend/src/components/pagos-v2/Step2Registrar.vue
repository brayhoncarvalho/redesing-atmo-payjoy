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
  <div class="step2-wrapper">

    <!-- Card 1: Resultado da venda — Pago Inicial -->
    <section v-if="tipoPago === 'inicial'" class="card" aria-labelledby="v2-resultado-titulo">
      <h2 id="v2-resultado-titulo" class="card__title">Resultado de la búsqueda</h2>
      <dl class="device-grid">
        <div class="device-item">
          <dt class="device-item__key">Cliente</dt>
          <dd class="device-item__value">{{ clienteNombre || '—' }}</dd>
        </div>
        <div class="device-item">
          <dt class="device-item__key">Voucher</dt>
          <dd class="device-item__value">{{ formInicial.voucher || '—' }}</dd>
        </div>
        <div class="device-item">
          <dt class="device-item__key">Descripción</dt>
          <dd class="device-item__value">{{ ventaDescripcion || '—' }}</dd>
        </div>
        <div class="device-item">
          <dt class="device-item__key">Valor total de la venta</dt>
          <dd class="device-item__value">{{ formatMonto(ventaTotal) }}</dd>
        </div>
      </dl>

      <div class="valor-inicial-box">
        <span class="valor-inicial-box__label">VALOR DEL PAGO INICIAL</span>
        <span class="valor-inicial-box__monto">{{ formatMonto(valorPagoInicial) }}</span>
      </div>

      <div class="card__footer">
        <button class="btn btn--ghost" type="button" @click="cancelar">Cancelar</button>
        <button class="btn btn--primary" type="button" @click="aceptarPago">Registrar Pago Inicial</button>
      </div>
    </section>

    <!-- Card 1b: Detalle del dispositivo — Pago Parcial -->
    <section v-else class="card" aria-labelledby="v2-dispositivo-titulo">
      <h2 id="v2-dispositivo-titulo" class="card__title">Detalle del dispositivo</h2>
      <dl class="device-grid">
        <div class="device-item">
          <dt class="device-item__key">DeviceTag</dt>
          <dd class="device-item__value">{{ dispositivo?.deviceTag ?? '—' }}</dd>
        </div>
        <div class="device-item">
          <dt class="device-item__key">IMEI</dt>
          <dd class="device-item__value">{{ dispositivo?.imei ?? '—' }}</dd>
        </div>
        <div class="device-item">
          <dt class="device-item__key">DN</dt>
          <dd class="device-item__value">{{ dispositivo?.dn ?? '—' }}</dd>
        </div>
        <div v-if="dispositivo?.modelo" class="device-item">
          <dt class="device-item__key">Modelo</dt>
          <dd class="device-item__value">{{ dispositivo.modelo }}</dd>
        </div>
      </dl>
    </section>

    <!-- Card 2: Opciones de pago — somente Pago Parcial -->
    <section v-if="tipoPago !== 'inicial'" class="card" aria-labelledby="v2-opciones-titulo">
      <h2 id="v2-opciones-titulo" class="card__title">Selecciona una opción de pago</h2>

      <fieldset class="opciones" aria-labelledby="v2-opciones-titulo">
        <legend class="sr-only">Opciones de pago disponibles</legend>

        <label
          v-for="opcion in opcionesPago"
          :key="opcion.id"
          class="opcion"
          :class="{ 'opcion--selected': opcionSeleccionada === opcion.id }"
        >
          <input
            type="radio"
            class="sr-only"
            name="v2-opcion-pago"
            :value="opcion.id"
            :checked="opcionSeleccionada === opcion.id"
            @change="seleccionarOpcion(opcion.id)"
          />
          <!-- Radio visual -->
          <span class="opcion__radio" aria-hidden="true">
            <span v-if="opcionSeleccionada === opcion.id" class="opcion__radio-fill" />
          </span>

          <!-- Conteúdo -->
          <span class="opcion__content">
            <span class="opcion__title">{{ opcion.label }}</span>
            <span v-if="opcion.description" class="opcion__description">{{ opcion.description }}</span>
          </span>

          <!-- Monto em destaque -->
          <span class="opcion__monto" :class="{ 'opcion__monto--selected': opcionSeleccionada === opcion.id }">
            {{ formatMonto(opcion.monto) }}
          </span>
        </label>
      </fieldset>

      <div class="card__footer">
        <button class="btn btn--ghost" type="button" @click="volverStep">Volver</button>
        <button class="btn btn--primary" type="button" :disabled="!opcionSeleccionada" @click="aceptarPago">
          Aceptar
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.step2-wrapper { display: flex; flex-direction: column; gap: 16px; }

.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}
.card__title {
  font-size: 15px; font-weight: 600; font-family: var(--font-heading);
  color: var(--color-gray-900); margin-bottom: 18px;
}
.card__footer {
  display: flex; justify-content: flex-end; gap: 10px;
  margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--color-border);
}

/* Device info */
.device-grid { display: flex; gap: 40px; flex-wrap: wrap; }
.device-item { display: flex; flex-direction: column; gap: 3px; }
.device-item__key {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--color-text-secondary);
}
.device-item__value { font-size: 15px; font-weight: 600; color: var(--color-text-primary); font-family: var(--font-body); }

.valor-inicial-box {
  background: var(--color-brand-light, #e0f3fe);
  border: 1px solid var(--color-brand, #019df4);
  border-radius: var(--radius-md, 8px);
  padding: 16px 20px;
  display: flex; flex-direction: column; gap: 6px;
  margin: 8px 0;
}
.valor-inicial-box__label {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--color-brand, #019df4);
}
.valor-inicial-box__monto {
  font-size: 28px; font-weight: 700; color: var(--color-text-primary, #212529);
}

/* Opciones */
.opciones { border: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }

.opcion {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  background: #fff;
}
.opcion:hover { border-color: var(--color-gray-400); }
.opcion--selected {
  border-color: var(--color-brand-500);
  background: var(--color-brand-light);
  box-shadow: 0 0 0 3px rgba(1,157,244,0.10);
}

.opcion__radio {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid var(--color-gray-300); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s;
}
.opcion--selected .opcion__radio { border-color: var(--color-brand-500); }
.opcion__radio-fill { width: 9px; height: 9px; border-radius: 50%; background: var(--color-brand-500); }

.opcion__content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.opcion__title { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.opcion__description { font-size: 12px; color: var(--color-text-secondary, #6b7280); margin-top: 2px; }
.opcion__meta { display: flex; align-items: center; gap: 6px; }

/* Badges de atraso */
.badge {
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 20px;
  font-size: 11px; font-weight: 600;
}
.badge--ok     { background: #dcfce7; color: #15803d; }
.badge--warn   { background: #fef9c3; color: #a16207; }
.badge--danger { background: #fee2e2; color: #b91c1c; }

.opcion__monto {
  font-size: 16px; font-weight: 700; color: var(--color-text-secondary);
  white-space: nowrap; transition: color 0.15s;
}
.opcion__monto--selected { color: var(--color-brand-500); }

/* Botões */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 40px; padding: 0 20px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 500; font-family: var(--font-body);
  cursor: pointer; border: none; transition: background 0.15s;
}
.btn--primary { background: var(--color-brand-500); color: #fff; }
.btn--primary:hover:not(:disabled) { background: var(--color-brand-700); }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--ghost { background: transparent; color: var(--color-text-primary); border: 1px solid var(--color-border); }
.btn--ghost:hover { background: var(--color-gray-50); }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }
</style>
