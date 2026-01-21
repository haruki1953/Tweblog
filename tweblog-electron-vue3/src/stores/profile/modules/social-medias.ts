import {
  faBrandsClassList,
  faBrandsNameList,
  faBrandsNameToClass
} from '@/config'
import { computed, ref } from 'vue'

export const useSocialMediasModule = () => {
  const commonFaBrandClassList = ref<string[]>([])

  const commonFaBrandClassLimited = computed(() => {
    return [
      ...commonFaBrandClassList.value,
      ...faBrandsClassList
        .slice(0, 30)
        .filter((i) => !commonFaBrandClassList.value.includes(i))
    ].slice(0, 30)
  })

  const commonFaBrandClassAdd = (faClass: string) => {
    commonFaBrandClassList.value = commonFaBrandClassList.value.filter(
      (i) => i !== faClass
    )
    commonFaBrandClassList.value.unshift(faClass)
    commonFaBrandClassList.value = commonFaBrandClassList.value.slice(0, 30)
  }

  const searchFaBrandClass = (key: string) => {
    if (!key) {
      return commonFaBrandClassLimited.value
    }
    // 搜索key（忽略大小写）
    const lowerKey = key.toLowerCase()
    return faBrandsNameList
      .filter((i) => i.includes(lowerKey))
      .slice(0, 30)
      .map((i) => faBrandsNameToClass(i))
  }

  return {
    commonFaBrandClassList,
    commonFaBrandClassLimited,
    commonFaBrandClassAdd,
    searchFaBrandClass
  }
}
