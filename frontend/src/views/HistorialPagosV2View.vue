<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import {
  type HistorialPagoRecord,
  HISTORIAL_PAGOS_TEXT,
  ESTADO_OPTIONS,
  PASO_FLUJO_OPTIONS,
  TIENDAS_OPTIONS,
} from '@/constants/historialPagos'
import { useToastUtils } from '@/composables/useToast'

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_ROWS: HistorialPagoRecord[] = [
  {
    id: '1', numeroAutorizacion: '533235', voucher: '837291', deviceTag: 'DTCSXTS',
    imei: '356938035643809', dn: 'DN-445566', idTransaccion: '879629057', idRed: 'AXC30318',
    fechaCreacion: '2026-08-11 08:14', fechaPago: '2026-08-11 08:14', monto: '$50.00',
    servicio: 'Telcel', estado: 'concluido', pasoFlujo: 'Concluído',
    canal: 'multipagos', tienda: 'CAC GALERIAS DEL VALLE', usuario: 'camila.graciano',
    produto: 'Recarga $50', idDelPago: 'pay_1_49473134', tipoPago: 'Pago Total', formaPago: 'Efectivo', referencia: 'REF20260811001',
    total: 50, storeName: 'CAC GALERIAS DEL VALLE', storePdvId: '21010002',
  },
  {
    id: '2', numeroAutorizacion: '541087', voucher: '418052', deviceTag: 'DTKQMLP',
    imei: '351938047781204', dn: 'DN-112233', idTransaccion: '880014722', idRed: 'AXC30319',
    fechaCreacion: '2026-08-11 09:32', fechaPago: '2026-08-11 09:32', monto: '$1,499.00',
    servicio: 'Movistar', estado: 'concluido', pasoFlujo: 'Concluído',
    canal: 'multipagos', tienda: 'CAC GALERIAS DEL VALLE', usuario: 'camila.graciano',
    produto: 'Equipo Samsung A15', idDelPago: 'pay_1_49481220', tipoPago: 'Pago Total', formaPago: 'Tarjeta', referencia: 'REF20260811002',
    total: 1499, storeName: 'CAC GALERIAS DEL VALLE', storePdvId: '21010002',
  },
  {
    id: '3', numeroAutorizacion: '542900', voucher: '902644', deviceTag: 'DTRWZBN',
    imei: '358213099114507', dn: 'DN-778899', idTransaccion: '880201345', idRed: 'AXC30320',
    fechaCreacion: '2026-08-11 10:55', fechaPago: '', monto: '$249.00',
    servicio: 'AT&T', estado: 'rechazado', pasoFlujo: 'Error Catalina',
    canal: 'multipagos', tienda: 'CAC PERISUR', usuario: 'luis.mendez',
    produto: 'Recarga $249', idDelPago: 'pay_1_49490011', tipoPago: 'Pago Parcial', formaPago: 'Efectivo', referencia: 'REF20260811003',
    total: 249, storeName: 'CAC PERISUR', storePdvId: '21010009',
  },
  {
    id: '4', numeroAutorizacion: '543512', voucher: '563117', deviceTag: 'DTPLNVA',
    imei: '354772011903668', dn: 'DN-334455', idTransaccion: '880389102', idRed: 'AXC30321',
    fechaCreacion: '2026-08-11 11:40', fechaPago: '', monto: '$498.00',
    servicio: 'Telcel', estado: 'en-progreso', pasoFlujo: 'Gesto Pago',
    canal: 'multipagos', tienda: 'CAC PERISUR', usuario: 'luis.mendez',
    produto: 'Recarga $498', idDelPago: 'pay_1_49502233', tipoPago: 'Pago Total', formaPago: 'Tarjeta', referencia: 'REF20260811004',
    total: 498, storeName: 'CAC PERISUR', storePdvId: '21010009',
  },
  {
    id: '5', numeroAutorizacion: '544001', voucher: '230985', deviceTag: 'DTHGSKQ',
    imei: '359001478223190', dn: 'DN-556677', idTransaccion: '880477891', idRed: 'AXC30322',
    fechaCreacion: '2026-08-11 13:15', fechaPago: '', monto: '$3,742.50',
    servicio: 'Movistar', estado: 'registrando', pasoFlujo: 'Liga Generada',
    canal: 'multipagos', tienda: 'CAC TORREON', usuario: 'ana.ruiz',
    produto: 'Equipo iPhone 14', idDelPago: 'pay_1_49511445', tipoPago: 'Pago Total', formaPago: 'Efectivo', referencia: 'REF20260811005',
    total: 3742.50, storeName: 'CAC TORREON', storePdvId: '99030005',
  },
  {
    id: '6', numeroAutorizacion: '520188', voucher: '774310', deviceTag: 'DTMWQXR',
    imei: '352998001547720', dn: 'DN-889900', idTransaccion: '879001234', idRed: 'AXC30290',
    fechaCreacion: '2026-08-10 08:22', fechaPago: '2026-08-10 08:23', monto: '$1,499.00',
    servicio: 'Telcel', estado: 'concluido', pasoFlujo: 'Concluído',
    canal: 'multipagos', tienda: 'CAC GALERIAS DEL VALLE', usuario: 'ana.ruiz',
    produto: 'Equipo Moto G84', idDelPago: 'pay_1_49398801', tipoPago: 'Pago Total', formaPago: 'Tarjeta', referencia: 'REF20260810001',
    total: 1499, storeName: 'CAC GALERIAS DEL VALLE', storePdvId: '21010002',
  },
  {
    id: '7', numeroAutorizacion: '520477', voucher: '119476', deviceTag: 'DTZCVBM',
    imei: '353110229948871', dn: 'DN-001122', idTransaccion: '879112099', idRed: 'AXC30291',
    fechaCreacion: '2026-08-10 10:07', fechaPago: '', monto: '$249.00',
    servicio: 'AT&T', estado: 'expirado', pasoFlujo: 'Pendiente Catalina',
    canal: 'multipagos', tienda: 'CAC TAPACHULA', usuario: 'camila.graciano',
    produto: 'Recarga $249', idDelPago: 'pay_1_49410077', tipoPago: 'Pago Parcial', formaPago: 'Efectivo', referencia: 'REF20260810002',
    total: 249, storeName: 'CAC TAPACHULA', storePdvId: '21050015',
  },
  {
    id: '8', numeroAutorizacion: '521390', voucher: '651042', deviceTag: 'DTXHNPQ',
    imei: '357441098234561', dn: 'DN-223344', idTransaccion: '879300567', idRed: 'AXC30292',
    fechaCreacion: '2026-08-10 14:50', fechaPago: '2026-08-10 14:51', monto: '$998.00',
    servicio: 'Movistar', estado: 'cancelado', pasoFlujo: 'Confirmación',
    canal: 'multipagos', tienda: 'CAC PERISUR', usuario: 'luis.mendez',
    produto: 'Equipo Redmi 13C', idDelPago: 'pay_1_49425566', tipoPago: 'Pago Total', formaPago: 'Tarjeta', referencia: 'REF20260810003',
    total: 998, storeName: 'CAC PERISUR', storePdvId: '21010009',
  },
]

const ESTADO_META: Record<string, { label: string; color: string; dot: string }> = {
  cancelado:     { label: 'Cancelado',    color: '#6b7280', dot: '#9ca3af' },
  concluido:     { label: 'Concluido',    color: '#16a34a', dot: '#22c55e' },
  rechazado:     { label: 'Rechazado',    color: '#dc2626', dot: '#ef4444' },
  'en-progreso': { label: 'En progreso',  color: '#2196f3', dot: '#60a5fa' },
  registrando:   { label: 'Registrando',  color: '#d97706', dot: '#f59e0b' },
  expirado:      { label: 'Expirado',     color: '#9ca3af', dot: '#d1d5db' },
}

// ── Filter state ───────────────────────────────────────────────────────────
const filterFechaInicio    = ref('2026-08-01')
const filterFechaFin       = ref('2026-08-11')
const filterEstados        = ref<string[]>([])
const filterPasosFlujo     = ref<string[]>([])
const filterNumAutorizacion = ref('')
const filterTienda         = ref('')
const filterUsuario        = ref('')
const filterCanal          = ref('')
const filterBuscarPorTipo  = ref('')
const filterBuscarPorValor = ref('')
const showMoreFilters      = ref(false)

const CANAL_OPTIONS = [
  { value: 'multipagos',       label: 'Multipagos' },
  { value: 'payjoy-iniciales', label: 'PayJoy Iniciales' },
  { value: 'payjoy-semanales', label: 'PayJoy Semanales' },
]

const BUSCAR_POR_OPTIONS = [
  { value: 'numeroAutorizacion', label: 'Número de autorización' },
  { value: 'voucher',            label: 'Voucher' },
  { value: 'deviceTag',         label: 'DeviceTag' },
  { value: 'imei',               label: 'IMEI' },
  { value: 'dn',                 label: 'DN' },
]

const showEstadoMenu  = ref(false)
const showPasoMenu    = ref(false)
const showTiendaMenu  = ref(false)
const showCanalMenu   = ref(false)
const estadoSearch    = ref('')
const pasoSearch      = ref('')

const filteredEstadoOptions = computed(() =>
  ESTADO_OPTIONS.filter(o => o.label.toLowerCase().includes(estadoSearch.value.toLowerCase()))
)
const filteredPasoOptions = computed(() =>
  PASO_FLUJO_OPTIONS.filter(o => o.label.toLowerCase().includes(pasoSearch.value.toLowerCase()))
)
const filteredTiendaOptions = computed(() =>
  TIENDAS_OPTIONS.filter(o => o.label.toLowerCase().includes(filterTienda.value.toLowerCase()))
)

function toggleEstado(value: string) {
  const idx = filterEstados.value.indexOf(value)
  if (idx === -1) filterEstados.value.push(value)
  else filterEstados.value.splice(idx, 1)
}
function toggleAllEstados(checked: boolean) {
  filterEstados.value = checked ? ESTADO_OPTIONS.map(o => o.value) : []
}
function togglePaso(value: string) {
  const idx = filterPasosFlujo.value.indexOf(value)
  if (idx === -1) filterPasosFlujo.value.push(value)
  else filterPasosFlujo.value.splice(idx, 1)
}
function toggleAllPasos(checked: boolean) {
  filterPasosFlujo.value = checked ? PASO_FLUJO_OPTIONS.map(o => o.value) : []
}
function estadoLabel() {
  if (!filterEstados.value.length) return 'Seleccione el estado'
  if (filterEstados.value.length === 1)
    return ESTADO_OPTIONS.find(o => o.value === filterEstados.value[0])?.label ?? ''
  return `${filterEstados.value.length} seleccionados`
}
function pasoLabel() {
  if (!filterPasosFlujo.value.length) return 'Seleccione el paso en flujo'
  if (filterPasosFlujo.value.length === 1)
    return PASO_FLUJO_OPTIONS.find(o => o.value === filterPasosFlujo.value[0])?.label ?? ''
  return `${filterPasosFlujo.value.length} seleccionados`
}
function selectTienda(label: string) {
  filterTienda.value = label; showTiendaMenu.value = false
}

function clearFilters() {
  filterFechaInicio.value = '2026-08-01'
  filterFechaFin.value = '2026-08-11'
  filterEstados.value = []
  filterPasosFlujo.value = []
  filterNumAutorizacion.value = ''
  filterTienda.value = ''
  filterUsuario.value = ''
  filterCanal.value = ''
  filterBuscarPorTipo.value = ''
  filterBuscarPorValor.value = ''
  estadoSearch.value = ''
  pasoSearch.value = ''
}

// ── Filtering ──────────────────────────────────────────────────────────────
function normalizeText(v: string) {
  return v.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const filteredRows = computed(() => {
  return MOCK_ROWS.filter(r => {
    if (filterFechaInicio.value || filterFechaFin.value) {
      const parts = r.fechaCreacion.slice(0, 10).split('/')
      const d = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : r.fechaCreacion.slice(0, 10)
      if (filterFechaInicio.value && d < filterFechaInicio.value) return false
      if (filterFechaFin.value && d > filterFechaFin.value) return false
    }
    if (filterEstados.value.length && !filterEstados.value.includes(r.estado)) return false
    if (filterPasosFlujo.value.length) {
      const norm = normalizeText(r.pasoFlujo)
      if (!filterPasosFlujo.value.some(p => norm.includes(normalizeText(p)))) return false
    }
    if (filterCanal.value && r.canal !== filterCanal.value) return false
    if (filterBuscarPorValor.value.trim()) {
      const val = normalizeText(filterBuscarPorValor.value)
      const tipo = filterBuscarPorTipo.value
      if (tipo === 'numeroAutorizacion' || tipo === '') {
        if (tipo === 'numeroAutorizacion' && !normalizeText(r.numeroAutorizacion).includes(val)) return false
        if (tipo === '' && !['numeroAutorizacion','voucher','deviceTag','imei','dn'].some(k => normalizeText(String((r as Record<string,unknown>)[k] ?? '')).includes(val))) return false
      }
      if (tipo === 'voucher'    && !normalizeText(r.voucher).includes(val)) return false
      if (tipo === 'deviceTag'  && !normalizeText(r.deviceTag).includes(val)) return false
      if (tipo === 'imei'       && !normalizeText(r.imei).includes(val)) return false
      if (tipo === 'dn'         && !normalizeText(r.dn).includes(val)) return false
    }
    if (filterNumAutorizacion.value && !normalizeText(r.numeroAutorizacion).includes(normalizeText(filterNumAutorizacion.value))) return false
    if (filterTienda.value && !normalizeText(r.tienda).includes(normalizeText(filterTienda.value.replace(/^\d+ - /, '')))) return false
    if (filterUsuario.value && !normalizeText(r.usuario).includes(normalizeText(filterUsuario.value))) return false
    return true
  })
})

// ── Panel / modal state ────────────────────────────────────────────────────
const selectedRow        = ref<HistorialPagoRecord | null>(null)
const showCancelConfirm  = ref(false)
const showDetail         = ref(false)
const showIntegrations   = ref(false)

interface IntegrationRoute { ruta: string; solicitud: string; respuesta: string }
const selectedRoute = ref<IntegrationRoute | null>(null)

const INTEGRATION_ROUTES: IntegrationRoute[] = [
  {
    ruta: 'integrations.gestopago-webview-autenticacao-token',
    solicitud: JSON.stringify({ rotaOrigem: 'https://gestopago-webview-autenticacao-token', cabecalho: { metodo: 'POST', uri: 'https://ventastemm.movistar.com.mx:3000/auth/token', contentType: 'application/json' }, corpoRequisicao: '{"grant_type":"client_credentials"}' }, null, 2),
    respuesta: JSON.stringify({ corpoResposta: { access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...', token_type: 'Bearer', expires_in: 3600 } }, null, 2),
  },
  {
    ruta: 'integrations.gestopago-enviar-transacao',
    solicitud: JSON.stringify({ rotaOrigem: 'https://gestopago-enviar-transacao', cabecalho: { metodo: 'POST', uri: 'https://ventastemm.movistar.com.mx:3000/custom/sales/external-sale', contentType: 'application/json' }, corpoRequisicao: '{"idPdv":"99030005","storeName":"CAC TORREON","userId":"AXC26154"}' }, null, 2),
    respuesta: JSON.stringify({ corpoResposta: { concepts: [{ concept: 'Recarga $50, Telcel', amount: 50, typeConcept: 'RECHARGE' }], transactionId: '87954076', authorizationNumber: '510120', status: 'APPROVED' } }, null, 2),
  },
  {
    ruta: 'integrations.gestopago-enviar-transacao',
    solicitud: JSON.stringify({ rotaOrigem: 'https://gestopago-enviar-transacao', cabecalho: { metodo: 'POST', uri: 'https://ventastemm.movistar.com.mx:3000/custom/sales/external-sale', contentType: 'application/json' }, corpoRequisicao: '{"idPdv":"99030005","storeName":"CAC TORREON","userId":"AXC26154","retry":true}' }, null, 2),
    respuesta: JSON.stringify({ corpoResposta: { concepts: [{ concept: 'Recarga $50, Telcel', amount: 50, typeConcept: 'RECHARGE' }], transactionId: '87954076', authorizationNumber: '510120', status: 'APPROVED' } }, null, 2),
  },
  {
    ruta: 'integrations.catalina-enviar-transacao',
    solicitud: JSON.stringify({ rotaOrigem: 'https://catalina-enviar-transacao?httpClient.connectTimeout=15000', cabecalho: { metodo: 'POST', uri: 'https://ventastemm.movistar.com.mx:3000/custom/sales/external-sale', contentType: 'application/json' }, corpoRequisicao: '{"idPdv":"99030005","storeName":"CAC TORREON","userId":"AXC26154"}' }, null, 2),
    respuesta: JSON.stringify({ corpoResposta: { concepts: [{ concept: 'Recarga $50, Telcel', amount: 50, typeConcept: 'RECHARGE' }], transactionId: '87954076', status: 'CONCLUDED' } }, null, 2),
  },
  {
    ruta: 'integrations.catalina-enviar-transacao',
    solicitud: JSON.stringify({ rotaOrigem: 'https://catalina-enviar-transacao?httpClient.connectTimeout=15000', cabecalho: { metodo: 'POST', uri: 'https://ventastemm.movistar.com.mx:3000/custom/sales/external-sale', contentType: 'application/json' }, corpoRequisicao: '{"idPdv":"99030005","storeName":"CAC TORREON","userId":"AXC26154","retry":true}' }, null, 2),
    respuesta: JSON.stringify({ corpoResposta: { concepts: [{ concept: 'Recarga $50, Telcel', amount: 50, typeConcept: 'RECHARGE' }], transactionId: '87954077', status: 'CONCLUDED' } }, null, 2),
  },
]

function getEstado(estado: string) {
  return ESTADO_META[estado] ?? { label: estado, color: '#6b7280', dot: '#9ca3af' }
}

function handleRequestCancel() {
  if (!selectedRow.value) return
  showCancelConfirm.value = true
}

function handleConfirmCancel() {
  if (!selectedRow.value) return
  if (selectedRow.value.estado === 'cancelado') {
    toastAviso(HISTORIAL_PAGOS_TEXT.cancelPaymentAlreadyDone)
    showCancelConfirm.value = false
    return
  }
  const row = MOCK_ROWS.find(r => r.id === selectedRow.value!.id)
  if (row) row.estado = 'cancelado'
  selectedRow.value = { ...selectedRow.value, estado: 'cancelado' }
  showCancelConfirm.value = false
  toastSucesso(HISTORIAL_PAGOS_TEXT.cancelPaymentSuccess)
}

function exportCsv() {
  const rows = filteredRows.value
  if (!rows.length) return
  const headers = ['Fecha', 'Voucher', 'DeviceTag', 'IMEI', 'Monto', 'Estado', 'Paso', 'Tienda', 'Usuario']
  const lines = rows.map(r =>
    [r.fechaCreacion, r.voucher, r.deviceTag, r.imei, r.monto, getEstado(r.estado).label, r.pasoFlujo, r.tienda, r.usuario]
      .map(v => JSON.stringify(v)).join(',')
  )
  const csv = '\uFEFF' + [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'historial-pagos.csv'
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}
</script>

<template>
  <AppLayout>
    <div class="hv2">

      <!-- Page header -->
      <div class="hv2__header">
        <div>
          <h1 class="hv2__title">Historial de pagos</h1>
          <p class="hv2__subtitle">Buscá un pago por voucher, IMEI, DeviceTag o autorización.</p>
        </div>
      </div>

      <!-- Filtros -->
      <section class="hv2__filters-card" aria-label="Filtros de búsqueda">
        <form class="hv2__filters-form" novalidate @submit.prevent>

          <!-- Linha 1: Fecha inicio · Fecha fin · Canal -->
          <div class="hv2__filters-row1">
            <div class="hv2__field">
              <label class="hv2__field-label" for="v2-fecha-inicio">Fecha inicio</label>
              <div class="hv2__field-ctrl">
                <input id="v2-fecha-inicio" v-model="filterFechaInicio" class="hv2__field-input" type="date" />
              </div>
            </div>
            <div class="hv2__field">
              <label class="hv2__field-label" for="v2-fecha-fin">Fecha fin</label>
              <div class="hv2__field-ctrl">
                <input id="v2-fecha-fin" v-model="filterFechaFin" class="hv2__field-input" type="date" />
              </div>
            </div>
            <!-- Canal dropdown -->
            <div class="hv2__field" @click.stop>
              <label class="hv2__field-label">Canal</label>
              <div class="ms-wrap">
                <button class="ms-trigger" type="button" :aria-expanded="showCanalMenu"
                  @click="showCanalMenu = !showCanalMenu; showEstadoMenu = false; showPasoMenu = false; showTiendaMenu = false; showBuscarMenu = false">
                  <span class="ms-trigger__label">{{ filterCanal ? CANAL_OPTIONS.find(o => o.value === filterCanal)?.label : 'Seleccione el canal' }}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <div v-if="showCanalMenu" class="ms-dropdown ms-dropdown--sm">
                  <div class="ms-option ms-option--single ms-option--clear" @click="filterCanal = ''; showCanalMenu = false">Todos</div>
                  <div v-for="opt in CANAL_OPTIONS" :key="opt.value"
                    class="ms-option ms-option--single"
                    :class="{ 'ms-option--checked': filterCanal === opt.value }"
                    @click="filterCanal = opt.value; showCanalMenu = false">
                    {{ opt.label }}
                  </div>
                </div>
                <div v-if="showCanalMenu" class="ms-backdrop" @click="showCanalMenu = false" />
              </div>
            </div>
          </div>

          <!-- Linha 2: Estado · Buscar por (campo + tipo) -->
          <div class="hv2__filters-row2">
            <!-- Estado multiselect -->
            <div class="hv2__field">
              <label class="hv2__field-label">Estado</label>
              <div class="ms-wrap" @click.stop>
                <button class="ms-trigger" type="button" :aria-expanded="showEstadoMenu"
                  @click="showEstadoMenu = !showEstadoMenu; showPasoMenu = false; showTiendaMenu = false; showCanalMenu = false; showBuscarMenu = false">
                  <span class="ms-trigger__label">{{ estadoLabel() }}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <div v-if="showEstadoMenu" class="ms-dropdown">
                  <div class="ms-search-row">
                    <input v-model="estadoSearch" class="ms-search" type="text" placeholder="Buscar..." @click.stop />
                    <svg class="ms-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4" stroke="#9ca3af" stroke-width="1.3"/><path d="M9.5 9.5L12 12" stroke="#9ca3af" stroke-width="1.3" stroke-linecap="round"/></svg>
                    <input type="checkbox" class="ms-check-all" :checked="filterEstados.length === ESTADO_OPTIONS.length" @change="e => toggleAllEstados((e.target as HTMLInputElement).checked)" aria-label="Seleccionar todo" />
                  </div>
                  <label v-for="opt in filteredEstadoOptions" :key="opt.value" class="ms-option" :class="{ 'ms-option--checked': filterEstados.includes(opt.value) }">
                    <input type="checkbox" :checked="filterEstados.includes(opt.value)" @change="toggleEstado(opt.value)" /> {{ opt.label }}
                  </label>
                </div>
                <div v-if="showEstadoMenu" class="ms-backdrop" @click="showEstadoMenu = false" />
              </div>
            </div>
            <!-- Buscar por: input + tipo select -->
            <div class="hv2__field hv2__field--buscar">
              <label class="hv2__field-label">Buscar por</label>
              <div class="buscar-combo">
                <input
                  v-model="filterBuscarPorValor"
                  class="buscar-combo__input"
                  type="text"
                  placeholder="Introduce el valor"
                  autocomplete="off"
                />
                <div class="buscar-combo__sep" aria-hidden="true" />
                <div class="buscar-combo__select-wrap">
                  <select v-model="filterBuscarPorTipo" class="buscar-combo__select">
                    <option value="">Seleccione</option>
                    <option v-for="opt in BUSCAR_POR_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <svg class="buscar-combo__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Más filtros toggle -->
          <button class="hv2__more-filters-btn" type="button" @click="showMoreFilters = !showMoreFilters">
            {{ showMoreFilters ? '− Menos filtros' : '+ Más filtros' }}
          </button>

          <!-- Linha 3 (expandível): Paso en flujo · Tienda · Usuario -->
          <Transition name="hv2-more">
            <div v-if="showMoreFilters" class="hv2__filters-row3">
              <!-- Paso en flujo multiselect -->
              <div class="hv2__field">
                <label class="hv2__field-label">Paso en flujo</label>
                <div class="ms-wrap" @click.stop>
                  <button class="ms-trigger" type="button" :aria-expanded="showPasoMenu"
                    @click="showPasoMenu = !showPasoMenu; showEstadoMenu = false; showTiendaMenu = false; showCanalMenu = false; showBuscarMenu = false">
                    <span class="ms-trigger__label">{{ pasoLabel() }}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>
                  </button>
                  <div v-if="showPasoMenu" class="ms-dropdown">
                    <div class="ms-search-row">
                      <input v-model="pasoSearch" class="ms-search" type="text" placeholder="Buscar..." @click.stop />
                      <svg class="ms-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4" stroke="#9ca3af" stroke-width="1.3"/><path d="M9.5 9.5L12 12" stroke="#9ca3af" stroke-width="1.3" stroke-linecap="round"/></svg>
                      <input type="checkbox" class="ms-check-all" :checked="filterPasosFlujo.length === PASO_FLUJO_OPTIONS.length" @change="e => toggleAllPasos((e.target as HTMLInputElement).checked)" aria-label="Seleccionar todo" />
                    </div>
                    <label v-for="opt in filteredPasoOptions" :key="opt.value" class="ms-option" :class="{ 'ms-option--checked': filterPasosFlujo.includes(opt.value) }">
                      <input type="checkbox" :checked="filterPasosFlujo.includes(opt.value)" @change="togglePaso(opt.value)" /> {{ opt.label }}
                    </label>
                  </div>
                  <div v-if="showPasoMenu" class="ms-backdrop" @click="showPasoMenu = false" />
                </div>
              </div>
              <!-- Tienda autocomplete -->
              <div class="hv2__field">
                <label class="hv2__field-label" for="v2-tienda">Tienda</label>
                <div class="ms-wrap" @click.stop>
                  <div class="hv2__field-ctrl hv2__field-ctrl--autocomplete">
                    <input id="v2-tienda" v-model="filterTienda" class="hv2__field-input" type="text" placeholder="Tienda" autocomplete="off"
                      @focus="showTiendaMenu = true; showEstadoMenu = false; showPasoMenu = false; showCanalMenu = false; showBuscarMenu = false" @click.stop />
                    <svg class="hv2__field-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>
                  </div>
                  <div v-if="showTiendaMenu && filteredTiendaOptions.length" class="ms-dropdown ms-dropdown--autocomplete">
                    <div v-for="opt in filteredTiendaOptions" :key="opt.value" class="ms-option ms-option--single" @click="selectTienda(opt.label)">{{ opt.label }}</div>
                  </div>
                  <div v-if="showTiendaMenu" class="ms-backdrop" @click="showTiendaMenu = false" />
                </div>
              </div>
              <!-- Usuario -->
              <div class="hv2__field">
                <label class="hv2__field-label" for="v2-usuario">Usuario</label>
                <input id="v2-usuario" v-model="filterUsuario" class="hv2__field-input" type="text" placeholder="Usuario" autocomplete="off" />
              </div>
            </div>
          </Transition>

          <div class="hv2__filters-actions">
            <button class="hv2__btn hv2__btn--ghost" type="button" @click="clearFilters">Limpiar filtro</button>
            <button class="hv2__btn hv2__btn--primary" type="submit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7"/>
                <path d="M20 20l-3.2-3.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
              </svg>
              Buscar
            </button>
          </div>
        </form>
      </section>

      <!-- Results section -->
      <div class="hv2__results-card">
        <!-- Results header -->
        <div class="hv2__results-header">
          <div class="hv2__results-title-row">
            <h2 class="hv2__results-title">Resultados</h2>
            <span class="hv2__results-count">{{ filteredRows.length }} pagos</span>
          </div>
          <div class="hv2__results-actions">
            <button class="hv2__export-btn" type="button" :disabled="filteredRows.length === 0" @click="exportCsv">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M7.5 10L7.5 2M7.5 10L4.5 7M7.5 10L10.5 7" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12h11" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Exportar {{ filteredRows.length }}
            </button>
          </div>
        </div>

        <!-- ── Tabla + panel ── -->
        <template v-if="true">
          <div class="hv2__table-layout" :class="{ 'hv2__table-layout--split': selectedRow }">
            <div class="hv2__table-wrap">
              <table class="hv2__table" aria-label="Historial de pagos">
                <thead>
                  <tr>
                    <th class="hv2__th">Fecha / hora</th>
                    <th class="hv2__th">Voucher</th>
                    <th class="hv2__th">Equipo</th>
                    <th class="hv2__th hv2__th--right">Monto</th>
                    <th class="hv2__th">Estado</th>
                    <th class="hv2__th">Tienda / usuario</th>
                    <th class="hv2__th hv2__th--center">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredRows.length === 0">
                    <td colspan="7" class="hv2__empty">No se encontraron pagos con los filtros aplicados.</td>
                  </tr>
                  <tr
                    v-for="row in filteredRows"
                    :key="row.id"
                    class="hv2__tr"
                    :class="{ 'hv2__tr--selected': selectedRow?.id === row.id }"
                    tabindex="0"
                    :aria-selected="selectedRow?.id === row.id"
                    @click="selectedRow = row"
                    @keydown.enter="selectedRow = row"
                  >
                    <td class="hv2__td hv2__td--date">{{ row.fechaCreacion }}</td>
                    <td class="hv2__td hv2__td--voucher">{{ row.voucher }}</td>
                    <td class="hv2__td">
                      <span class="hv2__device-tag">{{ row.deviceTag }}</span>
                      <span class="hv2__imei">{{ row.imei }}</span>
                    </td>
                    <td class="hv2__td hv2__td--monto">{{ row.monto }}</td>
                    <td class="hv2__td">
                      <div class="hv2__estado-cell">
                        <span class="hv2__badge" :style="{ color: getEstado(row.estado).color }">
                          <span class="hv2__badge-dot" :style="{ background: getEstado(row.estado).dot }"/>
                          {{ getEstado(row.estado).label }}
                        </span>
                        <span class="hv2__paso">{{ row.pasoFlujo }}</span>
                      </div>
                    </td>
                    <td class="hv2__td">
                      <span class="hv2__tienda">{{ row.tienda }}</span>
                      <span class="hv2__usuario">{{ row.usuario }}</span>
                    </td>
                    <td class="hv2__td hv2__td--center">
                      <button class="hv2__detail-btn" type="button"
                        :aria-label="`Ver detalle ${row.voucher}`"
                        @click.stop="selectedRow = selectedRow?.id === row.id ? null : row">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path :d="selectedRow?.id === row.id ? 'M10 4l-4 4 4 4' : 'M6 4l4 4-4 4'" stroke="#2196f3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Side panel -->
            <Transition name="hv2-panel">
              <aside v-if="selectedRow" class="hv2__side-panel" aria-label="Detalle del pago">
                <div class="hv2__sp-header">
                  <h3 class="hv2__sp-title">Detalle del pago</h3>
                </div>

                <!-- Quick summary body -->
                <div class="hv2__sp-body">
                  <div class="hv2__sp-hero">
                    <span class="hv2__sp-voucher">Voucher {{ selectedRow.voucher }}</span>
                    <span class="hv2__sp-monto">{{ selectedRow.monto }}</span>
                    <span class="hv2__badge" :style="{ color: getEstado(selectedRow.estado).color }">
                      <span class="hv2__badge-dot" :style="{ background: getEstado(selectedRow.estado).dot }"/>
                      {{ getEstado(selectedRow.estado).label }}
                    </span>
                  </div>
                  <dl class="hv2__sp-group">
                    <div class="hv2__sp-row"><dt>Fecha</dt><dd>{{ selectedRow.fechaCreacion }}</dd></div>
                    <div class="hv2__sp-row"><dt>DeviceTag</dt><dd>{{ selectedRow.deviceTag }}</dd></div>
                    <div class="hv2__sp-row"><dt>IMEI</dt><dd class="hv2__sp-imei">{{ selectedRow.imei }}</dd></div>
                    <div class="hv2__sp-row"><dt>Paso</dt><dd>{{ selectedRow.pasoFlujo }}</dd></div>
                    <div class="hv2__sp-row"><dt>Tienda</dt><dd>{{ selectedRow.tienda }}</dd></div>
                    <div class="hv2__sp-row"><dt>Usuario</dt><dd>{{ selectedRow.usuario }}</dd></div>
                  </dl>
                </div>

                <div class="hv2__sp-footer">
                  <button class="btn btn--secondary" type="button" @click="showDetail = true">
                    Ver detalles completos
                  </button>
                  <button class="btn btn--integration" type="button" @click="showIntegrations = true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="6" cy="12" r="2" stroke="currentColor" stroke-width="1.6"/>
                      <circle cx="18" cy="6" r="2" stroke="currentColor" stroke-width="1.6"/>
                      <circle cx="18" cy="18" r="2" stroke="currentColor" stroke-width="1.6"/>
                      <path d="M8 11l8-4M8 13l8 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    </svg>
                    Integraciones
                  </button>
                  <button class="btn btn--danger" type="button"
                    :disabled="selectedRow.estado === 'cancelado'"
                    @click="handleRequestCancel">
                    Cancelar pago
                  </button>
                </div>
              </aside>
            </Transition>
          </div>
        </template>

        <!-- Vista: Fila expansible — REMOVIDA -->
        <template v-if="false">
          <div class="hv2__table-wrap">
            <table class="hv2__table" aria-label="Historial de pagos">
              <thead>
                <tr>
                  <th class="hv2__th hv2__th--expand"></th>
                  <th class="hv2__th">Fecha / hora</th>
                  <th class="hv2__th">Voucher</th>
                  <th class="hv2__th">Equipo</th>
                  <th class="hv2__th hv2__th--right">Monto</th>
                  <th class="hv2__th">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredRows.length === 0">
                  <td colspan="6" class="hv2__empty">No se encontraron pagos con los filtros aplicados.</td>
                </tr>
                <template v-for="row in filteredRows" :key="row.id">
                  <tr class="hv2__tr" :class="{ 'hv2__tr--expanded': expandedRows.has(row.id) }"
                    tabindex="0" @click="toggleExpand(row.id)" @keydown.enter="toggleExpand(row.id)">
                    <td class="hv2__td hv2__td--expand">
                      <svg class="hv2__expand-icon" :class="{ 'hv2__expand-icon--open': expandedRows.has(row.id) }"
                        width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </td>
                    <td class="hv2__td hv2__td--date">{{ row.fechaCreacion }}</td>
                    <td class="hv2__td hv2__td--voucher">{{ row.voucher }}</td>
                    <td class="hv2__td"><span class="hv2__device-tag">{{ row.deviceTag }}</span></td>
                    <td class="hv2__td hv2__td--monto">{{ row.monto }}</td>
                    <td class="hv2__td">
                      <span class="hv2__badge" :style="{ color: getEstado(row.estado).color }">
                        <span class="hv2__badge-dot" :style="{ background: getEstado(row.estado).dot }"/>
                        {{ getEstado(row.estado).label }}
                      </span>
                    </td>
                  </tr>
                  <Transition name="hv2-expand">
                    <tr v-if="expandedRows.has(row.id)" class="hv2__tr-detail">
                      <td colspan="6" class="hv2__td-detail">
                        <div class="hv2__detail-sections">
                          <!-- Equipo -->
                          <div class="hv2__detail-section">
                            <p class="hv2__detail-section-title">
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><rect x="1" y="2" width="11" height="9" rx="1.5" stroke="#9ca3af" stroke-width="1.3"/><path d="M4 11v1M9 11v1M3 13h7" stroke="#9ca3af" stroke-width="1.3" stroke-linecap="round"/></svg>
                              Equipo
                            </p>
                            <div class="hv2__detail-grid">
                              <div><span class="hv2__detail-key">DeviceTag</span><span class="hv2__detail-val">{{ row.deviceTag }}</span></div>
                              <div><span class="hv2__detail-key">IMEI</span><span class="hv2__detail-val">{{ row.imei }}</span></div>
                              <div><span class="hv2__detail-key">DN</span><span class="hv2__detail-val">{{ row.dn || '—' }}</span></div>
                            </div>
                          </div>
                          <!-- Pago -->
                          <div class="hv2__detail-section">
                            <p class="hv2__detail-section-title">
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><rect x="1" y="3" width="11" height="8" rx="1.5" stroke="#9ca3af" stroke-width="1.3"/><path d="M1 6h11" stroke="#9ca3af" stroke-width="1.3"/></svg>
                              Pago
                            </p>
                            <div class="hv2__detail-grid">
                              <div><span class="hv2__detail-key">Voucher</span><span class="hv2__detail-val">{{ row.voucher }}</span></div>
                              <div><span class="hv2__detail-key">Monto</span><span class="hv2__detail-val hv2__detail-val--monto">{{ row.monto }}</span></div>
                              <div><span class="hv2__detail-key">Fecha</span><span class="hv2__detail-val">{{ row.fechaCreacion }}</span></div>
                              <div><span class="hv2__detail-key">Paso</span><span class="hv2__detail-val">{{ row.pasoFlujo }}</span></div>
                              <div><span class="hv2__detail-key">N° Autorización</span><span class="hv2__detail-val">{{ row.numeroAutorizacion || '—' }}</span></div>
                              <div><span class="hv2__detail-key">ID Transacción</span><span class="hv2__detail-val">{{ row.idTransaccion || '—' }}</span></div>
                            </div>
                          </div>
                          <!-- Tienda -->
                          <div class="hv2__detail-section">
                            <p class="hv2__detail-section-title">
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1.5 5.5L2.5 2h8l1 3.5" stroke="#9ca3af" stroke-width="1.3" stroke-linecap="round"/><path d="M1.5 5.5h10v5a1 1 0 01-1 1h-8a1 1 0 01-1-1v-5z" stroke="#9ca3af" stroke-width="1.3"/><path d="M5 11.5V8h3v3.5" stroke="#9ca3af" stroke-width="1.3" stroke-linecap="round"/></svg>
                              Tienda / Usuario
                            </p>
                            <div class="hv2__detail-grid">
                              <div><span class="hv2__detail-key">Tienda</span><span class="hv2__detail-val">{{ row.tienda }}</span></div>
                              <div><span class="hv2__detail-key">PDV ID</span><span class="hv2__detail-val">{{ row.storePdvId || '—' }}</span></div>
                              <div><span class="hv2__detail-key">Usuario</span><span class="hv2__detail-val">{{ row.usuario }}</span></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Transition>
                </template>
              </tbody>
            </table>
          </div>
        </template>

        <!-- Pagination -->
        <div class="hv2__pagination">
          <span class="hv2__pagination-info">Mostrando 1–{{ filteredRows.length }} de {{ filteredRows.length }}</span>
          <div class="hv2__pagination-btns">
            <button class="hv2__pg-btn" type="button" disabled>Anterior</button>
            <button class="hv2__pg-btn" type="button" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal de detalles completos ── -->
    <Teleport to="body">
      <Transition name="hv2-confirm-fade">
        <div v-if="showDetail && selectedRow" class="hv2-confirm__backdrop"
          role="dialog" aria-modal="true" aria-labelledby="hv2-detail-title"
          @click.self="showDetail = false">
          <div class="hv2-detail__card">
            <!-- Header -->
            <div class="hv2-detail__header">
              <div>
                <h4 id="hv2-detail-title" class="hv2-detail__title">{{ selectedRow.storeName || selectedRow.tienda }}</h4>
                <span class="hv2-detail__pdv">ID PDV: {{ selectedRow.storePdvId || '—' }}</span>
              </div>

            </div>
            <!-- Scrollable body -->
            <div class="hv2-detail__body">
              <!-- Resumen del pago -->
              <p class="hv2-detail__section-title">Resumen del pago</p>
              <dl class="hv2-detail__grid">
                <div><dt>Fecha / Hora</dt><dd>{{ selectedRow.fechaCreacion }}</dd></div>
                <div><dt>Tipo de pago</dt><dd>{{ selectedRow.tipoPago || '—' }}</dd></div>
                <div><dt>Forma de pago</dt><dd>{{ selectedRow.formaPago || '—' }}</dd></div>
                <div><dt>DeviceTag</dt><dd>{{ selectedRow.deviceTag }}</dd></div>
                <div><dt>IMEI</dt><dd>{{ selectedRow.imei }}</dd></div>
                <div><dt>Referencia</dt><dd>{{ selectedRow.referencia || '—' }}</dd></div>
                <div><dt>Total</dt><dd class="hv2-detail__monto">{{ selectedRow.monto }}</dd></div>
              </dl>

              <!-- PAYJOY -->
              <p class="hv2-detail__section-title hv2-detail__section-title--brand">PAYJOY</p>
              <dl class="hv2-detail__grid">
                <div><dt>ID transacción</dt><dd>{{ selectedRow.idTransaccion || '—' }}</dd></div>
                <div><dt>Nº autorización</dt><dd>{{ selectedRow.numeroAutorizacion || '—' }}</dd></div>
                <div><dt>Fecha de pago</dt><dd>{{ selectedRow.fechaPago || '—' }}</dd></div>
                <div><dt>Fecha de creación</dt><dd>{{ selectedRow.fechaCreacion }}</dd></div>
                <div><dt>Monto</dt><dd class="hv2-detail__monto">{{ selectedRow.monto }}</dd></div>
                <div><dt>Servicio</dt><dd>{{ selectedRow.servicio || '—' }}</dd></div>
                <div><dt>Producto</dt><dd>{{ selectedRow.produto || 'PayJoy' }}</dd></div>
                <div><dt>Estado</dt><dd>
                  <span class="hv2__badge" :style="{ color: getEstado(selectedRow.estado).color }">
                    <span class="hv2__badge-dot" :style="{ background: getEstado(selectedRow.estado).dot }"/>
                    {{ getEstado(selectedRow.estado).label }}
                  </span>
                </dd></div>
                <div><dt>Paso en flujo</dt><dd>{{ selectedRow.pasoFlujo }}</dd></div>
                <div><dt>Usuario</dt><dd>{{ selectedRow.usuario }}</dd></div>
                <div><dt>ID del pago</dt><dd>{{ selectedRow.idDelPago || '—' }}</dd></div>
                <div><dt>Tienda</dt><dd>{{ selectedRow.tienda }}</dd></div>
              </dl>

              <!-- CATALINA -->
              <p class="hv2-detail__section-title hv2-detail__section-title--catalina">CATALINA</p>
              <dl class="hv2-detail__grid">
                <div><dt>Fecha de envío</dt><dd>{{ selectedRow.fechaCreacion }}</dd></div>
                <div><dt>Estado</dt><dd>{{ selectedRow.canal || '—' }}</dd></div>
                <div><dt>Información adicional</dt><dd>{{ selectedRow.idRed || '—' }}</dd></div>
              </dl>
            </div>
            <!-- Footer -->
            <div class="hv2-detail__footer">
              <button class="btn btn--ghost" type="button" @click="showDetail = false">Cerrar</button>
              <button class="btn btn--danger" type="button"
                :disabled="selectedRow.estado === 'cancelado'"
                @click="showDetail = false; handleRequestCancel()">
                Cancelar pago
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Modal de Integraciones ── -->
    <Teleport to="body">
      <Transition name="hv2-confirm-fade">
        <div v-if="showIntegrations && selectedRow" class="hv2-confirm__backdrop"
          role="dialog" aria-modal="true" aria-labelledby="hv2-integrations-title"
          @click.self="showIntegrations = false">
          <div class="hv2-integration__card">
            <!-- Header -->
            <div class="hv2-integration__header">
              <h3 id="hv2-integrations-title" class="hv2-integration__title">Integraciones</h3>
            </div>
            <!-- Info summary -->
            <div class="hv2-integration__info">
              <p><strong>ID PDV:</strong> {{ selectedRow.storeName }}</p>
              <p><strong>Fecha/hora:</strong> {{ selectedRow.fechaCreacion }}</p>
              <p><strong>ID del pago:</strong> {{ selectedRow.idDelPago || '—' }}</p>
              <p><strong>Número de autorización:</strong> {{ selectedRow.numeroAutorizacion || '—' }}</p>
              <p><strong>ID transacción:</strong> {{ selectedRow.idTransaccion || '—' }}</p>
              <p><strong>Estado:</strong> {{ getEstado(selectedRow.estado).label }}</p>
              <p><strong>Paso en flujo:</strong> {{ selectedRow.pasoFlujo }}</p>
            </div>
            <!-- Routes table -->
            <div class="hv2-integration__table-wrap">
              <table class="hv2-integration__table">
                <thead>
                  <tr>
                    <th class="hv2-integration__th">Ruta</th>
                    <th class="hv2-integration__th">Fecha</th>
                    <th class="hv2-integration__th">Fecha Response</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(route, idx) in INTEGRATION_ROUTES"
                    :key="idx"
                    class="hv2-integration__tr hv2-integration__tr--clickable"
                    tabindex="0"
                    :aria-label="`Ver detalle de ${route.ruta}`"
                    @click="selectedRoute = route"
                    @keydown.enter="selectedRoute = route"
                  >
                    <td class="hv2-integration__td hv2-integration__td--link">{{ route.ruta }}</td>
                    <td class="hv2-integration__td">{{ selectedRow.fechaCreacion }}</td>
                    <td class="hv2-integration__td">{{ selectedRow.fechaCreacion }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Footer -->
            <div class="hv2-integration__footer">
              <button class="btn btn--ghost" type="button" @click="showIntegrations = false">Cerrar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Sub-modal: Detalle de Ruta ── -->
    <Teleport to="body">
      <Transition name="hv2-confirm-fade">
        <div v-if="selectedRoute" class="hv2-confirm__backdrop"
          role="dialog" aria-modal="true" :aria-labelledby="'hv2-route-title'"
          @click.self="selectedRoute = null">
          <div class="hv2-route__card">
            <div class="hv2-route__header">
              <h3 id="hv2-route-title" class="hv2-route__title">{{ selectedRoute.ruta }}</h3>
            </div>
            <div class="hv2-route__body">
              <p class="hv2-route__section-label">Solicitud</p>
              <div class="hv2-route__code-wrap">
                <pre class="hv2-route__code">{{ selectedRoute.solicitud }}</pre>
              </div>
              <p class="hv2-route__section-label">Respuesta</p>
              <div class="hv2-route__code-wrap">
                <pre class="hv2-route__code">{{ selectedRoute.respuesta }}</pre>
              </div>
            </div>
            <div class="hv2-route__footer">
              <button class="btn btn--ghost" type="button" @click="selectedRoute = null">Cerrar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>


    <!-- ── Diálogo de confirmación de cancelamiento ── -->
    <Teleport to="body">
      <Transition name="hv2-confirm-fade">
        <div v-if="showCancelConfirm" class="hv2-confirm__backdrop"
          role="alertdialog" aria-modal="true" aria-labelledby="hv2-cancel-title"
          @click.self="showCancelConfirm = false">
          <div class="hv2-confirm__card">
            <div class="hv2-confirm__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="1.8"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h4 id="hv2-cancel-title" class="hv2-confirm__title">Cancelar pago</h4>
            <p class="hv2-confirm__message">¿Está seguro de que desea cancelar este pago?</p>
            <p class="hv2-confirm__warning">Esta acción no puede deshacerse.</p>
            <div class="hv2-confirm__actions">
              <button class="btn btn--ghost" type="button" @click="showCancelConfirm = false">Volver</button>
              <button class="btn btn--danger" type="button" @click="handleConfirmCancel">Sí, cancelar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>

<style scoped>
.hv2 {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 8px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.hv2__header { display: flex; align-items: flex-start; }
.hv2__title {
  font-size: 22px; font-weight: 700; margin: 0;
  color: var(--color-gray-900, #111827);
  font-family: var(--font-heading, inherit);
}
.hv2__subtitle {
  font-size: 14px; color: var(--color-text-muted, #6b7280); margin: 4px 0 0;
}

/* Filters card */
.hv2__filters-card {
  background: #fff;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 10px;
  padding: 20px 24px;
}
.hv2__filters-form { display: flex; flex-direction: column; gap: 16px; }
.hv2__filters-row1 { display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 16px; }
.hv2__filters-row2 { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }
.hv2__filters-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

/* Buscar por combo */
.hv2__field--buscar .buscar-combo {
  display: flex; align-items: stretch;
  border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden;
}
.hv2__field--buscar .buscar-combo:focus-within { border-color: #2196f3; }
.buscar-combo__input {
  flex: 1; height: 40px; padding: 0 10px; border: none;
  font-size: 13px; color: #374151; font-family: inherit; outline: none; min-width: 0;
  background: #fff;
}
.buscar-combo__sep { width: 1px; background: #d1d5db; flex-shrink: 0; }
.buscar-combo__select-wrap { position: relative; flex-shrink: 0; }
.buscar-combo__select {
  height: 40px; padding: 0 30px 0 10px;
  border: none; background: #f9fafb;
  font-size: 13px; color: #374151; font-family: inherit;
  appearance: none; outline: none; cursor: pointer; white-space: nowrap;
}
.buscar-combo__select:focus { background: #f3f4f6; }
.buscar-combo__chevron {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  pointer-events: none; color: #6b7280;
}

/* Más filtros */
.hv2__more-filters-btn {
  background: none; border: none; cursor: pointer; color: #2196f3;
  font-size: 13px; font-weight: 500; font-family: inherit; padding: 0; text-align: left;
}
.hv2__more-filters-btn:hover { text-decoration: underline; }
.hv2-more-enter-active, .hv2-more-leave-active { transition: opacity 0.15s; }
.hv2-more-enter-from, .hv2-more-leave-to { opacity: 0; }

/* Canal dropdown */
.ms-dropdown--sm { min-width: 180px; }
.hv2__field { display: flex; flex-direction: column; gap: 5px; }
.hv2__field-label { font-size: 12px; font-weight: 600; color: #6b7280; }
.hv2__field-input {
  height: 40px; padding: 0 10px;
  border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 13px; color: #374151; font-family: inherit;
  outline: none; width: 100%;
}
.hv2__field-input:focus { border-color: #2196f3; }
.hv2__field-ctrl { position: relative; }
.hv2__field-ctrl--date .hv2__field-input,
.hv2__field-ctrl--autocomplete .hv2__field-input { padding-right: 32px; }
.hv2__field-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9ca3af; }
.hv2__filters-actions { display: flex; gap: 10px; padding-top: 4px; }
.hv2__btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 38px; padding: 0 18px; border-radius: 6px;
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
}
.hv2__btn--ghost { background: #fff; color: #374151; border: 1px solid #d1d5db; }
.hv2__btn--ghost:hover { background: #f9fafb; }
.hv2__btn--primary { background: #2196f3; color: #fff; border: none; }
.hv2__btn--primary:hover { background: #1e88e5; }

/* Multiselect shared */
.ms-wrap { position: relative; }
.ms-trigger {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  width: 100%; height: 40px; padding: 0 10px;
  border: 1px solid #d1d5db; border-radius: 6px;
  background: #fff; font-size: 13px; color: #374151;
  cursor: pointer; text-align: left; font-family: inherit;
}
.ms-trigger:focus-visible { outline: 2px solid #2196f3; outline-offset: 1px; }
.ms-trigger__label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ms-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; min-width: 220px;
  z-index: 300; background: #fff;
  border: 1px solid #d1d5db; border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12); max-height: 240px; overflow-y: auto;
}
.ms-dropdown--autocomplete { max-height: 200px; }
.ms-search-row {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px; border-bottom: 1px solid #f3f4f6; position: sticky; top: 0; background: #fff;
}
.ms-search { flex: 1; border: none; outline: none; font-size: 13px; color: #374151; font-family: inherit; }
.ms-search-icon { flex-shrink: 0; }
.ms-check-all { flex-shrink: 0; cursor: pointer; width: 15px; height: 15px; }
.ms-option {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; font-size: 13px; color: #374151; cursor: pointer;
  transition: background 0.1s;
}
.ms-option:hover { background: #f8fafc; }
.ms-option--checked { color: #2196f3; font-weight: 500; }
.ms-option--single { cursor: pointer; }
.ms-option--single:hover { background: #f3f4f6; }
.ms-option--clear { color: #9ca3af; font-style: italic; }
.ms-dropdown--right { right: 0; left: auto; }
.ms-option input[type="checkbox"] { width: 15px; height: 15px; accent-color: #2196f3; flex-shrink: 0; }
.ms-backdrop { position: fixed; inset: 0; z-index: 299; }

.hv2-slide-enter-active, .hv2-slide-leave-active { transition: opacity 0.2s ease; overflow: hidden; }
.hv2-slide-enter-from, .hv2-slide-leave-to { opacity: 0; }
.hv2-slide-enter-to, .hv2-slide-leave-from { opacity: 1; }

/* Results card */
.hv2__results-card {
  background: #fff;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
}
.hv2__results-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid var(--color-border, #e5e7eb);
  flex-wrap: wrap; gap: 12px;
}
.hv2__results-title-row { display: flex; align-items: center; gap: 8px; }
.hv2__results-title { font-size: 15px; font-weight: 600; margin: 0; color: var(--color-gray-900, #111827); }
.hv2__results-count {
  font-size: 13px; color: var(--color-text-muted, #6b7280);
  background: var(--color-gray-100, #f3f4f6);
  padding: 1px 8px; border-radius: 100px;
}
.hv2__results-actions { display: flex; align-items: center; gap: 12px; }

.hv2__export-btn {
  display: flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 14px;
  border: 1px solid #bbf7d0; border-radius: 6px;
  background: #f0fdf4; color: #16a34a;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background 0.15s;
}
.hv2__export-btn:hover { background: #dcfce7; }

/* Table */
.hv2__table-wrap { overflow-x: auto; }
.hv2__table { width: 100%; border-collapse: collapse; }
.hv2__th {
  padding: 10px 16px; text-align: left;
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--color-text-muted, #6b7280);
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  white-space: nowrap;
}
.hv2__th--right { text-align: right; }
.hv2__th--center { text-align: center; }

.hv2__tr {
  border-bottom: 1px solid var(--color-border, #f3f4f6);
  cursor: pointer; transition: background 0.1s;
}
.hv2__tr:hover { background: #f8fafc; }
.hv2__tr--selected { background: #eff6ff; }
.hv2__tr:focus { outline: 2px solid #2196f3; outline-offset: -2px; }

.hv2__td {
  padding: 12px 16px; font-size: 14px;
  color: var(--color-text-primary, #374151);
  vertical-align: middle;
}
.hv2__td--date { color: var(--color-text-secondary, #6b7280); font-size: 13px; }
.hv2__td--voucher { font-weight: 600; }
.hv2__td--monto { text-align: right; font-weight: 600; }
.hv2__td--center { text-align: center; }

.hv2__device-tag { display: block; font-weight: 600; font-size: 14px; }
.hv2__imei { display: block; font-size: 12px; color: var(--color-text-muted, #9ca3af); }

.hv2__estado-cell { display: flex; flex-direction: column; gap: 2px; }
.hv2__badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600;
}
.hv2__badge-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.hv2__paso { font-size: 12px; color: var(--color-text-muted, #9ca3af); padding-left: 13px; }

.hv2__tienda { display: block; font-size: 13px; font-weight: 500; }
.hv2__usuario { display: block; font-size: 12px; color: var(--color-text-muted, #9ca3af); }

.hv2__detail-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: none; background: transparent;
  cursor: pointer; border-radius: 6px; transition: background 0.15s;
}
.hv2__detail-btn:hover { background: #eff6ff; }

/* Pagination */
.hv2__pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-top: 1px solid var(--color-border, #e5e7eb);
}
.hv2__pagination-info { font-size: 13px; color: var(--color-text-muted, #6b7280); }
.hv2__pagination-btns { display: flex; gap: 8px; }
.hv2__pg-btn {
  height: 32px; padding: 0 14px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px; background: #fff;
  font-size: 13px; color: var(--color-text-primary, #374151);
  cursor: pointer; transition: background 0.15s;
}
.hv2__pg-btn:hover:not(:disabled) { background: var(--color-gray-50, #f9fafb); }
.hv2__pg-btn:disabled { color: var(--color-text-muted, #9ca3af); cursor: not-allowed; }

/* Table layout split */
.hv2__table-layout { display: flex; overflow: hidden; }
.hv2__table-wrap { flex: 1; min-width: 0; overflow-x: auto; }
.hv2__table-layout--split .hv2__table-wrap { border-right: 1px solid #e5e7eb; }

/* Side panel */
.hv2__side-panel { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; background: #fff; }
.hv2__sp-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; }
.hv2__sp-title { font-size: 14px; font-weight: 600; margin: 0; }
.hv2__sp-close { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; border-radius: 6px; transition: background 0.15s; }
.hv2__sp-close:hover { background: #f3f4f6; }
.hv2__sp-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.hv2__sp-hero { display: flex; flex-direction: column; gap: 6px; padding: 16px; border-bottom: 1px solid #f3f4f6; }
.hv2__sp-voucher { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
.hv2__sp-monto { font-weight: 700; font-size: 22px; color: #111827; }
.hv2__sp-imei { font-size: 12px; color: #9ca3af; word-break: break-all; }
.hv2__sp-group { padding: 0 16px; display: flex; flex-direction: column; }
.hv2__sp-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; gap: 8px; }
.hv2__sp-row dt { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0; }
.hv2__sp-row dd { font-size: 13px; color: #374151; text-align: right; word-break: break-all; }
.hv2__sp-footer { padding: 12px 16px; border-top: 1px solid #e5e7eb; margin-top: auto; display: flex; flex-direction: column; gap: 8px; }

/* Expand row */
/* Detail modal */
.hv2-detail__card { background: #fff; border-radius: 14px; width: 600px; max-width: 96vw; max-height: 86vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.18); }
.hv2-detail__header { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid #e5e7eb; }
.hv2-detail__title { font-size: 16px; font-weight: 700; margin: 0; color: #111827; }
.hv2-detail__pdv { font-size: 12px; color: #6b7280; margin-top: 2px; display: block; }
.hv2-detail__body { flex: 1; overflow-y: auto; padding: 0 24px 8px; }
.hv2-detail__section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; padding: 16px 0 8px; border-bottom: 1px solid #f3f4f6; margin: 0 0 12px; }
.hv2-detail__section-title--brand { color: #2196f3; }
.hv2-detail__section-title--catalina { color: #7c3aed; }
.hv2-detail__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px 24px; margin-bottom: 4px; }
.hv2-detail__grid dt { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #9ca3af; margin-bottom: 3px; }
.hv2-detail__grid dd { font-size: 13px; color: #374151; font-weight: 500; word-break: break-all; }
.hv2-detail__monto { font-size: 15px; font-weight: 700; color: #111827; }
.hv2-detail__footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #e5e7eb; }
.hv2__detail-val--monto { font-weight: 700; font-size: 14px; color: #111827; }

/* Transitions */
.hv2-panel-enter-active, .hv2-panel-leave-active { transition: all 0.2s ease; }
.hv2-panel-enter-from, .hv2-panel-leave-to { opacity: 0; transform: translateX(20px); }
.hv2-panel-enter-to, .hv2-panel-leave-from { opacity: 1; transform: translateX(0); }

/* Side panel footer */
.hv2__sp-footer .btn { width: 100%; }

/* Confirm dialog */
.hv2-confirm__backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.hv2-confirm__card { background: #fff; border-radius: 12px; padding: 32px 28px; max-width: 360px; width: 90%; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.hv2-confirm__icon { width: 52px; height: 52px; border-radius: 50%; background: #fef2f2; display: flex; align-items: center; justify-content: center; }
.hv2-confirm__title { font-size: 17px; font-weight: 700; color: #111827; margin: 0; text-align: center; }
.hv2-confirm__message { font-size: 14px; color: #374151; margin: 0; text-align: center; }
.hv2-confirm__warning { font-size: 12px; color: #dc2626; font-weight: 500; margin: 0; text-align: center; }
.hv2-confirm__actions { display: flex; gap: 10px; width: 100%; margin-top: 8px; }
.hv2-confirm__actions .btn { flex: 1; }
.hv2-confirm-fade-enter-active, .hv2-confirm-fade-leave-active { transition: opacity 0.2s ease; }
.hv2-confirm-fade-enter-from, .hv2-confirm-fade-leave-to { opacity: 0; }

/* Buttons */
.btn { height: 38px; padding: 0 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; font-family: var(--font-body, inherit); }
.btn--danger { background: #dc2626; color: #fff; border: none; }
.btn--danger:hover:not(:disabled) { background: #b91c1c; }
.btn--danger:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--ghost { background: transparent; color: #374151; border: 1px solid #e5e7eb; }
.btn--ghost:hover { background: #f3f4f6; }
.btn--secondary { background: #eff6ff; color: #2196f3; border: 1px solid #bfdbfe; }
.btn--secondary:hover { background: #dbeafe; }
.btn--integration { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.btn--integration:hover { background: #dcfce7; }
.hv2-expand-enter-active, .hv2-expand-leave-active { transition: opacity 0.2s ease; }
.hv2-expand-enter-from, .hv2-expand-leave-to { opacity: 0; }
.hv2-expand-enter-to, .hv2-expand-leave-from { opacity: 1; }

/* Integration modal */
.hv2-integration__card {
  background: #fff;
  border-radius: 12px;
  width: 720px;
  max-width: 96vw;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
}
.hv2-integration__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.hv2-integration__title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #111827;
}
.hv2-integration__info {
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 13px;
  color: #374151;
}
.hv2-integration__info p { margin: 0; }
.hv2-integration__info strong { color: #111827; font-weight: 600; }
.hv2-integration__table-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
.hv2-integration__table {
  width: 100%;
  border-collapse: collapse;
}
.hv2-integration__th {
  padding: 10px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
  white-space: nowrap;
}
.hv2-integration__tr { border-bottom: 1px solid #f3f4f6; }
.hv2-integration__tr:nth-child(even) { background: #f9fafb; }
.hv2-integration__tr--clickable { cursor: pointer; transition: background 0.13s; }
.hv2-integration__tr--clickable:hover { background: #eff6ff; }
.hv2-integration__tr--clickable:focus { outline: 2px solid #2196f3; outline-offset: -2px; }
.hv2-integration__td {
  padding: 12px 16px;
  font-size: 13px;
  color: #374151;
}
.hv2-integration__td--link { color: #2196f3; font-weight: 500; }
.hv2-integration__footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
}

/* Route detail sub-modal */
.hv2-route__card {
  background: #fff;
  border-radius: 12px;
  width: 680px;
  max-width: 96vw;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.22);
}
.hv2-route__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.hv2-route__title {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  color: #111827;
  word-break: break-all;
}
.hv2-route__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hv2-route__section-label {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #374151;
}
.hv2-route__code-wrap {
  overflow-x: auto;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.hv2-route__code {
  margin: 0;
  padding: 14px 16px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre;
}
.hv2-route__footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
}
</style>
