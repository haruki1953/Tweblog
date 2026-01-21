import { nextTick, onUnmounted, watch, type Ref } from 'vue'
import { getScrollbarWidth } from '../other'
import { useDialogOptimization } from './dialog'

// 菜单抽屉专用
export const useMenuDrawerOptimization = (dependencies: {
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
      `.${overlayClass} .menu-drawer-box`
    ) as HTMLElement
    drawerBody.style.paddingRight = `${getScrollbarWidth()}px`
  }
  const disable = () => {
    const drawerBody = document.querySelector(
      `.${overlayClass} .menu-drawer-box`
    ) as HTMLElement
    drawerBody.style.paddingRight = ``
  }
  onUnmounted(() => {
    if (drawerVisible.value) {
      disable()
    }
  })
}
