// ─────────────────────────────────────────────────────────────────────────────
// Instância Axios para o módulo de Pagos
//
// ⚠️  AO INTEGRAR AO ATMO:
//   - Remover este arquivo
//   - Importar a instância axios do ATMO (plugins/axios.ts)
//   - O interceptor de Bearer token já estará configurado lá
// ─────────────────────────────────────────────────────────────────────────────
import axios from 'axios'

const apiPagos = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1/',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Interceptor de request — injeta Bearer token ──────────────────────────────
// TODO ao integrar ao ATMO: remover este interceptor (o ATMO já faz isso globalmente)
apiPagos.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('authToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Interceptor de response — repassa erros ───────────────────────────────────
apiPagos.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default apiPagos
