import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './locales'
import DefaultTheme from './themes/default'
import { initDatadog } from './plugins/datadog'

initDatadog()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(PrimeVue, {
  theme: {
    preset: DefaultTheme,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark',
      cssLayer: false,
    },
  },
  ripple: true,
})
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')

