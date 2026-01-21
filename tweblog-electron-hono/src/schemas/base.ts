import { z } from 'zod'

export const idParamSchema = z.object({
  // Coercion for primitives
  // id: z.coerce.number().int().positive()
  id: z.string()
})
export type IdParamType = z.infer<typeof idParamSchema>

export const uuidParamSchema = z.object({
  uuid: z.string()
})
export type UuidParamType = z.infer<typeof uuidParamSchema>
