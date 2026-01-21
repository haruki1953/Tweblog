import { z } from 'zod'

export const typesFileStoreSchema = z.object({
  imageLargeMaxLength: z.number().int().positive(),
  imageSmallMaxLength: z.number().int().positive(),
  imageQuality: z.number().int().min(1).max(100)
})
