import { z } from 'zod'
import { type IdParamType, idParamSchema } from './base'

export const imageUpdateJsonSchema = z.object({
  id: z.string(),
  alt: z.string().nullable().optional(),
  createdAt: z.coerce.date()
    // .min(new Date('1971-01-01'), { message: 'Too old' })
    .optional()
})
export type ImageUpdateJsonType = z.infer<typeof imageUpdateJsonSchema>

export const imageUpdateConfigJsonSchema = z.object({
  imageLargeMaxLength: z.number().int().positive(),
  imageSmallMaxLength: z.number().int().positive(),
  imageQuality: z.number().int().min(1).max(100)
})
export type ImageUpdateConfigJsonType = z.infer<typeof imageUpdateConfigJsonSchema>

export const imageDeleteParamSchema = idParamSchema
export type ImageDeleteParamType = IdParamType

export const imageDeleteOriginalParamSchema = idParamSchema
export type ImageDeleteOriginalParamType = IdParamType

export const imageGetByIdParamSchema = idParamSchema
export type ImageGetByIdParamType = IdParamType

export const imageGetByCursorParamSchema = z.object({
  id: z.string().optional()
})
export type ImageGetByCursorParamType = z.infer<typeof imageGetByCursorParamSchema>

export const imageGetByCursorQuerySchema = z.object({
  haveOriginal: z.enum(['true', 'false', 'all']).optional(),
  havePost: z.enum(['true', 'false', 'all']).optional()
})
export type ImageGetByCursorQueryType = z.infer<typeof imageGetByCursorQuerySchema>
