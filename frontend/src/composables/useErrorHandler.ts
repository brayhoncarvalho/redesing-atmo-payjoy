// ─────────────────────────────────────────────────────────────────────────────
// useErrorHandler — padrão idêntico ao ATMO (composables/useErrorHandler.ts)
//
// Converte erros Axios em mensagens legíveis para o usuário.
//
// ⚠️  AO INTEGRAR AO ATMO:
//   - Remover este arquivo
//   - Importar useErrorHandler diretamente do ATMO (que tem i18n integrado)
// ─────────────────────────────────────────────────────────────────────────────
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/services/pagos.types'

export function useErrorHandler() {
  /**
   * Extrai mensagem legível de um erro Axios — mesma lógica do ATMO.
   * Uso: catch (error) { toastErro(causeOf(error)) }
   */
  function causeOf(error: unknown): string {
    const axiosError = error as AxiosError<ApiErrorResponse>

    // Sem resposta HTTP (timeout, rede offline, CORS)
    if (!axiosError?.response) {
      return 'Sin conexión. Verifique su red e intente nuevamente.'
    }

    const status = axiosError.response.status
    const data   = axiosError.response.data

    switch (status) {
      case 400: return data?.message ?? 'Solicitud inválida. Verifique los datos ingresados.'
      case 401: return data?.error_description ?? 'Sesión expirada. Inicie sesión nuevamente.'
      case 403: return 'Acceso denegado. No tiene permisos para esta operación.'
      case 404: return data?.message ?? 'Registro no encontrado.'
      case 409: return data?.message ?? 'Conflicto. El registro ya fue procesado.'
      case 422: return data?.message ?? 'Datos inválidos. Verifique la información enviada.'
      case 500:
        // Gateway timeout (padrão Zuul/ATMO)
        if (data?.exception?.includes('ZuulException')) {
          return 'Sistema no disponible temporalmente. Intente en unos minutos.'
        }
        return data?.message ?? 'Error interno del servidor. Contacte al soporte.'
      default:
        return (
          data?.message ??
          data?.error_description ??
          `Error ${status}. Intente nuevamente.`
        )
    }
  }

  return { causeOf }
}
