import { systemFileConfig } from '@/configs'
import { type Image } from '@/types'

// 将数据库里的 image.path 拼接为本地大图路径
const dataImageJoinLocalLargeImagePath = (
  // path: string
  path: Image['path']
) => {
  return systemFileConfig.largeImageSavePath + path
}

// 将数据库里的 image.path 拼接为本地小图路径
const dataImageJoinLocalSmallImagePath = (
  // path: string
  path: Image['path']
) => {
  return systemFileConfig.smallImageSavePath + path
}

// // 将数据库里的 image.path 拼接为本地原图路径
// const dataImageJoinLocalOriginalImagePath = (
//   // path: string
//   path: Image['path']
// ) => {
//   return systemFileConfig.originalImageSavePath + path
// }

// 得到 image 最好的本地图片路径，原图 > 大图 > 小图
export const dataImageBestLocalImagePath = (
  // path: string
  image: Image
) => {
  // 【250207】图片转发选择调整，为了提高兼容性，改为不用原图
  // if (image.originalSize > 0 && image.originalPath != null) {
  //   return dataImageJoinLocalOriginalImagePath(image.originalPath)
  // }
  if (image.largeSize > 0) {
    return dataImageJoinLocalLargeImagePath(image.path)
  }
  return dataImageJoinLocalSmallImagePath(image.path)
}
