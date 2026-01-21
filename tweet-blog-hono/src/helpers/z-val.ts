import { AppError } from '@/classes'
import { zValidator } from '@hono/zod-validator'

// zValidator With Error Handler
export const zValWEH = ((target, schema) => {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      throw new AppError(result.error.issues[0].message, 400)
    }
  })
}) as typeof zValidator
