import { z } from 'zod'

export const typesProfileStoreSchema = z.object({
  avatar: z.string().nullable(),
  avatarArray: z.array(z.object({
    uuid: z.string(),
    path: z.string(),
    size: z.number(),
    addAt: z.coerce.date()
  })),
  name: z.string(),
  bio: z.string(),
  socialMedias: z.array(z.object({
    uuid: z.string(),
    name: z.string(),
    description: z.string(),
    link: z.string(),
    fontawesomeClass: z.string()
  })),
  aboutMarkdown: z.string(),
  externalLinks: z.array(z.object({
    uuid: z.string(),
    name: z.string(),
    description: z.string(),
    link: z.string(),
    icon: z.string(),
    isCircle: z.boolean(),
    type: z.enum(['contact', 'friend'])
  })),
  externalIcons: z.array(z.object({
    uuid: z.string(),
    path: z.string(),
    size: z.number(),
    addAt: z.coerce.date()
  }))
})
