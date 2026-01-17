import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/fonts.css'
import '@/assets/css/icons.css'
import 'devextreme/dist/css/dx.light.css'

// PrimeVue
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import Tooltip from 'primevue/tooltip'

// Directives
import { clickOutside } from './directives/click-outside'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false
    }
  }
})
app.directive('tooltip', Tooltip)
app.directive('click-outside', clickOutside)

app.mount('#app')
