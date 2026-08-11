// ─────────────────────────────────────────────────────────────────────────────
// Contratos de API — Pagos PayJoy
// Manter em sincronia com o backend ao integrar ao ATMO.
// ─────────────────────────────────────────────────────────────────────────────

// ── Buscar Venta ──────────────────────────────────────────────────────────────

/** Payload enviado para buscar uma venda (Pago Inicial) */
export interface BuscarVentaInicialRequest {
  voucher: string
  primerNombre: string
  segundoNombre?: string
  primerApellido: string
  segundoApellido?: string
}

/** Payload enviado para buscar uma venda (Pago Parcial) */
export interface BuscarVentaParcialRequest {
  tipoCobro: string
  buscarPor: 'DN' | 'DeviceTag' | 'IMEI'
  valorBusqueda: string
}

/** Dispositivo retornado pela API */
export interface DispositivoResponse {
  deviceTag: string
  imei: string
  dn: string
  modelo?: string
  descripcion?: string
}

/** Resposta da busca de venda */
export interface VentaResponse {
  id: string
  identificacion: string
  descripcion: string
  valor: number
  valorPagoInicial?: number
  dispositivo: DispositivoResponse
  opcionesPago: OpcionPagoResponse[]
}

// ── Opciones de Pago ──────────────────────────────────────────────────────────

export interface OpcionPagoResponse {
  id: string
  label: string       // ex: "Pago mínimo", "7 días", etc.
  description?: string // ex: "Monto mínimo permitido", "7 días pagados"
  monto: number
  diasAtraso?: number
}

// ── Registrar Pago ────────────────────────────────────────────────────────────

export interface ClienteRequest {
  primerNombre: string
  segundoNombre?: string
  primerApellido: string
  segundoApellido?: string
}

export interface TarjetaRequest {
  tipo: string        // 'debito' | 'credito'
  marca: string       // 'visa' | 'mastercard' | 'amex' | 'other'
  ultimos4: string
  autorizacion: string
}

/** Payload enviado ao registrar o pagamento */
export interface RegistrarPagoRequest {
  ventaId: string
  opcionPagoId: string
  formaPago: 'efectivo' | 'tarjeta'
  cliente?: ClienteRequest
  tarjeta?: TarjetaRequest
  voucher?: string
}

/** Resposta do registro de pagamento */
export interface RegistrarPagoResponse {
  transaccionId: string
  fecha: string       // ISO 8601
  estado: 'exitoso' | 'pendiente' | 'fallido'
  mensaje?: string
}

// ── Erros de API ──────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  status: number
  message?: string
  error_description?: string
  exception?: string
}
