import type { UploadFile, UploadUserFile } from 'element-plus'

const imageRatioTolerance = 0.01

export function imageLoadImageFromFileService(
  uploadFile: UploadFile | UploadUserFile
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!uploadFile.raw) {
      reject(new Error('Invalid file'))
      return
    }
    // 使用 URL.createObjectURL 将文件转换为 URL
    const fileUrl = URL.createObjectURL(uploadFile.raw as File)
    const img = new Image()
    // 图片加载成功时处理
    img.onload = () => {
      // 释放 URL 对象，防止内存泄漏
      URL.revokeObjectURL(fileUrl)
      resolve(img)
    }
    // 图片加载错误时处理
    img.onerror = (err) => {
      URL.revokeObjectURL(fileUrl)
      reject(err)
    }
    // 设置图片的 src
    img.src = fileUrl
  })
}

// 函数1：按“cover”方式裁剪图片为指定比例
export function imageCropToRatioService(
  element: HTMLImageElement | HTMLCanvasElement,
  widthRatio: number = 16,
  heightRatio: number = 9
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D

  const imgWidth = element.width
  const imgHeight = element.height
  const imgRatio = imgWidth / imgHeight
  const targetRatio = widthRatio / heightRatio

  let newWidth: number, newHeight: number
  if (imgRatio > targetRatio) {
    newHeight = imgHeight
    newWidth = newHeight * targetRatio
  } else {
    newWidth = imgWidth
    newHeight = newWidth / targetRatio
  }

  canvas.width = newWidth
  canvas.height = newHeight

  context.drawImage(
    element,
    (imgWidth - newWidth) / 2,
    (imgHeight - newHeight) / 2,
    newWidth,
    newHeight,
    0,
    0,
    newWidth,
    newHeight
  )

  return canvas
}

// 函数2：按指定倍数缩放图片
export function imageScaleImageService(
  element: HTMLImageElement | HTMLCanvasElement,
  scaleFactor: number = 2
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D

  canvas.width = element.width * scaleFactor
  canvas.height = element.height * scaleFactor

  context.drawImage(element, 0, 0, canvas.width, canvas.height)

  return canvas
}

// 函数3：将图片缩放至指定大小（宽或高）
export function imageResizeImageService(
  element: HTMLImageElement | HTMLCanvasElement,
  targetWidth?: number,
  targetHeight?: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D

  canvas.width = targetWidth || element.width
  canvas.height = targetHeight || element.height

  context.drawImage(element, 0, 0, canvas.width, canvas.height)
  return canvas
}

// 函数4：将图片按垂直方向百分比分为两份
export function imageSplitVerticalService(
  element: HTMLImageElement | HTMLCanvasElement,
  splitPercent: number = 50
): { top: HTMLCanvasElement; bottom: HTMLCanvasElement } {
  const canvas1 = document.createElement('canvas')
  const canvas2 = document.createElement('canvas')
  const context1 = canvas1.getContext('2d') as CanvasRenderingContext2D
  const context2 = canvas2.getContext('2d') as CanvasRenderingContext2D

  const splitY = (element.height * splitPercent) / 100

  canvas1.width = element.width
  canvas1.height = splitY
  context1.drawImage(
    element,
    0,
    0,
    element.width,
    splitY,
    0,
    0,
    canvas1.width,
    canvas1.height
  )

  canvas2.width = element.width
  canvas2.height = element.height - splitY
  context2.drawImage(
    element,
    0,
    splitY,
    element.width,
    canvas2.height,
    0,
    0,
    canvas2.width,
    canvas2.height
  )

  return { top: canvas1, bottom: canvas2 }
}

// 函数5：将图片按水平方向百分比分为两份
export function imageSplitHorizontalService(
  element: HTMLImageElement | HTMLCanvasElement,
  splitPercent: number = 50
): { left: HTMLCanvasElement; right: HTMLCanvasElement } {
  const canvas1 = document.createElement('canvas')
  const canvas2 = document.createElement('canvas')
  const context1 = canvas1.getContext('2d') as CanvasRenderingContext2D
  const context2 = canvas2.getContext('2d') as CanvasRenderingContext2D

  const splitX = (element.width * splitPercent) / 100

  canvas1.width = splitX
  canvas1.height = element.height
  context1.drawImage(
    element,
    0,
    0,
    splitX,
    element.height,
    0,
    0,
    canvas1.width,
    canvas1.height
  )

  canvas2.width = element.width - splitX
  canvas2.height = element.height
  context2.drawImage(
    element,
    splitX,
    0,
    canvas2.width,
    element.height,
    0,
    0,
    canvas2.width,
    canvas2.height
  )

  return { left: canvas1, right: canvas2 }
}

// 函数6：将图片分为左右两份
export function imageSplitInTwoService(
  element: HTMLImageElement | HTMLCanvasElement
): {
  left: HTMLCanvasElement
  right: HTMLCanvasElement
} {
  return imageSplitHorizontalService(element, 50)
}

// 函数7：将图片分为三份（左、右上、右下）
export function imageSplitInThreeService(
  element: HTMLImageElement | HTMLCanvasElement
): {
  left: HTMLCanvasElement
  rightTop: HTMLCanvasElement
  rightBottom: HTMLCanvasElement
} {
  const { left, right } = imageSplitHorizontalService(element, 50)
  const { top: rightTop, bottom: rightBottom } = imageSplitVerticalService(
    right,
    50
  )
  return { left, rightTop, rightBottom }
}

// 函数8：将图片分为四份（左上、左下、右上、右下）
export function imageSplitInFourService(
  element: HTMLImageElement | HTMLCanvasElement
): {
  leftTop: HTMLCanvasElement
  leftBottom: HTMLCanvasElement
  rightTop: HTMLCanvasElement
  rightBottom: HTMLCanvasElement
} {
  const { left, right } = imageSplitHorizontalService(element, 50)
  const { top: leftTop, bottom: leftBottom } = imageSplitVerticalService(
    left,
    50
  )
  const { top: rightTop, bottom: rightBottom } = imageSplitVerticalService(
    right,
    50
  )
  return { leftTop, leftBottom, rightTop, rightBottom }
}

// 图片比例为低于或高于16:9时，改进拼接使其不会错位，这也可以完全防止边缘溢出
const calcMaintainAspectRatioCutPercent = (
  element: HTMLImageElement | HTMLCanvasElement
) => {
  const imageRatio = element.width / element.height
  if (imageRatio > 16 / 9) {
    // 将图片高的一半，算出其为16:9时的宽度
    const halfImageCover169Width = (element.height / 2) * (16 / 9)
    // 裁切后图片应有的宽度
    const desiredImageWidth = element.width - halfImageCover169Width
    // 算出百分比
    return (desiredImageWidth / element.width) * 100
  } else {
    // 将图片宽的一半，算出其为16:9时的高度
    const halfImageCover169Height = (element.width / 2) * (9 / 16)
    // 裁切后图片应有的高度
    const desiredImageHeight = element.height - halfImageCover169Height
    // 算出百分比
    return (desiredImageHeight / element.height) * 100
  }
}
// 这个时用于左右侧图片在主图大于16:9时的裁剪比例计算
const calcMaintainAspectRatioCutHalfPercent = (
  element: HTMLImageElement | HTMLCanvasElement
) => {
  // 将图片的高，算出其为8:9时的宽度
  const imageCover89Width = element.height * (8 / 9)
  // 裁切后图片应有的宽度
  const desiredImageWidth = element.width - imageCover89Width
  // 算出百分比
  return (desiredImageWidth / element.width) * 100
}

// 将图片分为四份，并保持为其在X的显示正常
export function imageSplitInFourAndMaintainAspectRatioService(
  element: HTMLImageElement | HTMLCanvasElement
): ReturnType<typeof imageSplitInFourService> {
  const imageRatio = element.width / element.height
  // 定义一个小的容差值，为解决浮点数精度问题
  const tolerance = imageRatioTolerance
  // console.log(imageRatio)
  // console.log(element.width)
  // console.log(element.height)

  // 计算裁切的合适比例(百分比)
  const cutPercent = calcMaintainAspectRatioCutPercent(element)
  if (imageRatio > 16 / 9 + tolerance) {
    // 图片比例大于16:9时，先纵向分割，并进行优化
    const { top, bottom } = imageSplitVerticalService(element, 50)
    return {
      leftTop: imageSplitHorizontalService(top, cutPercent).left,
      leftBottom: imageSplitHorizontalService(bottom, cutPercent).left,
      rightTop: imageSplitHorizontalService(top, 100 - cutPercent).right,
      rightBottom: imageSplitHorizontalService(bottom, 100 - cutPercent).right
    }
  } else if (imageRatio < 16 / 9 - tolerance) {
    // 图片比例小于16:9时，先横向分割，并进行优化
    const { left, right } = imageSplitHorizontalService(element, 50)
    return {
      leftTop: imageSplitVerticalService(left, cutPercent).top,
      leftBottom: imageSplitVerticalService(left, 100 - cutPercent).bottom,
      rightTop: imageSplitVerticalService(right, cutPercent).top,
      rightBottom: imageSplitVerticalService(right, 100 - cutPercent).bottom
    }
  } else {
    // 图片比例等于16:9时，调用普通的方法
    // console.log('169')
    return imageSplitInFourService(element)
  }
}

// 将图片分为三份，并保持为其在X的显示正常
export function imageSplitInThreeAndMaintainAspectRatioService(
  element: HTMLImageElement | HTMLCanvasElement
): ReturnType<typeof imageSplitInThreeService> {
  const imageRatio = element.width / element.height
  // 定义一个小的容差值，为解决浮点数精度问题
  const tolerance = imageRatioTolerance
  // 计算裁切的合适比例(百分比)
  const cutPercent = calcMaintainAspectRatioCutPercent(element)
  const cutHalfPercent = calcMaintainAspectRatioCutHalfPercent(element)
  if (imageRatio > 16 / 9 + tolerance) {
    // 处理宽高比大于16:9的情况
    const left = imageSplitHorizontalService(element, cutHalfPercent).left
    const { top, bottom } = imageSplitVerticalService(element, 50)
    return {
      left,
      rightTop: imageSplitHorizontalService(top, 100 - cutPercent).right,
      rightBottom: imageSplitHorizontalService(bottom, 100 - cutPercent).right
    }
  } else if (imageRatio < 16 / 9 - tolerance) {
    // 处理宽高比小于16:9的情况
    const { left, right } = imageSplitHorizontalService(element, 50)
    return {
      left,
      rightTop: imageSplitVerticalService(right, cutPercent).top,
      rightBottom: imageSplitVerticalService(right, 100 - cutPercent).bottom
    }
  } else {
    // 处理宽高比等于16:9的情况
    return imageSplitInThreeService(element)
  }
}

// 将图片分为两份，并保持为其在X的显示正常
export function imageSplitInTwoAndMaintainAspectRatioService(
  element: HTMLImageElement | HTMLCanvasElement
): ReturnType<typeof imageSplitInTwoService> {
  const imageRatio = element.width / element.height
  // 定义一个小的容差值，为解决浮点数精度问题
  const tolerance = imageRatioTolerance
  // 计算裁切的合适比例(百分比)
  const cutHalfPercent = calcMaintainAspectRatioCutHalfPercent(element)
  if (imageRatio > 16 / 9 + tolerance) {
    // 处理宽高比大于16:9的情况
    return {
      left: imageSplitHorizontalService(element, cutHalfPercent).left,
      right: imageSplitHorizontalService(element, 100 - cutHalfPercent).right
    }
  } else {
    // 处理宽高比小于或等于16:9的情况
    return imageSplitInTwoService(element)
  }
}

// 函数9：纵向拼接图片
export function imageMergeVerticalService(
  images: (HTMLImageElement | HTMLCanvasElement)[],
  gap: number = 0
): HTMLCanvasElement {
  const totalHeight =
    images.reduce((sum, img) => sum + img.height, 0) + gap * (images.length - 1)
  const width = Math.max(...images.map((img) => img.width))

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.width = width
  canvas.height = totalHeight

  let y = 0
  images.forEach((img) => {
    context.drawImage(img, 0, y)
    y += img.height + gap
  })

  return canvas
}

// 函数10：横向拼接图片
export function imageMergeHorizontalService(
  images: (HTMLImageElement | HTMLCanvasElement)[],
  gap: number = 0
): HTMLCanvasElement {
  const totalWidth =
    images.reduce((sum, img) => sum + img.width, 0) + gap * (images.length - 1)
  const height = Math.max(...images.map((img) => img.height))

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.width = totalWidth
  canvas.height = height

  let x = 0
  images.forEach((img) => {
    context.drawImage(img, x, 0)
    x += img.width + gap
  })

  return canvas
}
