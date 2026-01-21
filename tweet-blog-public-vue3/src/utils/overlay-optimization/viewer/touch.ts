export const useImageViewerTouchOptimization = () => {
  // 预览遮罩，在其之上滑动控制缩放
  let viewerWrapperMask: HTMLElement | null = null
  // 图片的盒子
  let viewerImageCanvas: HTMLElement | null = null

  // 在显示预览时启用触摸
  const enableTouchOnViewerShow = () => {
    // 获取遮罩
    viewerWrapperMask = document.querySelector(
      '.el-image-viewer__wrapper'
    ) as HTMLElement | null
    // 获取图片盒子
    viewerImageCanvas = document.querySelector(
      '.el-image-viewer__canvas'
    ) as HTMLElement | null

    // 遮罩添加触摸事件监听器
    viewerWrapperMask?.addEventListener('touchstart', touchMaskStartHandler)
    viewerWrapperMask?.addEventListener('touchmove', touchMaskMoveHandler, {
      passive: true
    })
    viewerWrapperMask?.addEventListener('touchend', touchMaskEndHandler)

    // 为所有图片绑定触摸事件
    // 事件委派
    viewerImageCanvas?.addEventListener('touchstart', touchImageStartHandler)
    viewerImageCanvas?.addEventListener('touchmove', touchImageMoveHandler, {
      passive: true
    })
    viewerImageCanvas?.addEventListener('touchend', touchImageEndHandler)
  }

  // 预览关闭时清理触摸监听器
  const disableTouchOnViewerClose = () => {
    viewerWrapperMask?.removeEventListener('touchstart', touchMaskStartHandler)
    viewerWrapperMask?.removeEventListener('touchmove', touchMaskMoveHandler)
    viewerWrapperMask?.removeEventListener('touchend', touchMaskEndHandler)
    viewerImageCanvas?.removeEventListener('touchstart', touchImageStartHandler)
    viewerImageCanvas?.removeEventListener('touchmove', touchImageMoveHandler)
    viewerImageCanvas?.removeEventListener('touchend', touchImageEndHandler)
  }

  // 触屏缩放移动实现（转为鼠标事件）
  // el-image的图片预览无法通过触屏来控制
  // el-image是遮罩负责滚轮缩放，其中的图片负责接收鼠标点击移动事件
  // 缩放灵敏度，增大迟钝，减小灵敏（当触摸距离变化超过此值时进行缩放）
  const sensitivity = 25
  // 最后触摸距离（双指距离）
  let lastTouchDistance = 0
  // 触摸距离变化
  let changeTouchDistance = 0

  // 处理遮罩的触摸事件
  const touchMaskStartHandler = (event: TouchEvent) => {
    if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX
      const dy = event.touches[0].clientY - event.touches[1].clientY
      lastTouchDistance = Math.sqrt(dx * dx + dy * dy)
    }
  }
  const touchMaskMoveHandler = (event: TouchEvent) => {
    if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX
      const dy = event.touches[0].clientY - event.touches[1].clientY
      const currentTouchDistance = Math.sqrt(dx * dx + dy * dy)
      changeTouchDistance += lastTouchDistance - currentTouchDistance

      if (Math.abs(changeTouchDistance) > sensitivity) {
        const mouseWheelEvent = new WheelEvent('wheel', {
          bubbles: true,
          cancelable: true,
          deltaY: Math.sign(changeTouchDistance) * 120
        })
        viewerWrapperMask?.dispatchEvent(mouseWheelEvent)
        changeTouchDistance = 0
      }
      lastTouchDistance = currentTouchDistance
    }
  }
  const touchMaskEndHandler = () => {
    lastTouchDistance = 0
    changeTouchDistance = 0
  }

  // 处理图片的触摸事件
  const touchImageStartHandler = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      const targetTag = event.target as HTMLElement | null
      if (targetTag?.tagName !== 'IMG') {
        return
      }
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY
      })
      targetTag.dispatchEvent(mouseDownEvent)
    }
  }
  const touchImageMoveHandler = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      const targetTag = event.target as HTMLElement | null
      if (targetTag?.tagName !== 'IMG') {
        return
      }
      const mouseMoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY
      })
      targetTag.dispatchEvent(mouseMoveEvent)
    }
  }
  const touchImageEndHandler = (event: TouchEvent) => {
    const targetTag = event.target as HTMLElement | null
    if (!targetTag) {
      return
    }
    const mouseUpEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true
    })
    targetTag.dispatchEvent(mouseUpEvent)
  }

  return {
    enableTouchOnViewerShow,
    disableTouchOnViewerClose
  }
}
