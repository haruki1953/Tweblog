/**
 * 根据文件路径（后缀名）获取MIME类型
 * @param filePath 文件路径
 * @returns MIME类型字符串
 */
export const getFileMimeType = (filePath: string): string => {
  // Extract the file extension and normalize it to lowercase
  const extension = filePath.split('.').pop()?.toLowerCase()

  // Check if the extension is valid
  if (extension == null) return 'application/octet-stream'

  switch (extension) {
    // Image MIME Types
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'bmp':
      return 'image/bmp'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    case 'tiff':
    case 'tif':
      return 'image/tiff'
    case 'ico':
      return 'image/x-icon'
    case 'heic':
      return 'image/heic'
    case 'heif':
      return 'image/heif'
    case 'avif':
      return 'image/avif'
    case 'jxr':
      return 'image/vnd.ms-photo'
    case 'jp2':
    case 'j2k':
    case 'jpf':
    case 'jpx':
    case 'jpm':
      return 'image/jp2'

    // Audio MIME Types
    case 'mp3':
      return 'audio/mpeg'
    case 'wav':
      return 'audio/wav'
    case 'ogg':
      return 'audio/ogg'
    case 'aac':
      return 'audio/aac'
    case 'flac':
      return 'audio/flac'

    // Video MIME Types
    case 'mp4':
      return 'video/mp4'
    case 'webm':
      return 'video/webm'
    case 'avi':
      return 'video/x-msvideo'
    case 'mkv':
      return 'video/x-matroska'
    case 'mov':
      return 'video/quicktime'

    // Document MIME Types
    case 'pdf':
      return 'application/pdf'
    case 'txt':
      return 'text/plain'
    case 'doc':
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'xls':
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'ppt':
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'

    // Other MIME Types
    case 'zip':
      return 'application/zip'
    case 'rar':
      return 'application/x-rar-compressed'
    case '7z':
      return 'application/x-7z-compressed'
    case 'json':
      return 'application/json'
    case 'xml':
      return 'application/xml'
    case 'csv':
      return 'text/csv'
    case 'html':
      return 'text/html'
    case 'css':
      return 'text/css'
    case 'js':
      return 'application/javascript'
    case 'mpg':
    case 'mpeg':
      return 'video/mpeg'

    default:
      return 'application/octet-stream'
  }
}

export const getFileExtensionName = (filePath: string): string => {
  // Extract the file extension and normalize it to lowercase
  const extension = filePath.split('.').pop()?.toLowerCase()
  return extension ?? ''
}
