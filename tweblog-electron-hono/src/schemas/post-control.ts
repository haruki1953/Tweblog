import { forwardingOrderEnum, platformKeyEnum } from '@/configs'
import { z } from 'zod'
import { idParamSchema, type IdParamType } from './base'
import { forwardSettingListForSetSchema } from './types'
// import { type IdParamType, idParamSchema } from './base'

export const postControlImportJsonSchema = z.object({
  importPosts: z.array(z.object({
    content: z.string().optional(),
    createdAt: z.coerce.date().optional(),
    importImages: z.array(z.object({
      createdAt: z.coerce.date().optional(),
      link: z.string(),
      alt: z.string().optional(),
      platform: z.enum(platformKeyEnum).optional(),
      platformId: z.string().optional()
    })),
    // 不再将帖子的图片限制为4个
    // .max(postConfig.postMaxImages)
    platform: z.enum(platformKeyEnum).optional(),
    platformId: z.string().optional(),
    platformLink: z.string().optional(),
    platformParentId: z.string().nullable().optional(),
    isDeleted: z.boolean().optional()
  })),
  advancedSettings: z.object({
    forwardConfigId: z.string().optional()
  }).optional()
})
export type PostControlImportJsonType = z.infer<typeof postControlImportJsonSchema>

export const postControlDeleteImportDataParamSchema = idParamSchema
export type PostControlDeleteImportDataParamType = IdParamType

export const postControlForwardSettingSetJsonSchema = z.object({
  forwardSettingList: forwardSettingListForSetSchema
})
export type PostControlForwardSettingSetJsonType = z.infer<typeof postControlForwardSettingSetJsonSchema>

export const postControlDeleteForwardDataParamSchema = idParamSchema
export type PostControlDeleteForwardDataParamType = IdParamType

export const postControlForwardManualLinkingJsonSchema = z.object({
  postId: z.string(),
  forwardConfigId: z.string(),
  platformPostId: z.string(),
  platformPostLink: z.string(),
  forwardAt: z.coerce.date().optional()
})
export type PostControlForwardManualLinkingJsonType = z.infer<typeof postControlForwardManualLinkingJsonSchema>

export const postControlForwardManualLinkingImageJsonSchema = z.object({
  imageId: z.string(),
  forwardConfigId: z.string(),
  platformImageId: z.string(),
  platformImageLink: z.string(),
  forwardAt: z.coerce.date().optional()
})
export type PostControlForwardManualLinkingImageJsonType = z.infer<typeof postControlForwardManualLinkingImageJsonSchema>

export const postControlForwardPostJsonSchema = z.object({
  postId: z.string(),
  forwardConfigId: z.string()
})
export type PostControlForwardPostJsonType = z.infer<typeof postControlForwardPostJsonSchema>

export const postControlForwardAutoJsonSchema = z.object({
  forwardConfigId: z.string(),
  forwardingOrder: z.enum(forwardingOrderEnum),
  forwardingNumber: z.number().int().positive(),
  forwardingIntervalSeconds: z.number().int().positive()
})
export type PostControlForwardAutoJsonType = z.infer<typeof postControlForwardAutoJsonSchema>
