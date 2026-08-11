// ─────────────────────────────────────────────────────────────────────────────
// useToast — padrão idêntico ao ATMO (composables/useToast.ts)
//
// ⚠️  AO INTEGRAR AO ATMO:
//   - Remover este arquivo
//   - Importar useToastUtils diretamente do ATMO
// ─────────────────────────────────────────────────────────────────────────────
import { ref } from 'vue'

export type ToastSeverity = 'success' | 'error' | 'warn' | 'info'

export interface ToastMessage {
  id: number
  severity: ToastSeverity
  summary: string
  detail: string
  life: number
}

// Estado global singleton (compartilhado entre useToastUtils() e ToastContainer)
const messages = ref<ToastMessage[]>([])
let _id = 0

function add(severity: ToastSeverity, summary: string, detail: string, life = 6000) {
  const id = ++_id
  messages.value.push({ id, severity, summary, detail, life })
  setTimeout(() => {
    messages.value = messages.value.filter((m) => m.id !== id)
  }, life)
}

/** Composable de consumo — mesma assinatura do ATMO */
export function useToastUtils() {
  const toastSucesso = (detail: string, life?: number) =>
    add('success', 'Éxito', detail, life)

  const toastErro = (detail: string, life?: number) =>
    add('error', 'Error', detail, life)

  const toastAviso = (detail: string, life?: number) =>
    add('warn', 'Aviso', detail, life)

  const toastInfo = (detail: string, life?: number) =>
    add('info', 'Información', detail, life)

  return { toastSucesso, toastErro, toastAviso, toastInfo }
}

/** Composable de renderização — usado pelo ToastContainer.vue */
export function useToastState() {
  return { messages }
}
