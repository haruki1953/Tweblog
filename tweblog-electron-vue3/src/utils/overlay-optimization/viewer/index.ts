import { nextTick, onUnmounted, ref, type ComputedRef } from 'vue'
import {
  optimizationScrollOnOverlayClose,
  optimizationScrollOnOverlayShow
} from '../base'
import type { Image } from '@/types'
import { useImageViewerPreviewOptimization } from './preview'
import { useImageViewerTouchOptimization } from './touch'

export const useImageViewerOptimization = (dependencies: {
  images: ComputedRef<Image[]>
}) => {
  const { images } = dependencies

  // 预览大小图优化
  const { previewSrcList, loadImageOnViewerShow } =
    useImageViewerPreviewOptimization({ images })

  // 触摸控制优化
  const { enableTouchOnViewerShow, disableTouchOnViewerClose } =
    useImageViewerTouchOptimization()

  const isViewing = ref(false)

  // 解决图片预览不能通过手机返回键退出的问题
  // 关闭按钮
  let viewerCloseBtn: HTMLElement | null = null

  // 预览打开时
  const enableOnViewerShow = async () => {
    isViewing.value = true
    // 禁用滚动，同时防止抖动
    optimizationScrollOnOverlayShow({
      hiddenMenuBar: true
    })

    // 加载大图
    loadImageOnViewerShow()

    // 控制返回，以及触屏控制，需要等待dom更新
    await nextTick()

    // 在显示预览时启用触摸
    enableTouchOnViewerShow()

    // 获取返回按钮
    viewerCloseBtn = document.querySelector(
      '.el-image-viewer__btn.el-image-viewer__close'
    ) as HTMLElement | null

    // 这行代码会在历史记录中插入一个状态，以防止返回到上一页面。
    window.history.pushState({ isPreview: true }, '', window.location.href)
    // 监听返回事件
    window.addEventListener('popstate', handleBackNavigation)
  }

  // 预览关闭时清理监听器与之前添加的历史状态
  const disableOnViewerClose = () => {
    isViewing.value = false
    // 恢复滚动，同时防止抖动
    optimizationScrollOnOverlayClose()

    // 预览关闭时清理触摸监听器
    disableTouchOnViewerClose()

    // 关闭返回监听器
    window.removeEventListener('popstate', handleBackNavigation)

    // 检查历史状态
    const currentState = window.history.state
    if (currentState && currentState.isPreview) {
      // 删除预览状态
      window.history.back() // 或者使用其他逻辑恢复到之前的状态
    }
  }
  onUnmounted(() => {
    // 防止在预览打开时跳转至其他页面，导致滚动锁死
    if (isViewing.value) {
      disableOnViewerClose()
    }
  })

  // 返回事件操作
  const handleBackNavigation = () => {
    viewerCloseBtn?.click()
  }

  return {
    enableOnViewerShow,
    disableOnViewerClose,
    previewSrcList
  }
}
