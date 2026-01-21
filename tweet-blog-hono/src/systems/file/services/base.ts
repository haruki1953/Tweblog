import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fsp from 'fs/promises'

import { getFileExtension } from '@/utils'

export const saveImageSimple = async (
  imageFile: File, imageSavePathConfig: string
) => {
  // 充当名称的uuid
  const uuid = uuidv4()
  // 图片大小
  const size = imageFile.size
  // 后缀名
  const imageExtension = getFileExtension(imageFile.name)
  // （uuid + 后缀名）
  const pathName = uuid + imageExtension

  // 保存路径
  const savePath = path.join(
    imageSavePathConfig,
    pathName
  )

  // 将 imageFile 保存到指定路径
  const arrayBuffer = await imageFile.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await fsp.writeFile(savePath, buffer)

  return {
    uuid,
    path: pathName,
    size,
    addAt: new Date()
  }
}

export const deleteImageSimple = (
  imgPath: string, imageSavePathConfig: string
) => {
  const imgSavePath = path.join(
    imageSavePathConfig,
    imgPath
  )
  fsp.unlink(imgSavePath).catch(() => {})
}
