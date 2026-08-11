import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/pagos-payjoy',
    },
    {
      path: '/pagos-payjoy',
      name: 'PagosPayjoy',
      component: () => import('@/views/PagosPayjoyView.vue'),
    },
    {
      path: '/pagos-payjoy-v2',
      name: 'PagosPayjoyV2',
      component: () => import('@/views/PagosPayjoyV2View.vue'),
    },
    { path: '/multipagos', redirect: '/pagos-payjoy' },
    {
      path: '/historial-pagos',
      name: 'HistorialPagos',
      component: () => import('@/views/HistorialPagosView.vue'),
    },
    {
      path: '/historial-pagos-v2',
      name: 'HistorialPagosV2',
      component: () => import('@/views/HistorialPagosV2View.vue'),
    },
    { path: '/iniciar-solicitud', redirect: '/pagos-payjoy' },
    { path: '/historial-propuestas', redirect: '/pagos-payjoy' },
    { path: '/consulta-imei', redirect: '/pagos-payjoy' },
    { path: '/validar-onix', redirect: '/pagos-payjoy' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
