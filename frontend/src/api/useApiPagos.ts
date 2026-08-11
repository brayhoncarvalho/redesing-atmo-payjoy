// ─────────────────────────────────────────────────────────────────────────────
// API de Pagos — useApiPagos
//
// Padrão idêntico ao ATMO (useApiProposta.ts, useApiMultipagos.ts):
//   - Funções retornam a Promise diretamente
//   - Loading e erro tratados por quem chama (usePagosPayjoy.ts)
//   - Sem lógica de negócio aqui
//
// ⚠️  MOCKS ATIVADOS enquanto endpoints não estão disponíveis.
//     Para ativar a API real: alterar USE_MOCK para false e confirmar os endpoints.
// ─────────────────────────────────────────────────────────────────────────────
import type { AxiosResponse } from 'axios'
import apiPagos from './http'
import type {
  BuscarVentaInicialRequest,
  BuscarVentaParcialRequest,
  VentaResponse,
  RegistrarPagoRequest,
  RegistrarPagoResponse,
} from '@/services/pagos.types'

// ── Flag de mock — alterar para false ao conectar o backend ──────────────────
const USE_MOCK = true

// ── Helpers de mock ───────────────────────────────────────────────────────────
function delay(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function mockVentaResponse(): VentaResponse {
  return {
    id: 'VENTA-001',
    identificacion: 'VNT-2024-001',
    descripcion: 'SAMSUNG SM-A556E',
    valor: 5000.0,
    valorPagoInicial: 1001.0,
    dispositivo: {
      deviceTag: 'DT-9823-MX',
      imei: '354687095432100',
      dn: 'DN-00128',
      modelo: 'Samsung Galaxy A54',
      descripcion: 'Smartphone 5G 128GB',
    },
    opcionesPago: [
      { id: 'op1', label: 'Pago mínimo',        description: 'Monto mínimo permitido', monto: 100,   diasAtraso: 0  },
      { id: 'op2', label: 'Pago por 7 días',   description: '7 días pagados',         monto: 100,   diasAtraso: 7  },
      { id: 'op3', label: 'Pago por 14 días',  description: '14 días pagados',        monto: 200,   diasAtraso: 14 },
      { id: 'op4', label: 'Pago por 30 días',  description: '30 días pagados',        monto: 400,   diasAtraso: 30 },
      { id: 'op5', label: 'Pago total (payoff)', description: 'Liquidación completa', monto: 1000,  diasAtraso: 0  },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Funções de API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Busca venda por Voucher + Nombre (Pago Inicial)
 * Endpoint real: GET /pagos/ventas/inicial
 */
export async function buscarVentaInicial(
  params: BuscarVentaInicialRequest,
): Promise<VentaResponse> {
  if (USE_MOCK) {
    await delay()
    return mockVentaResponse()
  }
  // TODO: confirmar endpoint com o backend
  const res: AxiosResponse<VentaResponse> = await apiPagos.get('pagos/ventas/inicial', { params })
  return res.data
}

/**
 * Busca venda por DN/DeviceTag/IMEI (Pago Parcial)
 * Endpoint real: GET /pagos/ventas/parcial
 */
export async function buscarVentaParcial(
  params: BuscarVentaParcialRequest,
): Promise<VentaResponse> {
  if (USE_MOCK) {
    await delay()
    return mockVentaResponse()
  }
  // TODO: confirmar endpoint com o backend
  const res: AxiosResponse<VentaResponse> = await apiPagos.get('pagos/ventas/parcial', { params })
  return res.data
}

/**
 * Registra o pagamento (Efectivo ou Tarjeta)
 * Endpoint real: POST /pagos/registrar
 */
export async function registrarPago(
  body: RegistrarPagoRequest,
): Promise<RegistrarPagoResponse> {
  if (USE_MOCK) {
    await delay(1200)
    return {
      transaccionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
      fecha: new Date().toISOString(),
      estado: 'exitoso',
      mensaje: 'Pago registrado correctamente.',
    }
  }
  // TODO: confirmar endpoint com o backend
  const res: AxiosResponse<RegistrarPagoResponse> = await apiPagos.post('pagos/registrar', body)
  return res.data
}
