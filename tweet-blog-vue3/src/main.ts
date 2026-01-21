import '@/styles/main.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/display.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ElementPlus from 'element-plus'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn
})

app.use(pinia)
app.use(router)
app.mount('#app')
