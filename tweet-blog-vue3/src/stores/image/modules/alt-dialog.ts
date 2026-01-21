import type { Image } from '@/types'
import { generateRandomKey } from '@/utils'
import { ref } from 'vue'

export const useAltDialogModule = () => {
  // 随机字符串，在变化时即显示对话框
  const altDialogMark = ref('')

  const altDialogImageData = ref<Image | null>(null)

  const openAltDialog = (image: Image) => {
    altDialogImageData.value = image
    altDialogMark.value = generateRandomKey()
  }

  return {
    altDialogMark,
    altDialogImageData,
    openAltDialog
  }
}
