import type { ResData, Image, ImageStoreData } from './base'

export type ImageUploadRes = ResData<Image>

export type ImageGetByCursorQueryType = {
  haveOriginal?: 'true' | 'false' | 'all' | undefined
  havePost?: 'true' | 'false' | 'all' | undefined
}
export type ImageGetByCursorRes = ResData<ImageStoreData[]>

export type ImageUpdateJsonType = {
  id: string
  alt?: string | null | undefined
  // twitterLargeImageLink?: string | null | undefined
}
export type ImageUpdateRes = ResData<Image>

export type ImageDeleteRes = ResData<Image>
export type ImageDeleteOriginalRes = ResData<Image>
