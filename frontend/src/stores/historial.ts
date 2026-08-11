import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  INITIAL_FILTERS,
  MOCK_HISTORIAL_PAGOS,
  ESTADO_OPTIONS,
  PASO_FLUJO_OPTIONS,
  type HistorialPagoRecord,
  type HistorialPagosFilters,
} from '@/constants/historialPagos'

export const useHistorialStore = defineStore('historial', () => {
  // ── Filtros ──────────────────────────────────────────────────
  const filters = ref<HistorialPagosFilters>({ ...INITIAL_FILTERS, estados: [], pasosFlujo: [] })
  const appliedFilters = ref<HistorialPagosFilters>({ ...INITIAL_FILTERS, estados: [], pasosFlujo: [] })

  // ── Dados ────────────────────────────────────────────────────
  const rows = ref<HistorialPagoRecord[]>(MOCK_HISTORIAL_PAGOS)
  const isSearching = ref(false)
  const fetchError = ref('')
  const selectedIds = ref<string[]>([])

  // ── UI state ─────────────────────────────────────────────────
  const showMoreFilters = ref(false)

  // ── Computed ─────────────────────────────────────────────────
  function normalizeText(v: string) {
    return v.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  function rowDateOnly(dateTime: string) {
    return dateTime.split(' ')[0] ?? ''
  }

  const filteredRows = computed(() => {
    const f = appliedFilters.value
    return rows.value.filter((item) => {
      if (f.fechaInicio) {
        const start = new Date(`${f.fechaInicio}T00:00:00`)
        const itemDate = new Date(`${rowDateOnly(item.fechaCreacion)}T00:00:00`)
        if (itemDate < start) return false
      }
      if (f.fechaFin) {
        const end = new Date(`${f.fechaFin}T23:59:59`)
        const itemDate = new Date(`${rowDateOnly(item.fechaCreacion)}T23:59:59`)
        if (itemDate > end) return false
      }
      if (f.estados.length && !f.estados.includes(item.estado)) return false
      if (f.pasosFlujo.length) {
        const pasoNorm = normalizeText(item.pasoFlujo)
        if (!f.pasosFlujo.some(p => pasoNorm.includes(normalizeText(p)))) return false
      }
      if (f.numeroAutorizacion && !normalizeText(item.numeroAutorizacion).includes(normalizeText(f.numeroAutorizacion))) return false
      if (f.tienda && !normalizeText(item.tienda).includes(normalizeText(f.tienda.replace(/^\d+ - /, '')))) return false
      if (f.usuario && !normalizeText(item.usuario).includes(normalizeText(f.usuario))) return false
      return true
    })
  })

  const selectedRows = computed(() =>
    filteredRows.value.filter(r => selectedIds.value.includes(r.id))
  )
  const allVisibleSelected = computed(() =>
    filteredRows.value.length > 0 && filteredRows.value.every(r => selectedIds.value.includes(r.id))
  )

  function formatEstado(value: string) {
    return ESTADO_OPTIONS.find(o => o.value === value)?.label ?? value
  }

  // ── Actions ──────────────────────────────────────────────────
  async function search() {
    if (!filters.value.fechaInicio || !filters.value.fechaFin) return
    const start = new Date(`${filters.value.fechaInicio}T00:00:00`)
    const end = new Date(`${filters.value.fechaFin}T00:00:00`)
    if (start > end) {
      fetchError.value = 'La fecha de inicio no puede ser mayor a la fecha de fin'
      return
    }
    fetchError.value = ''
    isSearching.value = true
    await new Promise(r => setTimeout(r, 320))
    appliedFilters.value = {
      ...filters.value,
      estados: [...filters.value.estados],
      pasosFlujo: [...filters.value.pasosFlujo],
    }
    selectedIds.value = []
    isSearching.value = false
  }

  function clearFilters() {
    filters.value = { ...INITIAL_FILTERS, estados: [], pasosFlujo: [] }
    appliedFilters.value = { ...INITIAL_FILTERS, estados: [], pasosFlujo: [] }
    fetchError.value = ''
    selectedIds.value = []
  }

  function toggleSelectAll(checked: boolean) {
    selectedIds.value = checked ? filteredRows.value.map(r => r.id) : []
  }

  function toggleSelectRow(id: string) {
    const idx = selectedIds.value.indexOf(id)
    if (idx === -1) selectedIds.value.push(id)
    else selectedIds.value.splice(idx, 1)
  }

  function cancelRecord(id: string) {
    const record = rows.value.find(r => r.id === id)
    if (record) record.estado = 'cancelado'
  }

  function exportToCsv(filename: string, records: HistorialPagoRecord[]) {
    const headers = ['numero_autorizacion', 'id_transaccion', 'id_red', 'fecha_creacion', 'monto', 'servicio', 'estado', 'paso_flujo', 'tienda', 'usuario']
    const lines = records.map(r =>
      [r.numeroAutorizacion, r.idTransaccion, r.idRed, r.fechaCreacion, r.monto, r.servicio, formatEstado(r.estado), r.pasoFlujo, r.tienda, r.usuario]
        .map(v => { const s = String(v); return (s.includes(',') || s.includes('"')) ? `"${s.replace(/"/g, '""')}"` : s })
        .join(',')
    )
    const csv = ['\ufeff' + headers.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  return {
    filters, appliedFilters, rows, isSearching, fetchError,
    selectedIds, showMoreFilters,
    filteredRows, selectedRows, allVisibleSelected,
    search, clearFilters, toggleSelectAll, toggleSelectRow,
    cancelRecord, exportToCsv, formatEstado,
    ESTADO_OPTIONS, PASO_FLUJO_OPTIONS,
  }
})
