import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import Jimp from 'jimp'
import fs from 'fs'
import fsp from 'fs/promises'

import { confirmSaveFolderExists, randomIntPadStart2 } from '@/utils'
import { store, save } from '../init'
import { systemFileConfig } from '@/configs'
import { AppError } from '@/classes'

export const getImageConfig = () => {
  return {
    imageLargeMaxLength: store.imageLargeMaxLength,
    imageSmallMaxLength: store.imageSmallMaxLength,
    imageQuality: store.imageQuality
  }
}

export const updateImageConfig = (
  info: ReturnType<typeof getImageConfig>
) => {
  save(info)
}

export const processImage = async (imageFile: File | Blob) => {
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
  const nameUuid = uuidv4()
  const intStr = randomIntPadStart2()

  confirmSaveFolderExists(path.join(
    systemFileConfig.originalImageSavePath,
    intStr
  ))
  confirmSaveFolderExists(path.join(
    systemFileConfig.largeImageSavePath,
    intStr
  ))
  confirmSaveFolderExists(path.join(
    systemFileConfig.smallImageSavePath,
    intStr
  ))

  const imageSaveName = `${intStr}/${nameUuid}${systemFileConfig.imageExtension}`

  // const originalExtension = getFileExtension(imageFile.name)
  // const originalSaveName = `${intStr}/${nameUuid}${originalExtension}`
  const originalExtension = '.' + imageFile.type.split('/')[1] // 获取文件类型后缀
  const originalSaveName = `${intStr}/${nameUuid}${originalExtension}`

  const imageOriginalSavePathName = path.join(
    systemFileConfig.originalImageSavePath,
    originalSaveName
  )
  const imageLargeSavePathName = path.join(
    systemFileConfig.largeImageSavePath,
    imageSaveName
  )
  const imageSmallSavePathName = path.join(
    systemFileConfig.smallImageSavePath,
    imageSaveName
  )

  const {
    imageLargeMaxLength,
    imageSmallMaxLength,
    imageQuality
  } = store

  const inputImage = await Jimp.read(imageBuffer).catch(() => {
    throw new AppError('此图片无法处理')
  })
  const width = inputImage.getWidth()
  const height = inputImage.getHeight()

  const LengthVal = width > height ? width : height
  // const lengthName = width > height ? 'width' : 'height'
  let lengthInfo: (
    'Large than large' |
    'Large than small' |
    'Small than small' |
    undefined
  )
  if (LengthVal > imageLargeMaxLength) {
    lengthInfo = 'Large than large'
  } else if (LengthVal > imageSmallMaxLength) {
    lengthInfo = 'Large than small'
  } else {
    lengthInfo = 'Small than small'
  }

  const originalSize = imageFile.size
  let smallSize = 0
  let largeSize = 0

  const smallScaleFactor = imageSmallMaxLength / LengthVal
  const largeScaleFactor = imageLargeMaxLength / LengthVal

  const saveImg = async (
    scaleFactor: number, savePathName: string
  ) => {
    const clonedImage = inputImage.clone()
    await clonedImage.scale(scaleFactor).quality(imageQuality).writeAsync(savePathName)
    let imgSize = fs.statSync(savePathName).size
    // if compressed image still big than original,
    // and originalExtension same as image, save original
    if (
      imgSize > originalSize &&
      originalExtension === systemFileConfig.imageExtension
    ) {
      fs.writeFileSync(savePathName, imageBuffer)
      imgSize = originalSize
    }
    return imgSize
  }
  const saveSmallImg = async () => {
    smallSize = await saveImg(smallScaleFactor, imageSmallSavePathName)
  }
  const saveSmallImgNoScale = async () => {
    smallSize = await saveImg(1, imageSmallSavePathName)
  }
  const saveLargeImg = async () => {
    largeSize = await saveImg(largeScaleFactor, imageLargeSavePathName)
  }
  const saveLargeImgNoScale = async () => {
    largeSize = await saveImg(1, imageLargeSavePathName)
  }

  const saveOriginalImg = () => {
    fs.writeFileSync(imageOriginalSavePathName, imageBuffer)
  }

  if (lengthInfo === 'Large than large') {
    await saveLargeImg()
    await saveSmallImg()
  } else if (lengthInfo === 'Large than small') {
    await saveLargeImgNoScale()
    await saveSmallImg()
  } else { // Small than small
    await saveSmallImgNoScale()
  }
  saveOriginalImg()

  return {
    path: imageSaveName,
    originalPath: originalSaveName,
    smallSize,
    largeSize,
    originalSize
  }
}

export const deleteImage = (
  imgPath: string, originalPath: string | null
) => {
  const imageLargeSavePathName = path.join(
    systemFileConfig.largeImageSavePath,
    imgPath
  )
  const imageSmallSavePathName = path.join(
    systemFileConfig.smallImageSavePath,
    imgPath
  )
  fsp.unlink(imageLargeSavePathName).catch(() => {})
  fsp.unlink(imageSmallSavePathName).catch(() => {})

  if (originalPath != null) {
    const imageOriginalSavePathName = path.join(
      systemFileConfig.originalImageSavePath,
      originalPath
    )
    fsp.unlink(imageOriginalSavePathName).catch(() => {})
  }
}

export const deleteOriginalImage = (
  originalPath: string | null
) => {
  if (originalPath != null) {
    const imageOriginalSavePathName = path.join(
      systemFileConfig.originalImageSavePath,
      originalPath
    )
    fsp.unlink(imageOriginalSavePathName).catch(() => {})
  }
}

export const deleteAllOriginalImage = async () => {
  // direct delete directory
  await fsp.rm(
    systemFileConfig.originalImageSavePath,
    { recursive: true, force: true }
  )
  // again create original directory
  confirmSaveFolderExists(
    systemFileConfig.originalImageSavePath
  )
}
