/* eslint-disable drizzle/enforce-delete-with-where */
import { profileDeleteAvatarByUuidParamSchema, profileDeleteExternalIconByUuidParamSchema, profileUpdateAboutMdJsonSchema, profileUpdateAvatarJsonSchema, profileUpdateExternalLinksJsonSchema, profileUpdateNameBioJsonSchema, profileUpdateSocialMediasJsonSchema } from '@/schemas'
import { profileAddAvatarService, profileAddExternalIconService, profileDeleteAvatarByUuidService, profileDeleteAvatarNotUsedService, profileDeleteExternalIconByUuidService, profileDeleteExternalIconNotUsedService, profileGetDataService, profileGetStoreService, profileUpdateAboutMdService, profileUpdateAvatarService, profileUpdateExternalLinksService, profileUpdateNameBioService, profileUpdateSocialMediasService } from '@/services'
import { handleImageInFormData, handleResData, zValWEH } from '@/helpers'
import { Hono } from 'hono'
import { type UserJwtVariables } from '@/types'
import { useAdminSystem } from '@/systems'
import { jwt } from 'hono/jwt'
import { AppError } from '@/classes'

const router = new Hono<{ Variables: UserJwtVariables }>()

const adminSystem = useAdminSystem()
// router.use(jwt({ secret: adminSystem.getJwtAdminSecretKey() }))
router.use(async (c, next) => {
  // 动态获取最新的 JWT 密钥
  const secret = adminSystem.getJwtAdminSecretKey()
  // 使用获取到的密钥调用 JWT 中间件
  await jwt({ secret })(c, next)
})

router.get(
  '/test',
  async (c) => {
    c.status(200)
    return c.json(handleResData(0, '测试成功'))
  }
)

router.get(
  '/data',
  async (c) => {
    // 帖子、图片统计
    const data = await profileGetDataService()

    c.status(200)
    return c.json(handleResData(0, '获取成功', data))
  }
)

router.get(
  '/store',
  async (c) => {
    // profileStore信息
    const data = await profileGetStoreService()

    c.status(200)
    return c.json(handleResData(0, '获取成功', data))
  }
)

router.get(
  '/all',
  async (c) => {
    // 获取全部信息，包括profileStore信息，帖子、图片统计
    const database = await profileGetDataService()
    const store = await profileGetStoreService()

    const data = {
      data: database,
      store
    }
    c.status(200)
    return c.json(handleResData(0, '获取成功', data))
  }
)

router.put(
  '/name-bio',
  zValWEH('json', profileUpdateNameBioJsonSchema),
  async (c) => {
    const { name, bio } = c.req.valid('json')
    const data = profileUpdateNameBioService(name, bio)

    c.status(200)
    return c.json(handleResData(0, '修改成功', data))
  }
)

router.put(
  '/about-md',
  zValWEH('json', profileUpdateAboutMdJsonSchema),
  async (c) => {
    const { aboutMarkdown } = c.req.valid('json')
    const data = profileUpdateAboutMdService(aboutMarkdown)

    c.status(200)
    return c.json(handleResData(0, '修改成功', data))
  }
)

router.put(
  '/social-medias',
  zValWEH('json', profileUpdateSocialMediasJsonSchema),
  async (c) => {
    const { socialMedias } = c.req.valid('json')
    const data = profileUpdateSocialMediasService(socialMedias)

    c.status(200)
    return c.json(handleResData(0, '修改成功', data))
  }
)

// avatar
router.post(
  '/avatar',
  async (c) => {
    const formData = await c.req.formData().catch(() => {
      throw new AppError('未上传表单')
    })
    const imageFile = handleImageInFormData(formData, 'image')

    const data = await profileAddAvatarService(imageFile)

    c.status(201)
    return c.json(handleResData(0, '上传成功', data))
  }
)

router.delete(
  '/avatar/uuid/:uuid',
  zValWEH('param', profileDeleteAvatarByUuidParamSchema),
  async (c) => {
    const { uuid } = c.req.valid('param')
    const data = profileDeleteAvatarByUuidService(uuid)

    c.status(200)
    return c.json(handleResData(0, '删除成功', data))
  }
)

router.delete(
  '/avatar/not-used',
  async (c) => {
    const data = profileDeleteAvatarNotUsedService()

    c.status(200)
    return c.json(handleResData(0, '删除成功', data))
  }
)

router.put(
  '/avatar',
  zValWEH('json', profileUpdateAvatarJsonSchema),
  async (c) => {
    const { uuid } = c.req.valid('json')
    const data = profileUpdateAvatarService(uuid)

    c.status(200)
    return c.json(handleResData(0, '修改成功', data))
  }
)

// external-icon
router.post(
  '/external-icon',
  async (c) => {
    const formData = await c.req.formData().catch(() => {
      throw new AppError('未上传表单')
    })
    const imageFile = handleImageInFormData(formData, 'image')

    const data = await profileAddExternalIconService(imageFile)

    c.status(201)
    return c.json(handleResData(0, '上传成功', data))
  }
)

router.delete(
  '/external-icon/uuid/:uuid',
  zValWEH('param', profileDeleteExternalIconByUuidParamSchema),
  async (c) => {
    const { uuid } = c.req.valid('param')
    const data = profileDeleteExternalIconByUuidService(uuid)

    c.status(200)
    return c.json(handleResData(0, '删除成功', data))
  }
)

router.delete(
  '/external-icon/not-used',
  async (c) => {
    const data = profileDeleteExternalIconNotUsedService()

    c.status(200)
    return c.json(handleResData(0, '删除成功', data))
  }
)

router.put(
  '/external-links',
  zValWEH('json', profileUpdateExternalLinksJsonSchema),
  async (c) => {
    const { externalLinks } = c.req.valid('json')
    const data = profileUpdateExternalLinksService(externalLinks)

    c.status(200)
    return c.json(handleResData(0, '修改成功', data))
  }
)

export default router
