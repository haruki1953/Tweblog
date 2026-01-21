import { z } from 'zod'

export const typesAdminStoreSchema = z.object({
  username: z.string(),
  password: z.string(),
  jwtAdminSecretKey: z.string(),
  jwtAdminExpSeconds: z.number().int().positive(),
  loginMaxFailCount: z.number().int().positive(),
  loginLockSeconds: z.number().int().positive(),
  proxyAddressHttp: z.string()
})
