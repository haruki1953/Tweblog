// src/services/post-control/control-forward/forward-post/post-platform/pocket-chat/utils/image.ts

import Jimp from 'jimp'
import { pocketChatImageProcessConfig } from '../configs'
import { useLogUtil } from '@/utils'

const logUtil = useLogUtil()

export interface ProcessedImageInfo {
  buffer: Buffer
  width: number
  height: number
  fileSize: number
  filename: string
  contentType: string
}

export interface ProcessedImageGroup {
  image: ProcessedImageInfo
  imageSmall: ProcessedImageInfo
  imageTiny: ProcessedImageInfo
  imageBig?: ProcessedImageInfo | null
}

/**
 * 将图片按 sumWidthHeightLimit 缩放
 */
const resizeBySumLimit = async (image: Jimp, sumLimit: number): Promise<Jimp> => {
  const { width, height } = image.bitmap
  const sum = width + height

  if (sum <= sumLimit) {
    return image
  }

  const scale = sumLimit / sum
  const newWidth = Math.floor(width * scale)
  const newHeight = Math.floor(height * scale)

  return image.clone().resize(newWidth, newHeight)
}

/**
 * 按配置导出 buffer
 */
const exportWithConfig = async (
  image: Jimp,
  config: {
    filename: string
    format: string
    quality: number
  }
): Promise<ProcessedImageInfo> => {
  const mime = config.format
  const quality = Math.floor(config.quality * 100)

  const cloned = image.clone().quality(quality)
  const buffer = await cloned.getBufferAsync(mime)
  const { width, height } = cloned.bitmap

  return {
    buffer,
    width,
    height,
    fileSize: buffer.length,
    filename: config.filename,
    contentType: config.format
  }
}

/**
 * 处理单张图片，生成 big / image / small / tiny
 */
export const processPocketChatImage = async (
  localLargeImagePath: string
): Promise<ProcessedImageGroup> => {
  let origin: Jimp
  try {
    origin = await Jimp.read(localLargeImagePath)
  } catch (error) {
    logUtil.warning({
      title: '图片处理失败',
      content: `无法读取图片：${localLargeImagePath}`
    })
    throw error
  }

  const { bigConfig, imageConfig, smallConfig, tinyConfig } =
    pocketChatImageProcessConfig

  // image（中图）
  const imageResized = await resizeBySumLimit(origin, imageConfig.sumWidthHeightLimit)
  const image = await exportWithConfig(imageResized, imageConfig)

  // small
  const smallResized = await resizeBySumLimit(origin, smallConfig.sumWidthHeightLimit)
  const imageSmall = await exportWithConfig(smallResized, smallConfig)

  // tiny
  const tinyResized = await resizeBySumLimit(origin, tinyConfig.sumWidthHeightLimit)
  const imageTiny = await exportWithConfig(tinyResized, tinyConfig)

  // big（可能不生成）
  const originSum = origin.bitmap.width + origin.bitmap.height
  let imageBig: ProcessedImageInfo | null = null

  if (originSum > imageConfig.sumWidthHeightLimit) {
    const bigResized = await resizeBySumLimit(origin, bigConfig.sumWidthHeightLimit)
    imageBig = await exportWithConfig(bigResized, bigConfig)
  }

  return {
    image,
    imageSmall,
    imageTiny,
    imageBig
  }
}
