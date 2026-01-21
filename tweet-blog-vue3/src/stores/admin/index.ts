import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { useLoadModule } from './modules/load'

export type AdminStoreModuleDependencies = {
  isAuthDefault: Ref<boolean | null>
  jwtAdminExpSeconds: Ref<number | null>
  loginMaxFailCount: Ref<number | null>
  loginLockSeconds: Ref<number | null>
  proxyAddressHttp: Ref<string>
  imageLargeMaxLength: Ref<number | null>
  imageSmallMaxLength: Ref<number | null>
  imageQuality: Ref<number | null>
}

export const useAdminStore = defineStore(
  'tweblog-admin',
  () => {
    // 系统配置
    const isAuthDefault = ref<boolean | null>(null)
    const jwtAdminExpSeconds = ref<number | null>(null)
    const loginMaxFailCount = ref<number | null>(null)
    const loginLockSeconds = ref<number | null>(null)

    // 代理配置
    const proxyAddressHttp = ref<string>('')

    // 图片配置
    const imageLargeMaxLength = ref<number | null>(null)
    const imageSmallMaxLength = ref<number | null>(null)
    const imageQuality = ref<number | null>(null)

    const dependencies = {
      isAuthDefault,
      jwtAdminExpSeconds,
      loginMaxFailCount,
      loginLockSeconds,
      proxyAddressHttp,
      imageLargeMaxLength,
      imageSmallMaxLength,
      imageQuality
    }

    const loadModule = useLoadModule(dependencies)

    return {
      ...loadModule,
      isAuthDefault,
      jwtAdminExpSeconds,
      loginMaxFailCount,
      loginLockSeconds,
      proxyAddressHttp,
      imageLargeMaxLength,
      imageSmallMaxLength,
      imageQuality
    }
  },
  {
    persist: true // 持久化
  }
)
