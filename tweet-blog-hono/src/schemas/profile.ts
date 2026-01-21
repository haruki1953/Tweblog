import { z } from 'zod'
import { uuidParamSchema } from './base'
import { typesProfileStoreSchema } from './types'

export const profileUpdateNameBioJsonSchema = z.object({
  name: z.string(),
  bio: z.string()
})
export type ProfileUpdateNameBioJsonType = z.infer<typeof profileUpdateNameBioJsonSchema>

export const profileUpdateAboutMdJsonSchema = z.object({
  aboutMarkdown: z.string()
})
export type ProfileUpdateAboutMdJsonType = z.infer<typeof profileUpdateAboutMdJsonSchema>

// export const profileUpdateSocialMediasJsonSchema = z.object({
//   socialMedias: z.array(z.object({
//     uuid: z.string(),
//     name: z.string(),
//     description: z.string(),
//     link: z.string(),
//     fontawesomeClass: z.string()
//   }))
// })
export const profileUpdateSocialMediasJsonSchema = typesProfileStoreSchema.pick({
  socialMedias: true
})
export type ProfileUpdateSocialMediasJsonType = z.infer<typeof profileUpdateSocialMediasJsonSchema>

export const profileDeleteAvatarByUuidParamSchema = uuidParamSchema
export type ProfileDeleteAvatarByUuidParamType = z.infer<typeof profileDeleteAvatarByUuidParamSchema>

export const profileUpdateAvatarJsonSchema = z.object({
  uuid: z.string()
})
export type ProfileUpdateAvatarJsonType = z.infer<typeof profileUpdateAvatarJsonSchema>

export const profileDeleteExternalIconByUuidParamSchema = uuidParamSchema
export type ProfileDeleteExternalIconByUuidParamType = z.infer<typeof profileDeleteExternalIconByUuidParamSchema>

// export const profileUpdateExternalLinksJsonSchema = z.object({
//   externalLinks: z.array(z.object({
//     uuid: z.string(),
//     name: z.string(),
//     description: z.string(),
//     link: z.string(),
//     icon: z.string(),
//     isCircle: z.boolean(),
//     type: z.enum(['contact', 'friend'])
//   })),
// })
export const profileUpdateExternalLinksJsonSchema = typesProfileStoreSchema.pick({
  externalLinks: true
})
export type ProfileUpdateExternalLinksJsonType = z.infer<typeof profileUpdateExternalLinksJsonSchema>
