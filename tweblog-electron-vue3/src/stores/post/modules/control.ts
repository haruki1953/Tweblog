import type { InfoForSendType, PostData } from '@/types'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useControlModule = () => {
  // data
  // info to control SendPage
  const infoForSend = ref<InfoForSendType>({
    type: 'post',
    data: null
  })

  // useSomething
  const router = useRouter()

  const toPostSendPage = () => {
    infoForSend.value.type = 'post'
    router.push({ name: 'send' })
  }
  const toReplySendPage = (data: PostData) => {
    infoForSend.value.type = 'reply'
    infoForSend.value.data = data
    router.push({ name: 'send' })
  }
  const toUpdateSendPage = (data: PostData) => {
    infoForSend.value.type = 'update'
    infoForSend.value.data = data
    router.push({ name: 'send' })
  }

  return {
    infoForSend,
    toPostSendPage,
    toReplySendPage,
    toUpdateSendPage
  }
}
