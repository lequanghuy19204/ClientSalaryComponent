import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/fonts.css'
import '@/assets/css/icons.css'
import 'devextreme/dist/css/dx.light.css'

const app = createApp(App)

app.use(router)

app.mount('#app')
