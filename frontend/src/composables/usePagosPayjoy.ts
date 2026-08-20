import { ref, reactive } from 'vue'
import { buscarVentaInicial, buscarVentaParcial, registrarPago } from '@/api/useApiPagos'
import { useToastUtils } from '@/composables/useToast'
import { useErrorHandler } from '@/composables/useErrorHandler'
import type { DispositivoResponse, OpcionPagoResponse } from '@/services/pagos.types'

// ── Tipos locais (mantidos para compatibilidade com os componentes) ─────────

export type TipoPago = 'inicial' | 'parcial'
export type TipoCobro = 'financiamiento' | 'otro'
export type BuscarPor = 'DN' | 'DeviceTag' | 'IMEI'
export type FormaPago = 'efectivo' | 'tarjeta'

export interface FormaPagoStep1Inicial {
  voucher: string
  primerNombre: string
  segundoNombre: string
  primerApellido: string
  segundoApellido: string
}

export interface FormaPagoStep1Parcial {
  tipoCobro: TipoCobro | ''
  buscarPor: BuscarPor | ''
  valorBusqueda: string
}

export interface DispositivoDetalle {
  deviceTag: string
  imei: string
  dn: string
}

export type OpcionPagoId = string

export interface OpcionPago {
  id: string
  label: string
  description: string
  monto: number
}

export interface ResumenVenta {
  identificacion: string
  descripcion: string
  valor: number
}

// ── Estado global do fluxo ─────────────────────────────────────────────────

const currentStep = ref<1 | 2 | 3>(1)

const tipoPago = ref<TipoPago>('inicial')

const formInicial = reactive<FormaPagoStep1Inicial>({
  voucher: '',
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
})

const formParcial = reactive<FormaPagoStep1Parcial>({
  tipoCobro: 'financiamiento',
  buscarPor: '',
  valorBusqueda: '',
})

// Resultado da busca (preenchido pela API)
const ventaId = ref<string>('')
const ventaDescripcion = ref<string>('')
const ventaTotal = ref<number>(0)
const valorPagoInicial = ref<number>(0)
const dispositivo = ref<DispositivoResponse | null>(null)
const opcionesPago = ref<OpcionPago[]>([])
const opcionSeleccionada = ref<string | null>(null)

const resumenVenta = ref<ResumenVenta | null>(null)
const formaPagoFinal = ref<FormaPago>('tarjeta')
const confirmacionPago = ref(false)

const showConfirmModal = ref(false)
const transaccionId = ref('')
const transaccionFecha = ref('')

const formTarjeta = reactive({
  tipo: '' as 'debito' | 'credito' | '',
  marca: '' as 'mastercard' | 'visa' | 'amex' | 'other' | '',
  ultimos4: '',
  autorizacion: '',
})

// ── Loading states ─────────────────────────────────────────────────────────

const isLoadingBuscar  = ref(false)
const isLoadingGuardar = ref(false)

// ── Acciones ───────────────────────────────────────────────────────────────

async function buscarVenta() {
  const { toastErro } = useToastUtils()
  const { causeOf }   = useErrorHandler()

  isLoadingBuscar.value = true
  try {
    let venta
    if (tipoPago.value === 'inicial') {
      venta = await buscarVentaInicial({
        voucher:         formInicial.voucher,
        primerNombre:    formInicial.primerNombre,
        segundoNombre:   formInicial.segundoNombre || undefined,
        primerApellido:  formInicial.primerApellido,
        segundoApellido: formInicial.segundoApellido || undefined,
      })
    } else {
      venta = await buscarVentaParcial({
        tipoCobro:     formParcial.tipoCobro as string,
        buscarPor:     formParcial.buscarPor as BuscarPor,
        valorBusqueda: formParcial.valorBusqueda,
      })
    }

    ventaId.value           = venta.id
    ventaDescripcion.value  = venta.descripcion ?? ''
    ventaTotal.value        = venta.valor ?? 0
    valorPagoInicial.value  = venta.valorPagoInicial ?? 0
    dispositivo.value       = venta.dispositivo
    opcionesPago.value = venta.opcionesPago.map((op: OpcionPagoResponse) => ({
      id:          op.id,
      label:       op.label,
      description: op.description ?? '',
      monto:       op.monto,
    }))

    currentStep.value = 2
  } catch (error) {
    toastErro(causeOf(error))
  } finally {
    isLoadingBuscar.value = false
  }
}

function seleccionarOpcion(id: string) {
  opcionSeleccionada.value = id
}

function aceptarPago() {
  if (tipoPago.value === 'inicial') {
    resumenVenta.value = {
      identificacion: formInicial.voucher,
      descripcion:    ventaDescripcion.value,
      valor:          valorPagoInicial.value,
    }
    currentStep.value = 3
    return
  }
  const opcion = opcionesPago.value.find(o => o.id === opcionSeleccionada.value)
  if (!opcion) return
  resumenVenta.value = {
    identificacion: dispositivo.value?.imei ?? '',
    descripcion:    opcion.label,
    valor:          opcion.monto,
  }
  currentStep.value = 3
}

async function guardarPago(clienteData?: {
  primerNombre?: string
  segundoNombre?: string
  primerApellido?: string
  segundoApellido?: string
}) {
  const { toastErro } = useToastUtils()
  const { causeOf }   = useErrorHandler()

  isLoadingGuardar.value = true
  try {
    const response = await registrarPago({
      ventaId:      ventaId.value,
      opcionPagoId: opcionSeleccionada.value ?? '',
      formaPago:    formaPagoFinal.value,
      cliente: clienteData?.primerNombre ? {
        primerNombre:    clienteData.primerNombre,
        segundoNombre:   clienteData.segundoNombre,
        primerApellido:  clienteData.primerApellido ?? '',
        segundoApellido: clienteData.segundoApellido,
      } : undefined,
      tarjeta: formaPagoFinal.value === 'tarjeta' ? {
        tipo:         formTarjeta.tipo as string,
        marca:        formTarjeta.marca as string,
        ultimos4:     formTarjeta.ultimos4,
        autorizacion: formTarjeta.autorizacion,
      } : undefined,
      voucher: tipoPago.value === 'inicial' ? formInicial.voucher : undefined,
    })

    transaccionId.value    = response.transaccionId
    transaccionFecha.value = new Intl.DateTimeFormat('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }).format(new Date(response.fecha))

    showConfirmModal.value = true
  } catch (error) {
    toastErro(causeOf(error))
  } finally {
    isLoadingGuardar.value = false
  }
}

function cerrarModal() {
  showConfirmModal.value = false
}

function finalizarPago() {
  const { toastSucesso } = useToastUtils()
  showConfirmModal.value = false
  resetFluxo()
  toastSucesso('Venta creada con éxito.')
}

function cancelar() {
  const { toastAviso } = useToastUtils()
  resetFluxo()
  toastAviso('Operación cancelada.')
}

function volverStep() {
  if (currentStep.value > 1) {
    currentStep.value = (currentStep.value - 1) as 1 | 2 | 3
  }
}

function resetFluxo() {
  currentStep.value = 1
  tipoPago.value = 'inicial'
  Object.assign(formInicial, { voucher: '', primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '' })
  Object.assign(formParcial, { tipoCobro: 'financiamiento', buscarPor: '', valorBusqueda: '' })
  ventaId.value = ''
  ventaDescripcion.value = ''
  ventaTotal.value = 0
  valorPagoInicial.value = 0
  dispositivo.value = null
  opcionesPago.value = []
  opcionSeleccionada.value = null
  resumenVenta.value = null
  formaPagoFinal.value = 'tarjeta'
  confirmacionPago.value = false
  Object.assign(formTarjeta, { tipo: '', marca: '', ultimos4: '', autorizacion: '' })
}

// ── Composable export ──────────────────────────────────────────────────────

export function usePagosPayjoy() {
  return {
    // Estado
    currentStep,
    tipoPago,
    formInicial,
    formParcial,
    ventaDescripcion,
    ventaTotal,
    valorPagoInicial,
    dispositivo,
    opcionesPago,
    opcionSeleccionada,
    resumenVenta,
    formaPagoFinal,
    confirmacionPago,
    formTarjeta,
    showConfirmModal,
    transaccionId,
    transaccionFecha,
    // Loading
    isLoadingBuscar,
    isLoadingGuardar,
    // Ações
    buscarVenta,
    seleccionarOpcion,
    aceptarPago,
    guardarPago,
    cerrarModal,
    finalizarPago,
    cancelar,
    volverStep,
    resetFluxo,
  }
}
