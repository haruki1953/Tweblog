import { onUnmounted, watch, type Ref } from 'vue'
import {
  optimizationScrollOnOverlayClose,
  optimizationScrollOnOverlayShow
} from './base'

export const useDialogOptimization = (dependencies: {
  dialogVisible: Ref<boolean>
  overlayClass: string
}) => {
  const { dialogVisible } = dependencies

  watch(dialogVisible, () => {
    if (dialogVisible.value) {
      enableOnDialogShow()
    } else {
      disableOnDialogClose()
    }
  })

  // 对话框打开时
  const enableOnDialogShow = async () => {
    // 禁用滚动，同时防止抖动
    optimizationScrollOnOverlayShow()

    // 这行代码会在历史记录中插入一个状态，以防止返回到上一页面。
    window.history.pushState({ isDialogShow: true }, '', window.location.href)
    // 监听返回事件
    window.addEventListener('popstate', handleBackNavigation)
  }

  // 对话框关闭时，清理监听器与之前添加的历史状态
  const disableOnDialogClose = async () => {
    // 恢复滚动，同时防止抖动
    optimizationScrollOnOverlayClose()

    // 取消返回监听
    window.removeEventListener('popstate', handleBackNavigation)
    // 检查历史状态
    const currentState = window.history.state
    if (currentState && currentState.isDialogShow) {
      // 删除状态
      window.history.back() // 或者使用其他逻辑恢复到之前的状态
    }
  }
  onUnmounted(() => {
    // 防止在对话框打开时跳转至其他页面，导致滚动锁死
    if (dialogVisible.value) {
      disableOnDialogClose()
    }
  })

  // 返回事件操作
  const handleBackNavigation = () => {
    dialogVisible.value = false
  }
}
