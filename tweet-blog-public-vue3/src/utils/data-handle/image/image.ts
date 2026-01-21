import { imageConfig } from '@/config'
import type { Image, ImageStoreData } from '@/types'

export const imgSamllUrl = (imgData: Image) => {
  return `${imageConfig.smallBaseUrl}${imgData.path}`
}
export const imgLargeUrl = (imgData: Image) => {
  if (imgData.largeSize > 0) {
    return `${imageConfig.largeBaseUrl}${imgData.path}`
  } else {
    return imgSamllUrl(imgData)
  }
}
export const imgOriginalUrl = (imgData: Image) => {
  return `${imageConfig.originalBaseUrl}${imgData.originalPath}`
}

export const imageToImageStoreData = (
  imgData: Image,
  imageStoreData?: ImageStoreData
): ImageStoreData => {
  const defaultAddData: {
    posts: ImageStoreData['posts']
    _count: ImageStoreData['_count']
  } = {
    posts: [],
    _count: {
      posts: 0
    } as ImageStoreData['_count']
  }
  return {
    ...(imageStoreData || defaultAddData),
    ...imgData
  }
}
