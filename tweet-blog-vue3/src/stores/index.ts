import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(persist)

export default pinia
export * from './states'
export * from './layout'
export * from './auth'
export * from './post'
export * from './image'
export * from './profile'
export * from './admin'
export * from './task'
export * from './forward'
export * from './log'
