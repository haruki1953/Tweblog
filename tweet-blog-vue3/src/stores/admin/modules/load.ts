import { adminGetInfoApi } from '@/api'
import type { AdminStoreModuleDependencies } from '..'
import { sakiNotification } from '@/utils'
import { computed, ref } from 'vue'
import type { AdminGetInfoData } from '@/types'

export const useLoadModule = (dependencies: AdminStoreModuleDependencies) => {
  const {
    isAuthDefault,
    jwtAdminExpSeconds,
    loginMaxFailCount,
    loginLockSeconds,
    proxyAddressHttp,
    imageLargeMaxLength,
    imageSmallMaxLength,
    imageQuality
  } = dependencies

  const loadingMark = ref<boolean>(false)
  const isLoading = computed(() => loadingMark.value)

  const loadInfo = async () => {
    loadingMark.value = true
    const res = await adminGetInfoApi()
    loadInfoByResData(res.data.data)
    if (isAuthDefault.value === true) {
      sakiNotification({
        type: 'warning',
        title: '请修改用户名与密码',
        message: '当前用户名与密码为默认值，请尽快修改'
      })
    }
    loadingMark.value = false
  }

  const loadInfoByResData = (resData: AdminGetInfoData) => {
    isAuthDefault.value = resData.isAuthDefault
    jwtAdminExpSeconds.value = resData.jwtAdminExpSeconds
    loginMaxFailCount.value = resData.loginMaxFailCount
    loginLockSeconds.value = resData.loginLockSeconds
    proxyAddressHttp.value = resData.proxyAddressHttp
    imageLargeMaxLength.value = resData.imageLargeMaxLength
    imageSmallMaxLength.value = resData.imageSmallMaxLength
    imageQuality.value = resData.imageQuality
  }

  // const loadingMarkImageConfig = ref<boolean>(false)
  // const isLoadingImageConfig = computed(() => loadingMark.value)

  // const loadImageConfig = async () => {
  //   loadingMarkImageConfig.value = true
  //   const res = await adminGetImageConfigApi()
  //   imageLargeMaxLength.value = res.data.data.imageLargeMaxLength
  //   imageSmallMaxLength.value = res.data.data.imageSmallMaxLength
  //   imageQuality.value = res.data.data.imageQuality
  //   loadingMarkImageConfig.value = false
  // }

  return {
    isLoading,
    loadInfo,
    loadInfoByResData
    // isLoadingImageConfig,
    // loadImageConfig
  }
}
