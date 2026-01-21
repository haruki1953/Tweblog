import { nextTick, onUnmounted, watch, type Ref } from 'vue'
import { getScrollbarWidth } from '../other'
import { useDialogOptimization } from './dialog'

export const useDrawerOptimization = (dependencies: {
  drawerVisible: Ref<boolean>
  overlayClass: string
}) => {
  const { drawerVisible, overlayClass } = dependencies

  useDialogOptimization({
    dialogVisible: drawerVisible,
    overlayClass
  })

  watch(drawerVisible, () => {
    if (drawerVisible.value) {
      enable()
    } else {
      disable()
    }
  })

  const enable = async () => {
    await nextTick()
    const drawerBody = document.querySelector(
      `.${overlayClass} .el-drawer__body`
    ) as HTMLElement
    drawerBody.style.paddingRight = `${20 + getScrollbarWidth()}px`
  }
  const disable = () => {
    const drawerBody = document.querySelector(
      `.${overlayClass} .el-drawer__body`
    ) as HTMLElement
    drawerBody.style.paddingRight = `20px`
  }
  onUnmounted(() => {
    if (drawerVisible.value) {
      disable()
    }
  })
}
