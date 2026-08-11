<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useToastUtils } from '@/composables/useToast'
import {
  ESTADO_OPTIONS,
  HISTORIAL_PAGOS_COLUMNS,
  HISTORIAL_PAGOS_TEXT,
  INITIAL_FILTERS,
  MOCK_HISTORIAL_PAGOS,
  PASO_FLUJO_OPTIONS,
  TIENDAS_OPTIONS,
  type HistorialPagoRecord,
  type HistorialPagosFilters,
} from '@/constants/historialPagos'

const { toastAviso, toastErro, toastInfo, toastSucesso } = useToastUtils()

const filters = reactive<HistorialPagosFilters>({ ...INITIAL_FILTERS, estados: [], pasosFlujo: [] })
const appliedFilters = ref<HistorialPagosFilters>({ ...INITIAL_FILTERS, estados: [], pasosFlujo: [] })
const isSearching = ref(false)
const fetchError = ref('')
const selectedIds = ref<string[]>([])
const showDetailModal = ref(false)
const detailRecord = ref<HistorialPagoRecord | null>(null)
const detailPage = ref<1 | 2>(1)
const showCancelConfirm = ref(false)
const safeRecord = computed(() => detailRecord.value!)

// ── Más Filtros toggle ────────────────────────────────────────
const showMoreFilters = ref(false)

// ── Integraciones modal ───────────────────────────────────────
const showIntegrationsModal = ref(false)
const integrationRecord = ref<HistorialPagoRecord | null>(null)

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

// ── Dropdown multiselect state ─────────────────────────────────
const showEstadoMenu   = ref(false)
const showPasoMenu     = ref(false)
const showTiendaMenu   = ref(false)
const showCanalMenu    = ref(false)
const estadoSearch     = ref('')
const pasoSearch       = ref('')

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

const filteredEstadoOptions = computed(() =>
  ESTADO_OPTIONS.filter(o => o.label.toLowerCase().includes(estadoSearch.value.toLowerCase()))
)
const filteredPasoOptions = computed(() =>
  PASO_FLUJO_OPTIONS.filter(o => o.label.toLowerCase().includes(pasoSearch.value.toLowerCase()))
)
const filteredTiendaOptions = computed(() =>
  TIENDAS_OPTIONS.filter(o => o.label.toLowerCase().includes(filters.tienda.toLowerCase()))
)

function toggleEstado(value: string) {
  const idx = filters.estados.indexOf(value)
  if (idx === -1) filters.estados.push(value)
  else filters.estados.splice(idx, 1)
}
function toggleAllEstados(checked: boolean) {
  filters.estados = checked ? ESTADO_OPTIONS.map(o => o.value) : []
}
function togglePaso(value: string) {
  const idx = filters.pasosFlujo.indexOf(value)
  if (idx === -1) filters.pasosFlujo.push(value)
  else filters.pasosFlujo.splice(idx, 1)
}
function toggleAllPasos(checked: boolean) {
  filters.pasosFlujo = checked ? PASO_FLUJO_OPTIONS.map(o => o.value) : []
}

function estadoLabel() {
  if (!filters.estados.length) return 'Seleccione el estado'
  if (filters.estados.length === 1)
    return ESTADO_OPTIONS.find(o => o.value === filters.estados[0])?.label ?? ''
  return `${filters.estados.length} seleccionados`
}
function pasoLabel() {
  if (!filters.pasosFlujo.length) return 'Seleccione el paso en flujo'
  if (filters.pasosFlujo.length === 1)
    return PASO_FLUJO_OPTIONS.find(o => o.value === filters.pasosFlujo[0])?.label ?? ''
  return `${filters.pasosFlujo.length} seleccionados`
}

function selectTienda(label: string) {
  filters.tienda = label
  showTiendaMenu.value = false
}

// ── Data ───────────────────────────────────────────────────────
const rows = ref<HistorialPagoRecord[]>(MOCK_HISTORIAL_PAGOS)

const filteredRows = computed(() => filterRows(rows.value, appliedFilters.value))
const selectedRows = computed(() => filteredRows.value.filter((row) => selectedIds.value.includes(row.id)))
const selectedCount = computed(() => selectedRows.value.length)
const allVisibleSelected = computed(() =>
  filteredRows.value.length > 0 && filteredRows.value.every((row) => selectedIds.value.includes(row.id)),
)

const resultsText = computed(() => {
  const count = filteredRows.value.length
  const template = count === 1 ? HISTORIAL_PAGOS_TEXT.resultsFound : HISTORIAL_PAGOS_TEXT.resultsFoundPlural
  return template.replace('{count}', String(count))
})

const exportAllLabel = computed(() =>
  HISTORIAL_PAGOS_TEXT.exportAll.replace('{count}', String(filteredRows.value.length)),
)
const exportSelectedLabel = computed(() =>
  HISTORIAL_PAGOS_TEXT.exportSelected.replace('{count}', String(selectedCount.value)),
)
const isEmptyState = computed(() => !isSearching.value && !fetchError.value && filteredRows.value.length === 0)

function normalizeText(value: string) {
  return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function rowDateOnly(dateTime: string) {
  return dateTime.split(' ')[0] ?? ''
}

function filterRows(items: HistorialPagoRecord[], current: HistorialPagosFilters) {
  return items.filter((item) => {
    if (current.fechaInicio) {
      const start = new Date(`${current.fechaInicio}T00:00:00`)
      const itemDate = new Date(`${rowDateOnly(item.fechaCreacion)}T00:00:00`)
      if (itemDate < start) return false
    }
    if (current.fechaFin) {
      const end = new Date(`${current.fechaFin}T23:59:59`)
      const itemDate = new Date(`${rowDateOnly(item.fechaCreacion)}T23:59:59`)
      if (itemDate > end) return false
    }
    if (current.estados.length && !current.estados.includes(item.estado)) return false
    if (current.pasosFlujo.length) {
      const pasoNorm = normalizeText(item.pasoFlujo)
      const match = current.pasosFlujo.some(p => pasoNorm.includes(normalizeText(p)))
      if (!match) return false
    }
    if (current.canal && item.canal !== current.canal) return false
    if (current.buscarPorValor?.trim()) {
      const val = normalizeText(current.buscarPorValor)
      const campo = current.buscarPorCampo
      if (campo === 'numeroAutorizacion' && !normalizeText(item.numeroAutorizacion).includes(val)) return false
      if (campo === 'voucher'   && !normalizeText(item.voucher).includes(val)) return false
      if (campo === 'deviceTag' && !normalizeText(item.deviceTag).includes(val)) return false
      if (campo === 'imei'      && !normalizeText(item.imei).includes(val)) return false
      if (campo === 'dn'        && !normalizeText(item.dn).includes(val)) return false
      if (!campo && !['numeroAutorizacion','voucher','deviceTag','imei','dn'].some(k => normalizeText(String((item as Record<string,unknown>)[k] ?? '')).includes(val))) return false
    }
    if (current.numeroAutorizacion && !normalizeText(item.numeroAutorizacion).includes(normalizeText(current.numeroAutorizacion))) return false
    if (current.tienda && !normalizeText(item.tienda).includes(normalizeText(current.tienda.replace(/^\d+ - /, '')))) return false
    if (current.usuario && !normalizeText(item.usuario).includes(normalizeText(current.usuario))) return false
    return true
  })
}

function validateFilters() {
  if (!filters.fechaInicio || !filters.fechaFin) return ''
  const start = new Date(`${filters.fechaInicio}T00:00:00`)
  const end = new Date(`${filters.fechaFin}T00:00:00`)
  if (start > end) return HISTORIAL_PAGOS_TEXT.invalidDateRange
  return ''
}

async function handleSearch() {
  fetchError.value = ''
  const validationError = validateFilters()
  if (validationError) { fetchError.value = validationError; toastErro(validationError); return }
  isSearching.value = true
  await new Promise((resolve) => setTimeout(resolve, 320))
  appliedFilters.value = { ...filters, estados: [...filters.estados], pasosFlujo: [...filters.pasosFlujo] }
  selectedIds.value = []
  isSearching.value = false
}

function handleClearFilters() {
  Object.assign(filters, { ...INITIAL_FILTERS, estados: [], pasosFlujo: [] })
  appliedFilters.value = { ...INITIAL_FILTERS, estados: [], pasosFlujo: [] }
  fetchError.value = ''
  selectedIds.value = []
  estadoSearch.value = ''
  pasoSearch.value = ''
  showCanalMenu.value = false
}

function handleToggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  selectedIds.value = checked ? filteredRows.value.map((row) => row.id) : []
}

function formatEstado(value: string) {
  return ESTADO_OPTIONS.find(o => o.value === value)?.label ?? value
}

function exportToCsv(filename: string, records: HistorialPagoRecord[]) {
  const headers = ['numero_autorizacion','id_transaccion','id_red','fecha_creacion','monto','servicio','estado','paso_flujo','tienda','usuario']
  const lines = records.map((r) =>
    [r.numeroAutorizacion, r.idTransaccion, r.idRed, r.fechaCreacion, r.monto, r.servicio, formatEstado(r.estado), r.pasoFlujo, r.tienda, r.usuario]
      .map((v) => { const s = String(v); return (s.includes(',') || s.includes('"')) ? `"${s.replace(/"/g,'""')}"` : s })
      .join(',')
  )
  const csv = ['\ufeff' + headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

function handleExportAll() {
  if (!filteredRows.value.length) { toastAviso(HISTORIAL_PAGOS_TEXT.noResultsDescription); return }
  exportToCsv('historial-pagos.csv', filteredRows.value)
  toastSucesso(HISTORIAL_PAGOS_TEXT.exportAllSuccess)
}

function handleExportSelected() {
  if (!selectedRows.value.length) { toastAviso(HISTORIAL_PAGOS_TEXT.noSelectedWarning); return }
  exportToCsv('historial-pagos-seleccionados.csv', selectedRows.value)
  toastSucesso(HISTORIAL_PAGOS_TEXT.exportSelectedSuccess)
}

function handleOpenDetail(record: HistorialPagoRecord) {
  detailRecord.value = record; detailPage.value = 1; showDetailModal.value = true
}

function handleOpenIntegration(record: HistorialPagoRecord) {
  integrationRecord.value = record
  selectedRoute.value = null
  showIntegrationsModal.value = true
}

function closeIntegrationsModal() {
  showIntegrationsModal.value = false
  selectedRoute.value = null
  integrationRecord.value = null
  integPageSize.value = 10
  integCurrentPage.value = 1
  showAcciones.value = false
}

// ── Integraciones: paginação + Acciones ───────────────────────
const integCurrentPage = ref(1)
const integPageSize    = ref(10)
const showAcciones     = ref(false)

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

const integTotalPages = computed(() =>
  Math.max(1, Math.ceil(INTEGRATION_ROUTES.length / integPageSize.value))
)
const integPagedRoutes = computed(() => {
  const start = (integCurrentPage.value - 1) * integPageSize.value
  return INTEGRATION_ROUTES.slice(start, start + integPageSize.value)
})

function integGoTo(page: number) {
  if (page >= 1 && page <= integTotalPages.value) integCurrentPage.value = page
}
function onIntegPageSizeChange(e: Event) {
  integPageSize.value = Number((e.target as HTMLSelectElement).value)
  integCurrentPage.value = 1
}

function handleRetry() {
  fetchError.value = ''
  handleSearch()
}

function closeDetailModal() {
  showDetailModal.value = false; detailRecord.value = null; detailPage.value = 1; showCancelConfirm.value = false
}

function handleCopyId(id: string) {
  navigator.clipboard.writeText(id).then(() => toastSucesso(HISTORIAL_PAGOS_TEXT.copyIdSuccess)).catch(() => {})
}

function handleRequestCancel() { showCancelConfirm.value = true }

function handleConfirmCancel() {
  if (!detailRecord.value) return
  if (detailRecord.value.estado === 'cancelado') {
    toastAviso(HISTORIAL_PAGOS_TEXT.cancelPaymentAlreadyDone); showCancelConfirm.value = false; return
  }
  detailRecord.value.estado = 'cancelado'; showCancelConfirm.value = false
  toastSucesso(HISTORIAL_PAGOS_TEXT.cancelPaymentSuccess); closeDetailModal()
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && showDetailModal.value) closeDetailModal()
}

onMounted(() => window.addEventListener('keydown', handleEscape))
onUnmounted(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <AppLayout>
    <div class="history-page">
      <header class="history-header" aria-labelledby="historial-title">
        <h1 id="historial-title" class="history-header__title">{{ HISTORIAL_PAGOS_TEXT.title }}</h1>
        <p class="history-header__subtitle">{{ HISTORIAL_PAGOS_TEXT.subtitle }}</p>
      </header>

      <section class="card filters-card" aria-labelledby="filters-title">
        <h2 id="filters-title" class="sr-only">{{ HISTORIAL_PAGOS_TEXT.filtersTitle }}</h2>

        <form class="filters-form" novalidate @submit.prevent="handleSearch">
          <!-- Linha 1: Fecha inicio · Fecha fin · Canal -->
          <div class="filters-grid">
            <div class="field">
              <label class="field__label" for="filter-fecha-inicio">Fecha inicio</label>
              <div class="field__control">
                <input id="filter-fecha-inicio" v-model="filters.fechaInicio" class="field__input" type="date" />
              </div>
            </div>

            <div class="field">
              <label class="field__label" for="filter-fecha-fin">Fecha fin</label>
              <div class="field__control">
                <input id="filter-fecha-fin" v-model="filters.fechaFin" class="field__input" type="date" />
              </div>
            </div>

            <!-- Canal dropdown -->
            <div class="field" @click.stop>
              <label class="field__label">Canal</label>
              <div class="ms-wrap">
                <button class="ms-trigger" type="button" :aria-expanded="showCanalMenu"
                  @click="showCanalMenu = !showCanalMenu; showEstadoMenu = false; showPasoMenu = false; showTiendaMenu = false">
                  <span class="ms-trigger__label">{{ filters.canal ? CANAL_OPTIONS.find(o => o.value === filters.canal)?.label : 'Seleccione el canal' }}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <div v-if="showCanalMenu" class="ms-dropdown ms-dropdown--sm">
                  <div class="ms-option ms-option--single ms-option--clear" @click="filters.canal = ''; showCanalMenu = false">Todos</div>
                  <div v-for="opt in CANAL_OPTIONS" :key="opt.value"
                    class="ms-option ms-option--single"
                    :class="{ 'ms-option--checked': filters.canal === opt.value }"
                    @click="filters.canal = opt.value; showCanalMenu = false">{{ opt.label }}</div>
                </div>
                <div v-if="showCanalMenu" class="ms-backdrop" @click="showCanalMenu = false" />
              </div>
            </div>
          </div>

          <!-- Linha 2: Estado · Buscar por -->
          <div class="filters-grid filters-grid--row2">
            <!-- Estado multiselect -->
            <div class="field">
              <label class="field__label">Estado</label>
              <div class="ms-wrap" @click.stop>
                <button class="ms-trigger" type="button" :aria-expanded="showEstadoMenu" @click="showEstadoMenu = !showEstadoMenu; showPasoMenu = false; showTiendaMenu = false; showCanalMenu = false">
                  <span class="ms-trigger__label">{{ estadoLabel() }}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <div v-if="showEstadoMenu" class="ms-dropdown" role="listbox" aria-multiselectable="true">
                  <div class="ms-search-row">
                    <input v-model="estadoSearch" class="ms-search" type="text" placeholder="Buscar..." aria-label="Buscar estado" @click.stop />
                    <svg class="ms-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4" stroke="#9ca3af" stroke-width="1.3"/><path d="M9.5 9.5L12 12" stroke="#9ca3af" stroke-width="1.3" stroke-linecap="round"/></svg>
                    <input type="checkbox" class="ms-check-all" :checked="filters.estados.length === ESTADO_OPTIONS.length" :indeterminate="filters.estados.length > 0 && filters.estados.length < ESTADO_OPTIONS.length" @change="e => toggleAllEstados((e.target as HTMLInputElement).checked)" aria-label="Seleccionar todo" />
                  </div>
                  <label v-for="opt in filteredEstadoOptions" :key="opt.value" class="ms-option" :class="{ 'ms-option--checked': filters.estados.includes(opt.value) }">
                    <input type="checkbox" :checked="filters.estados.includes(opt.value)" @change="toggleEstado(opt.value)" /> {{ opt.label }}
                  </label>
                </div>
                <div v-if="showEstadoMenu" class="ms-backdrop" @click="showEstadoMenu = false" />
              </div>
            </div>

            <!-- Buscar por: input + select nativo -->
            <div class="field field--buscar">
              <label class="field__label">Buscar por</label>
              <div class="buscar-combo">
                <input
                  v-model="filters.buscarPorValor"
                  class="buscar-combo__input"
                  type="text"
                  placeholder="Introduce el valor"
                  autocomplete="off"
                />
                <div class="buscar-combo__sep" aria-hidden="true" />
                <div class="buscar-combo__select-wrap">
                  <select v-model="filters.buscarPorCampo" class="buscar-combo__select">
                    <option value="">Seleccione</option>
                    <option v-for="opt in BUSCAR_POR_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                  <svg class="buscar-combo__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Toggle Más Filtros -->
          <button class="btn-more-filters" type="button" @click="showMoreFilters = !showMoreFilters">
            {{ showMoreFilters ? '− Menos filtros' : '+ Más filtros' }}
          </button>

          <!-- Linha 3 (expandível): Paso en flujo · Tienda · Usuario -->
          <Transition name="more-filters">
            <div v-if="showMoreFilters" class="filters-grid filters-grid--advanced">
              <div class="field">
                <label class="field__label" for="filter-num-auto">Número de autorización</label>
                <input id="filter-num-auto" v-model="filters.numeroAutorizacion" class="field__input" type="text" placeholder="Ingrese el número" autocomplete="off" />
              </div>

              <!-- Paso en flujo multiselect -->
              <div class="field">
                <label class="field__label">Paso en flujo</label>
                <div class="ms-wrap" @click.stop>
                  <button class="ms-trigger" type="button" :aria-expanded="showPasoMenu" @click="showPasoMenu = !showPasoMenu; showEstadoMenu = false; showTiendaMenu = false; showCanalMenu = false">
                    <span class="ms-trigger__label">{{ pasoLabel() }}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>
                  </button>
                  <div v-if="showPasoMenu" class="ms-dropdown" role="listbox" aria-multiselectable="true">
                    <div class="ms-search-row">
                      <input v-model="pasoSearch" class="ms-search" type="text" placeholder="Buscar..." aria-label="Buscar paso" @click.stop />
                      <svg class="ms-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4" stroke="#9ca3af" stroke-width="1.3"/><path d="M9.5 9.5L12 12" stroke="#9ca3af" stroke-width="1.3" stroke-linecap="round"/></svg>
                      <input type="checkbox" class="ms-check-all" :checked="filters.pasosFlujo.length === PASO_FLUJO_OPTIONS.length" :indeterminate="filters.pasosFlujo.length > 0 && filters.pasosFlujo.length < PASO_FLUJO_OPTIONS.length" @change="e => toggleAllPasos((e.target as HTMLInputElement).checked)" aria-label="Seleccionar todo" />
                    </div>
                    <label v-for="opt in filteredPasoOptions" :key="opt.value" class="ms-option" :class="{ 'ms-option--checked': filters.pasosFlujo.includes(opt.value) }">
                      <input type="checkbox" :checked="filters.pasosFlujo.includes(opt.value)" @change="togglePaso(opt.value)" /> {{ opt.label }}
                    </label>
                  </div>
                  <div v-if="showPasoMenu" class="ms-backdrop" @click="showPasoMenu = false" />
                </div>
              </div>

              <!-- Tienda autocomplete -->
              <div class="field">
                <label class="field__label" for="filter-tienda">Tienda</label>
                <div class="ms-wrap" @click.stop>
                  <div class="field__control field__control--autocomplete">
                    <input id="filter-tienda" v-model="filters.tienda" class="field__input" type="text" placeholder="Tienda" autocomplete="off"
                      @focus="showTiendaMenu = true; showEstadoMenu = false; showPasoMenu = false; showCanalMenu = false"
                      @click.stop />
                    <svg class="field__icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>
                  </div>
                  <div v-if="showTiendaMenu && filteredTiendaOptions.length" class="ms-dropdown ms-dropdown--autocomplete">
                    <div v-for="opt in filteredTiendaOptions" :key="opt.value" class="ms-option ms-option--single" @click="selectTienda(opt.label)">{{ opt.label }}</div>
                  </div>
                  <div v-if="showTiendaMenu" class="ms-backdrop" @click="showTiendaMenu = false" />
                </div>
              </div>

              <div class="field">
                <label class="field__label" for="filter-usuario">Usuario</label>
                <input id="filter-usuario" v-model="filters.usuario" class="field__input" type="text" placeholder="Usuario" autocomplete="off" />
              </div>
            </div>
          </Transition>

          <div class="filters-actions">
            <button class="btn btn--ghost" type="button" @click="handleClearFilters">{{ HISTORIAL_PAGOS_TEXT.clearFilters }}</button>
            <button class="btn btn--primary" type="submit" :disabled="isSearching" :aria-busy="isSearching">
              <svg v-if="!isSearching" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7" />
                <path d="M20 20l-3.2-3.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              </svg>
              <span>{{ isSearching ? HISTORIAL_PAGOS_TEXT.searchLoading : HISTORIAL_PAGOS_TEXT.search }}</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card results-card" aria-labelledby="results-title">
        <div class="results-head">
          <div>
            <h2 id="results-title" class="results-head__title">{{ HISTORIAL_PAGOS_TEXT.resultsTitle }}</h2>
            <p class="results-head__subtitle">{{ resultsText }}</p>
          </div>

          <div class="results-actions">
            <button class="btn btn--success" type="button" @click="handleExportAll">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v12M7 10l5 5 5-5M5 20h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ exportAllLabel }}</span>
            </button>
            <button
              class="btn btn--success-light"
              type="button"
              :disabled="selectedCount === 0"
              @click="handleExportSelected"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v12M7 10l5 5 5-5M5 20h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ exportSelectedLabel }}</span>
            </button>
          </div>
        </div>

        <div v-if="fetchError" class="inline-error" role="alert">
          <div>
            <p class="inline-error__title">{{ HISTORIAL_PAGOS_TEXT.errorTitle }}</p>
            <p class="inline-error__message">{{ fetchError }}</p>
          </div>
          <button class="btn btn--ghost btn--sm" type="button" @click="handleRetry">{{ HISTORIAL_PAGOS_TEXT.retry }}</button>
        </div>

        <div v-else-if="isSearching" class="table-loading" role="status" aria-label="Buscando pagos" aria-busy="true">
          <div class="skeleton skeleton--line skeleton--line-lg" />
          <div class="skeleton skeleton--line" />
          <div class="skeleton skeleton--line" />
        </div>

        <div v-else-if="isEmptyState" class="empty-state">
          <svg class="empty-state__icon" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6" />
            <path d="M16.4 16.4L20 20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <p class="empty-state__title">{{ HISTORIAL_PAGOS_TEXT.noResultsTitle }}</p>
          <p class="empty-state__description">{{ HISTORIAL_PAGOS_TEXT.noResultsDescription }}</p>
          <button class="btn btn--ghost btn--sm" type="button" @click="handleClearFilters">
            {{ HISTORIAL_PAGOS_TEXT.clearFilters }}
          </button>
        </div>

        <div v-else class="table-wrap">
          <table class="results-table" role="table" aria-label="Historial de pagos">
            <thead>
              <tr>
                <th class="results-table__th results-table__th--checkbox">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los resultados"
                    :checked="allVisibleSelected"
                    @change="handleToggleSelectAll"
                  />
                </th>
                <th v-for="column in HISTORIAL_PAGOS_COLUMNS" :key="column" class="results-table__th">
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in filteredRows" :key="record.id" class="results-table__row">
                <td class="results-table__td results-table__td--checkbox">
                  <input
                    v-model="selectedIds"
                    type="checkbox"
                    :value="record.id"
                    :aria-label="`Seleccionar transaccion ${record.idRed}`"
                  />
                </td>
                <td class="results-table__td">{{ record.numeroAutorizacion }}</td>
                <td class="results-table__td">{{ record.idTransaccion }}</td>
                <td class="results-table__td">{{ record.idRed }}</td>
                <td class="results-table__td">{{ record.fechaCreacion }}</td>
                <td class="results-table__td">{{ record.monto }}</td>
                <td class="results-table__td">{{ record.servicio }}</td>
                <td class="results-table__td">
                  <span class="badge badge--estado">{{ formatEstado(record.estado) }}</span>
                </td>
                <td class="results-table__td">
                  <span class="badge badge--flow">{{ record.pasoFlujo }}</span>
                </td>
                <td class="results-table__td">
                  <button class="icon-btn" type="button" aria-label="Ver detalle" @click="handleOpenDetail(record)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" stroke-width="1.6" />
                      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                </td>
                <td class="results-table__td">
                  <button class="icon-btn" type="button" aria-label="Ver integraciones" @click="handleOpenIntegration(record)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="6" cy="12" r="2" stroke="currentColor" stroke-width="1.6" />
                      <circle cx="18" cy="6" r="2" stroke="currentColor" stroke-width="1.6" />
                      <circle cx="18" cy="18" r="2" stroke="currentColor" stroke-width="1.6" />
                      <path d="M8 11l8-4M8 13l8 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <Transition name="detail-modal-fade">
        <div
          v-if="showDetailModal"
          class="detail-modal__backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-modal-title"
          @click.self="closeDetailModal"
        >
          <div class="detail-modal__wrap">
            <!-- Seta esquerda: fora do sheet, lado esquerdo -->
            <button
              v-if="detailRecord && detailPage === 2"
              class="dm-nav-arrow dm-nav-arrow--left"
              type="button"
              aria-label="Ver resumen del pago"
              @click="detailPage = 1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="dm-nav-arrow__tooltip">Resumen</span>
            </button>

          <div class="detail-modal__sheet">
            <!-- Header -->
            <div class="detail-modal__header">
              <h3 id="detail-modal-title" class="detail-modal__title">{{ HISTORIAL_PAGOS_TEXT.detailModalTitle }}</h3>
              <button
                class="detail-modal__close"
                type="button"
                :aria-label="HISTORIAL_PAGOS_TEXT.detailModalClose"
                @click="closeDetailModal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div v-if="detailRecord" class="detail-modal__body">

              <!-- ── PÁGINA 1: Resumen ───────────────────────────── -->
              <template v-if="detailPage === 1">
                <div class="dm-store-header">
                  <p class="dm-store-header__name">{{ detailRecord.storeName }}</p>
                  <p class="dm-store-header__id">{{ HISTORIAL_PAGOS_TEXT.summaryStoreIdLabel }}: {{ detailRecord.storePdvId }}</p>
                </div>

                <div class="dm-summary-section">
                  <div class="dm-summary-row">
                    <span class="dm-summary-label">{{ HISTORIAL_PAGOS_TEXT.summaryDateHour }}</span>
                    <span class="dm-summary-value">{{ detailRecord.fechaCreacion }}</span>
                  </div>
                  <div class="dm-summary-row">
                    <span class="dm-summary-label">{{ HISTORIAL_PAGOS_TEXT.summaryPaymentType }}</span>
                    <span class="dm-summary-value dm-summary-value--bold">{{ detailRecord.tipoPago }}</span>
                  </div>
                  <div class="dm-summary-row">
                    <span class="dm-summary-label">{{ HISTORIAL_PAGOS_TEXT.summaryPaymentMethod }}</span>
                    <span class="dm-summary-value dm-summary-value--bold">{{ detailRecord.formaPago }}</span>
                  </div>
                </div>

                <div class="dm-summary-section">
                  <p class="dm-summary-section__title">{{ HISTORIAL_PAGOS_TEXT.detailSectionTitle }}</p>
                  <div class="dm-summary-row">
                    <span class="dm-summary-label">{{ HISTORIAL_PAGOS_TEXT.summaryDeviceTag }}</span>
                    <span class="dm-summary-value">{{ detailRecord.deviceTag }}</span>
                  </div>
                  <div class="dm-summary-row">
                    <span class="dm-summary-label">{{ HISTORIAL_PAGOS_TEXT.summaryImei }}</span>
                    <span class="dm-summary-value">{{ detailRecord.imei }}</span>
                  </div>
                  <div class="dm-summary-row">
                    <span class="dm-summary-label">{{ HISTORIAL_PAGOS_TEXT.summaryReference }}</span>
                    <span class="dm-summary-value">{{ detailRecord.referencia }}</span>
                  </div>
                </div>

                <div class="dm-summary-section dm-summary-section--total">
                  <div class="dm-summary-row dm-summary-row--total">
                    <span class="dm-summary-total-label">{{ HISTORIAL_PAGOS_TEXT.summaryTotal }}</span>
                    <span class="dm-summary-total-value">{{ detailRecord.monto }}</span>
                  </div>
                  <div class="dm-summary-row">
                    <span class="dm-summary-label">{{ HISTORIAL_PAGOS_TEXT.summaryPaymentMethod }}</span>
                    <span class="dm-summary-value">{{ detailRecord.formaPago }}</span>
                  </div>
                </div>

                <div class="dm-footer dm-footer--center">
                  <button class="btn btn--danger" type="button" @click="handleRequestCancel">
                    {{ HISTORIAL_PAGOS_TEXT.cancelPayment }}
                  </button>
                </div>
              </template>

              <!-- ── PÁGINA 2: Detalles ───────────────────────────── -->
              <template v-else>
                <div class="dm-card">
                  <p class="dm-card__brand">{{ HISTORIAL_PAGOS_TEXT.detailPayjoySection }}</p>
                  <div class="dm-grid">
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailIdTransaccion }}</span>
                      <span class="dm-field__value">{{ safeRecord.idTransaccion }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailNumeroAutorizacion }}</span>
                      <span class="dm-field__value">{{ safeRecord.numeroAutorizacion }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailFechaPago }}</span>
                      <span class="dm-field__value">{{ safeRecord.fechaPago }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailFechaCreacion }}</span>
                      <span class="dm-field__value">{{ safeRecord.fechaCreacion }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailMonto }}</span>
                      <span class="dm-field__value">{{ safeRecord.monto }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailServicio }}</span>
                      <span class="dm-field__value">{{ safeRecord.servicio }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailProducto }}</span>
                      <span class="dm-field__value">{{ safeRecord.producto }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailEstado }}</span>
                      <span class="dm-field__value">{{ formatEstado(safeRecord.estado) }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailPasoFlujo }}</span>
                      <span class="dm-field__value">{{ safeRecord.pasoFlujo }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailUsuario }}</span>
                      <span class="dm-field__value">{{ safeRecord.usuario }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailIdDelPago }}</span>
                      <span class="dm-field__value dm-field__value--copy">
                        {{ safeRecord.idDelPago }}
                        <button class="dm-copy-btn" type="button" aria-label="Copiar ID del pago" @click="handleCopyId(safeRecord.idDelPago)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <rect x="8" y="8" width="12" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/>
                            <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                          </svg>
                        </button>
                      </span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailTienda }}</span>
                      <span class="dm-field__value">{{ safeRecord.tienda }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="safeRecord.catalina" class="dm-card">
                  <p class="dm-card__brand">{{ HISTORIAL_PAGOS_TEXT.detailCatalinaSection }}</p>
                  <div class="dm-grid">
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailFechaEnvio }}</span>
                      <span class="dm-field__value">{{ safeRecord.catalina!.fechaEnvio }}</span>
                    </div>
                    <div class="dm-field">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailEstadoCatalina }}</span>
                      <span class="dm-field__value">{{ safeRecord.catalina!.estado }}</span>
                    </div>
                    <div class="dm-field dm-field--full">
                      <span class="dm-field__label">{{ HISTORIAL_PAGOS_TEXT.detailInfoAdicional }}</span>
                      <span class="dm-field__value">{{ safeRecord.catalina!.informacionAdicional }}</span>
                    </div>
                  </div>
                </div>

              </template>

              <!-- ── Diálogo de confirmação de cancelamento ───────── -->
              <Transition name="dm-confirm-fade">
                <div v-if="showCancelConfirm" class="dm-confirm__backdrop" role="alertdialog" aria-modal="true" aria-labelledby="cancel-confirm-title" @click.self="showCancelConfirm = false">
                  <div class="dm-confirm__card">
                    <div class="dm-confirm__icon" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="var(--color-danger)" stroke-width="1.8"/>
                        <path d="M15 9l-6 6M9 9l6 6" stroke="var(--color-danger)" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                    <h4 id="cancel-confirm-title" class="dm-confirm__title">Cancelar pago</h4>
                    <p class="dm-confirm__message">¿Está seguro de que desea cancelar este pago?</p>
                    <p class="dm-confirm__warning">Esta acción no puede deshacerse.</p>
                    <div class="dm-confirm__actions">
                      <button class="btn btn--outline" type="button" @click="showCancelConfirm = false">Cancelar</button>
                      <button class="btn btn--danger" type="button" @click="() => handleConfirmCancel()">Sí, cancelar</button>
                    </div>
                  </div>
                </div>
              </Transition>

            </div>
          </div>

            <!-- Seta direita: fora do sheet, lado direito -->
            <button
              v-if="detailRecord && detailPage === 1"
              class="dm-nav-arrow dm-nav-arrow--right"
              type="button"
              aria-label="Ver detalles del pago"
              @click="detailPage = 2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="dm-nav-arrow__tooltip">Detalles</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Integraciones Modal ─────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="integ-fade">
        <div
          v-if="showIntegrationsModal && integrationRecord"
          class="hv2-confirm__backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="integ-modal-title"
          @click.self="closeIntegrationsModal"
        >
          <div class="hv2-integration__card">
            <!-- Header com botão Acciones -->
            <div class="hv2-integration__header">
              <button class="integ-back-btn" type="button" @click="closeIntegrationsModal">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Volver
              </button>
              <div class="integ-acciones-wrap" @click.stop>
                <button class="integ-acciones-btn" type="button" :aria-expanded="showAcciones" @click="showAcciones = !showAcciones">
                  Acciones
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
                <div v-if="showAcciones" class="integ-acciones-menu">
                  <button class="integ-acciones-item" type="button" @click="showAcciones = false">Exportar CSV</button>
                  <button class="integ-acciones-item" type="button" @click="showAcciones = false">Reenviar</button>
                  <button class="integ-acciones-item integ-acciones-item--danger" type="button" @click="showAcciones = false">Cancelar pago</button>
                </div>
                <div v-if="showAcciones" class="ms-backdrop" @click="showAcciones = false" />
              </div>
            </div>

            <!-- Info do registro -->
            <div class="hv2-integration__info">
              <p class="integ-info__store"><strong>ID PDV: {{ integrationRecord.storeName }}</strong></p>
              <p>Fecha/hora: {{ integrationRecord.fechaCreacion }}</p>
              <p>ID del pago: {{ integrationRecord.idDelPago || '—' }}</p>
              <p>Número de autorización: {{ integrationRecord.numeroAutorizacion || '—' }}</p>
              <p>ID transacción: {{ integrationRecord.idTransaccion || '—' }}</p>
              <p>Estado: {{ formatEstado(integrationRecord.estado) }}</p>
              <p>Paso en flujo: {{ integrationRecord.pasoFlujo }}</p>
            </div>

            <!-- Tabela de rotas -->
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
                    v-for="(route, idx) in integPagedRoutes"
                    :key="idx"
                    class="hv2-integration__tr hv2-integration__tr--clickable"
                    tabindex="0"
                    :aria-label="`Ver detalle de ${route.ruta}`"
                    @click="selectedRoute = route"
                    @keydown.enter="selectedRoute = route"
                  >
                    <td class="hv2-integration__td hv2-integration__td--link">{{ route.ruta }}</td>
                    <td class="hv2-integration__td">{{ integrationRecord.fechaCreacion }}</td>
                    <td class="hv2-integration__td">{{ integrationRecord.fechaCreacion }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginação -->
            <div class="integ-pagination">
              <div class="integ-pagination__controls">
                <button class="integ-pg-btn" type="button" :disabled="integCurrentPage === 1" aria-label="Primera página" @click="integGoTo(1)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M9 3L4 7l5 4M5 3v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button class="integ-pg-btn" type="button" :disabled="integCurrentPage === 1" aria-label="Página anterior" @click="integGoTo(integCurrentPage - 1)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M9 3L4 7l5 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <span class="integ-pg-num">{{ integCurrentPage }}</span>
                <button class="integ-pg-btn" type="button" :disabled="integCurrentPage === integTotalPages" aria-label="Página siguiente" @click="integGoTo(integCurrentPage + 1)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5 3l5 4-5 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button class="integ-pg-btn" type="button" :disabled="integCurrentPage === integTotalPages" aria-label="Última página" @click="integGoTo(integTotalPages)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5 3l5 4-5 4M9 3v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
              <div class="integ-pagination__size">
                <select :value="integPageSize" class="integ-pg-select" @change="onIntegPageSizeChange">
                  <option v-for="s in PAGE_SIZE_OPTIONS" :key="s" :value="s">{{ s }}</option>
                </select>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true" style="pointer-events:none;position:absolute;right:8px;top:50%;transform:translateY(-50%)"><path d="M3 5l4 4 4-4" stroke="#6b7280" stroke-width="1.4" stroke-linecap="round"/></svg>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Sub-modal: Detalle de Ruta ─────────────────────────── -->
    <Teleport to="body">
      <Transition name="integ-fade">
        <div
          v-if="selectedRoute"
          class="hv2-confirm__backdrop"
          role="dialog"
          aria-modal="true"
          @click.self="selectedRoute = null"
        >
          <div class="hv2-route__card">
            <div class="hv2-route__header">
              <h3 class="hv2-route__title">{{ selectedRoute.ruta }}</h3>
              <button class="hv2__sp-close" type="button" aria-label="Cerrar" @click="selectedRoute = null">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
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
  </AppLayout>
</template>

<style scoped>
.history-page {
  max-width: 71.25rem;
  margin: 0 auto;
  display: grid;
  gap: 1.5rem;
}

.history-header {
  display: grid;
  gap: 0.25rem;
}

.history-header__title {
  font-size: 2rem;
  line-height: 1.2;
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--color-gray-900);
}

.history-header__subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.filters-card,
.results-card {
  padding: 1.25rem;
}

.filters-form {
  display: grid;
  gap: 1rem;
}

.filters-grid {
  display: grid;
  gap: 0.875rem;
  grid-template-columns: 1fr;
}

.field {
  display: grid;
  gap: 0.375rem;
}

.field__label {
  font-size: 0.875rem;
  color: var(--color-text-label);
  font-weight: 600;
}

.field__control {
  position: relative;
}

.field__input {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0 0.75rem;
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  font-family: var(--font-body);
}

.field__input::placeholder {
  color: var(--color-text-secondary);
}

.field__input:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 1px;
}

.field__control--date .field__input,
.field__control--select .field__input {
  padding-right: 2rem;
}

.field__input--select {
  appearance: none;
}

.field__icon {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.search-by {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

/* ── Multiselect / Autocomplete ──────────────────────────── */
.ms-wrap { position: relative; }
.ms-trigger {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  width: 100%; height: 2.5rem; padding: 0 0.75rem;
  border: 1px solid var(--color-border, #d1d5db); border-radius: var(--radius-sm, 6px);
  background: #fff; font-size: 0.875rem; color: var(--color-text-primary, #374151);
  cursor: pointer; text-align: left;
}
.ms-trigger:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 1px; }
.ms-trigger__label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ms-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  z-index: 300; background: #fff;
  border: 1px solid var(--color-border, #d1d5db); border-radius: 8px;
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
.ms-option--checked { color: var(--color-brand, #019df4); font-weight: 500; }
.ms-option--single { cursor: pointer; border-radius: 0; }
.ms-option input[type="checkbox"] { width: 15px; height: 15px; accent-color: var(--color-brand, #019df4); flex-shrink: 0; }
.ms-backdrop { position: fixed; inset: 0; z-index: 299; }
.field__control--autocomplete { position: relative; }

.filters-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.btn-more-filters {
  display: inline-flex; align-items: center; gap: 6px;
  height: 2rem; padding: 0;
  border: none; background: none;
  font-size: 0.875rem; font-weight: 500; color: var(--color-brand, #019df4);
  cursor: pointer; font-family: inherit;
}
.btn-more-filters:hover { text-decoration: underline; }

.filters-grid--row2 { grid-template-columns: 1fr 2fr; }
.filters-grid--advanced { grid-template-columns: 1fr 1fr 1fr 1fr; }

/* Buscar combo */
.field--buscar .buscar-combo {
  display: flex; align-items: stretch;
  border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden;
}
.field--buscar .buscar-combo:focus-within { border-color: var(--color-brand, #019df4); }
.buscar-combo__input {
  flex: 1; min-height: 2.75rem; padding: 0 12px; border: none;
  font-size: 0.875rem; color: var(--color-text-primary); font-family: inherit;
  outline: none; min-width: 0; background: #fff;
}
.buscar-combo__sep { width: 1px; background: var(--color-border); flex-shrink: 0; }
.buscar-combo__select-wrap { position: relative; flex-shrink: 0; }
.buscar-combo__select {
  min-height: 2.75rem; padding: 0 30px 0 12px; border: none;
  background: var(--color-gray-50, #f9fafb);
  font-size: 0.875rem; color: var(--color-text-primary); font-family: inherit;
  appearance: none; outline: none; cursor: pointer;
}
.buscar-combo__select:focus { background: var(--color-gray-100, #f3f4f6); }
.buscar-combo__chevron {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  pointer-events: none; color: #6b7280;
}

/* Canal dropdown */
.ms-dropdown--sm { min-width: 180px; }
.ms-option--clear { color: #9ca3af; font-style: italic; }
.ms-option--single:hover { background: #f3f4f6; }

/* Transição más filtros */
.more-filters-enter-active, .more-filters-leave-active { transition: opacity 0.15s; }
.more-filters-enter-from, .more-filters-leave-to { opacity: 0; }

.filters-actions .btn {
  min-height: 2.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn--success {
  background: var(--color-action-500);
  color: var(--color-bg-card);
}

.btn--success:hover:not(:disabled) {
  background: var(--color-action-600);
}

.btn--success:focus-visible,
.btn--success-light:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}

.btn--success-light {
  background: var(--color-action-50);
  color: var(--color-action-600);
}

.btn--success-light:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--outline {
  background: transparent;
  color: var(--color-brand);
  border: 1.5px solid var(--color-brand);
  border-radius: var(--radius-sm);
  padding: 0.5rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn--outline:hover {
  background: var(--color-brand-light);
}

.btn--outline:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}

.btn--danger {
  background: var(--color-danger);
  color: var(--color-bg-card);
}

.btn--danger:hover:not(:disabled) {
  opacity: 0.92;
}

.btn--danger:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}

.results-head {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 1rem;
}

.results-head__title {
  font-size: 1.5rem;
  line-height: 1.2;
  font-family: var(--font-heading);
  color: var(--color-gray-900);
}

.results-head__subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.results-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.inline-error {
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  padding: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.inline-error__title {
  color: var(--color-danger);
  font-weight: 700;
  margin-bottom: 0.125rem;
}

.inline-error__message {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.table-loading {
  display: grid;
  gap: 0.625rem;
}

.skeleton {
  border-radius: var(--radius-sm);
  background: var(--color-gray-200);
  animation: pulse 1.2s ease-in-out infinite;
}

.skeleton--line {
  height: 2rem;
}

.skeleton--line-lg {
  height: 2.5rem;
}

.empty-state {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  text-align: center;
  padding: 1.5rem 1rem;
  display: grid;
  justify-items: center;
  gap: 0.5rem;
}

.empty-state__icon {
  color: var(--color-text-secondary);
}

.empty-state__title {
  color: var(--color-text-primary);
  font-weight: 700;
}

.empty-state__description {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  max-width: 34rem;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.results-table {
  width: 100%;
  min-width: 62.5rem;
  border-collapse: collapse;
}

.results-table__th,
.results-table__td {
  padding: 0.75rem 0.625rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.results-table__th {
  background: var(--color-gray-50);
  color: var(--color-text-secondary);
  font-weight: 700;
}

.results-table__th--checkbox,
.results-table__td--checkbox {
  width: 2.75rem;
  text-align: center;
}

.results-table input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-brand);
}

.badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  padding: 0 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge--estado,
.badge--flow {
  background: var(--color-action-50);
  color: var(--color-action-600);
}

.icon-btn {
  width: 2.75rem;
  height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-brand);
  cursor: pointer;
}

.icon-btn:hover {
  background: var(--color-brand-light);
}

.icon-btn:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}

.detail-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Wrapper para posicionar setas ao lado do sheet */
.detail-modal__sheet {
  max-height: calc(100vh - 2rem);
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 37rem;
  max-width: calc(100vw - 100px);
}

.detail-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-bg-card);
}

.detail-modal__title {
  font-family: var(--font-body);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.detail-modal__close {
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

.detail-modal__close:hover {
  background: var(--color-gray-100);
}

.detail-modal__close:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}

.detail-modal__body {
  padding: 1.25rem 1.5rem 1.5rem;
  display: grid;
  gap: 1rem;
}

/* ── Card interno (PAYJOY / CATALINA) ── */
.dm-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.dm-card__brand {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: 1rem;
}

/* ── Grid 2 colunas ── */
.dm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 2rem;
}

.dm-field {
  display: grid;
  gap: 0.2rem;
}

.dm-field--full {
  grid-column: span 2;
}

.dm-field__label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-gray-900, #212529);
  text-transform: uppercase;
}

.dm-field__value {
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  word-break: break-word;
}

.dm-field__value--copy {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.dm-field__value--total {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.dm-footer {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0 0.25rem;
}

.dm-footer--center { justify-content: center; }

/* Wrapper: posição relativa para ancorar as setas */
.detail-modal__wrap {
  position: relative;
}

.detail-modal__sheet {
  max-height: calc(100vh - 2rem);
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 37rem;
  max-width: calc(100vw - 120px);
}

/* Setas sobrepostas na borda do modal */
.dm-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px; height: 40px;
  border-radius: 50%;
  background: #2196f3;
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 10px rgba(33,150,243,0.4);
  transition: background 0.15s;
  z-index: 20;
}
.dm-nav-arrow:hover { background: #1976d2; }
.dm-nav-arrow:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.dm-nav-arrow--right { right: -20px; }
.dm-nav-arrow--left  { left: -20px; }
.dm-nav-arrow__tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%; transform: translateX(-50%);
  background: #1e293b; color: #fff;
  font-size: 11px; white-space: nowrap;
  padding: 3px 8px; border-radius: 4px;
  pointer-events: none; opacity: 0;
  transition: opacity 0.15s;
}
.dm-nav-arrow:hover .dm-nav-arrow__tooltip { opacity: 1; }

.dm-footer__next {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--color-brand);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.5rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.dm-footer__next:hover {
  background: var(--color-action-600);
}

.dm-footer__next:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}

/* ── Pager (tabs) ── */
.dm-pager {
  display: flex;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.dm-pager__tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-right: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.13s, color 0.13s;
}

.dm-pager__tab:last-child {
  border-right: none;
}

.dm-pager__tab:hover {
  background: var(--color-gray-50);
  color: var(--color-text-primary);
}

.dm-pager__tab--active {
  background: var(--color-brand);
  color: #fff;
  font-weight: 700;
}

.dm-pager__tab--active:hover {
  background: var(--color-action-600);
  color: #fff;
}

.dm-pager__tab:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: -2px;
}

/* ── Resumen page ── */
.dm-store-header {
  text-align: center;
  padding: 0.5rem 0 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.dm-store-header__name {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
}

.dm-store-header__id {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.dm-summary-section {
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.dm-summary-section--total {
  border-bottom: none;
}

.dm-summary-section__title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.dm-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.dm-summary-row--total {
  align-items: flex-end;
}

.dm-summary-label {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.dm-summary-value {
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  text-align: right;
}

.dm-summary-value--bold {
  font-weight: 700;
}

.dm-summary-total-label {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
}

.dm-summary-total-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  line-height: 1.1;
}

/* ── Footer actions group ── */
.dm-footer__actions {
  display: flex;
  gap: 0.625rem;
  align-items: center;
}

/* ── Diálogo de confirmação ── */
.dm-confirm__backdrop {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.dm-confirm__card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  width: 100%;
  max-width: 22rem;
  display: grid;
  gap: 0.5rem;
  text-align: center;
  box-shadow: var(--shadow-card);
}

.dm-confirm__icon {
  display: flex;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.dm-confirm__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.dm-confirm__message {
  font-size: 0.9375rem;
  color: var(--color-text-primary);
}

.dm-confirm__warning {
  font-size: 0.875rem;
  color: var(--color-brand);
}

.dm-confirm__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.dm-confirm-fade-enter-active,
.dm-confirm-fade-leave-active {
  transition: opacity 0.15s ease;
}

.dm-confirm-fade-enter-from,
.dm-confirm-fade-leave-to {
  opacity: 0;
}

.dm-copy-btn {
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-brand);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dm-copy-btn:hover {
  background: var(--color-brand-light);
}

.dm-copy-btn:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}

.detail-modal-fade-enter-active,
.detail-modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.detail-modal-fade-enter-from,
.detail-modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 36rem) {
  .detail-modal__sheet {
    max-width: 100%;
  }

  .dm-grid {
    grid-template-columns: 1fr;
  }

  .dm-field--full {
    grid-column: span 1;
  }
}

@media (min-width: 48rem) {
  .filters-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .field--search-by {
    grid-column: span 2;
  }

  .search-by {
    grid-template-columns: 1fr minmax(0, 10.5rem);
  }

  .results-head {
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
  }
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 0.7;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Integraciones Modal (classes compartilhadas com V2) ─── */
.hv2-confirm__backdrop {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.hv2-integration__card {
  background: #fff; border-radius: 12px;
  width: 720px; max-width: 96vw; max-height: 86vh;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
}
.hv2-integration__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid #e5e7eb;
}

/* Botão Volver */
.integ-back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 12px;
  border: 1px solid #d1d5db; border-radius: 6px;
  background: #fff; font-size: 13px; font-weight: 500; color: #374151;
  cursor: pointer; font-family: inherit;
}
.integ-back-btn:hover { background: #f9fafb; }

/* Botão Acciones dropdown */
.integ-acciones-wrap { position: relative; }
.integ-acciones-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 14px;
  border-radius: 6px; border: none;
  background: #2196f3; color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
}
.integ-acciones-btn:hover { background: #1976d2; }
.integ-acciones-menu {
  position: absolute; right: 0; top: calc(100% + 4px);
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  min-width: 160px; z-index: 50; overflow: hidden;
}
.integ-acciones-item {
  display: block; width: 100%; text-align: left;
  padding: 10px 16px; border: none; background: none;
  font-size: 13px; color: #374151; cursor: pointer; font-family: inherit;
}
.integ-acciones-item:hover { background: #f9fafb; }
.integ-acciones-item--danger { color: #dc2626; }
.integ-acciones-item--danger:hover { background: #fef2f2; }

.hv2-integration__info {
  padding: 12px 20px; border-bottom: 1px solid #f3f4f6;
  display: flex; flex-direction: column; gap: 3px;
  font-size: 13px; color: #374151;
}
.hv2-integration__info p { margin: 0; }
.integ-info__store { font-weight: 600; color: #111827; }

.hv2-integration__table-wrap { flex: 1; overflow-y: auto; }
.hv2-integration__table { width: 100%; border-collapse: collapse; }
.hv2-integration__th {
  padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;
  border-bottom: 2px solid #e5e7eb; background: #f9fafb; white-space: nowrap;
}
.hv2-integration__tr { border-bottom: 1px solid #f3f4f6; }
.hv2-integration__tr:nth-child(even) { background: #f9fafb; }
.hv2-integration__tr--clickable { cursor: pointer; transition: background 0.13s; }
.hv2-integration__tr--clickable:hover { background: #eff6ff; }
.hv2-integration__tr--clickable:focus { outline: 2px solid #2196f3; outline-offset: -2px; }
.hv2-integration__td { padding: 12px 16px; font-size: 13px; color: #374151; }
.hv2-integration__td--link { color: #2196f3; font-weight: 500; }

/* Paginação */
.integ-pagination {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 14px 20px; border-top: 1px solid #e5e7eb;
}
.integ-pagination__controls { display: flex; align-items: center; gap: 4px; }
.integ-pg-btn {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border: 1px solid #d1d5db; border-radius: 6px; background: #fff;
  color: #374151; cursor: pointer; transition: background 0.13s;
}
.integ-pg-btn:hover:not(:disabled) { background: #f3f4f6; }
.integ-pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.integ-pg-num {
  min-width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; background: #2196f3; color: #fff;
  font-size: 13px; font-weight: 600;
}
.integ-pagination__size { position: relative; }
.integ-pg-select {
  height: 30px; padding: 0 28px 0 10px; border: 1px solid #d1d5db; border-radius: 6px;
  background: #fff; font-size: 13px; color: #374151; font-family: inherit;
  appearance: none; outline: none; cursor: pointer;
}
.hv2-route__card {
  background: #fff; border-radius: 12px;
  width: 680px; max-width: 96vw; max-height: 86vh;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.22);
}
.hv2-route__header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px; padding: 16px 20px; border-bottom: 1px solid #e5e7eb;
}
.hv2-route__title { font-size: 14px; font-weight: 700; margin: 0; color: #111827; word-break: break-all; }
.hv2-route__body {
  flex: 1; overflow-y: auto; padding: 16px 20px;
  display: flex; flex-direction: column; gap: 12px;
}
.hv2-route__section-label { font-size: 15px; font-weight: 600; margin: 0 0 8px; color: #374151; }
.hv2-route__code-wrap {
  overflow-x: auto; background: #f9fafb;
  border: 1px solid #e5e7eb; border-radius: 6px;
}
.hv2-route__code {
  margin: 0; padding: 14px 16px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px; line-height: 1.6; color: #1e293b; white-space: pre;
}
.hv2-route__footer {
  display: flex; justify-content: flex-end;
  padding: 12px 20px; border-top: 1px solid #e5e7eb;
}

.integ-fade-enter-active, .integ-fade-leave-active { transition: opacity 0.2s ease; }
.integ-fade-enter-from, .integ-fade-leave-to { opacity: 0; }
</style>
