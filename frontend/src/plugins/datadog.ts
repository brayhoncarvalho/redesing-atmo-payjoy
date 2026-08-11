import { datadogRum } from '@datadog/browser-rum'

export function initDatadog() {
  // Apenas inicializa em produção (não em dev/mock)
  if (import.meta.env.DEV) return

  datadogRum.init({
    applicationId: import.meta.env.VITE_DATADOG_APP_ID ?? '',
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN ?? '',
    site: 'datadoghq.com',
    service: 'payjoy-frontend',
    env: import.meta.env.VITE_ENV ?? 'production',
    version: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
  })
}
