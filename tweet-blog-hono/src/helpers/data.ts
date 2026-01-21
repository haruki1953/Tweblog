import { AppError } from '@/classes'
import type { ResData } from '@/types'

// handle response data
export const handleResData = (
  code: number, message: string, data?: any
): ResData => {
  return {
    code,
    message,
    data
  }
}

export const handleFileInFormData = (
  fromData: FormData, fieldname: string
) => {
  const file = fromData.get(fieldname)
  if (file == null || typeof file === 'string') {
    throw new AppError('表单格式错误')
  }
  return file
}

export const handleImageInFormData = (
  fromData: FormData, fieldname: string
) => {
  const file = handleFileInFormData(fromData, fieldname)
  if (!file.type.startsWith('image/')) {
    throw new AppError('请上传图片文件')
  }
  return file
}
