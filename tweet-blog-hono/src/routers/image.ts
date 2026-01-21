/* eslint-disable drizzle/enforce-delete-with-where */
import { AppError } from '@/classes'
import { imageDeleteOriginalParamSchema, imageDeleteParamSchema, imageGetByCursorParamSchema, imageGetByCursorQuerySchema, imageGetByIdParamSchema, imageUpdateJsonSchema } from '@/schemas'
import { imageDeleteAllOriginalService, imageDeleteAllService, imageDeleteOriginalService, imageDeleteService, imageGetByCursorService, imageGetByIdService, imageSendService, imageUpdateService } from '@/services'
import { useAdminSystem } from '@/systems'
import { type UserJwtVariables } from '@/types'
import { handleImageInFormData, handleResData, zValWEH } from '@/helpers'
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'

const router = new Hono<{ Variables: UserJwtVariables }>()

const adminSystem = useAdminSystem()
// router.use(jwt({ secret: adminSystem.getJwtAdminSecretKey() }))
router.use(async (c, next) => {
  // 动态获取最新的 JWT 密钥
  const secret = adminSystem.getJwtAdminSecretKey()
  // 使用获取到的密钥调用 JWT 中间件
  await jwt({ secret })(c, next)
})

router.post(
  '/',
  async (c) => {
    const formData = await c.req.formData().catch(() => {
      throw new AppError('未上传表单')
    })

    const imageFile = handleImageInFormData(formData, 'image')

    const data = await imageSendService(imageFile)

    c.status(201)
    return c.json(handleResData(0, '发送成功', data))
  }
)

router.patch(
  '/',
  zValWEH('json', imageUpdateJsonSchema),
  async (c) => {
    const imageInfo = c.req.valid('json')

    const data = await imageUpdateService(imageInfo)

    c.status(200)
    return c.json(handleResData(0, '修改成功', data))
  }
)

// router.get(
//   '/config',
//   (c) => {
//     const data = imageGetConfigService()
//     c.status(200)
//     return c.json(handleResData(0, '获取成功', data))
//   }
// )

// router.put(
//   '/config',
//   zValWEH('json', imageUpdateConfigJsonSchema),
//   (c) => {
//     const configInfo = c.req.valid('json')

//     imageUpdateConfigService(configInfo)

//     c.status(200)
//     return c.json(handleResData(0, '修改成功'))
//   }
// )

router.delete(
  '/id/:id',
  zValWEH('param', imageDeleteParamSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const data = await imageDeleteService(id)
    c.status(200)
    return c.json(handleResData(0, '删除成功', data))
  }
)

router.delete(
  '/all',
  async (c) => {
    const data = await imageDeleteAllService()
    c.status(200)
    return c.json(handleResData(0, '删除成功', data))
  }
)

router.delete(
  '/original/id/:id',
  zValWEH('param', imageDeleteOriginalParamSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const data = await imageDeleteOriginalService(id)
    c.status(200)
    return c.json(handleResData(0, '删除成功', data))
  }
)

router.delete(
  '/original/all',
  async (c) => {
    const data = await imageDeleteAllOriginalService()
    c.status(200)
    return c.json(handleResData(0, '删除成功', data))
  }
)

router.get(
  '/id/:id',
  zValWEH('param', imageGetByIdParamSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const data = await imageGetByIdService(id)
    c.status(200)
    return c.json(handleResData(0, '获取成功', data))
  }
)

router.get(
  '/cursor/:id?',
  zValWEH('param', imageGetByCursorParamSchema),
  zValWEH('query', imageGetByCursorQuerySchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const query = c.req.valid('query')

    const data = await imageGetByCursorService(id, query)
    c.status(200)
    return c.json(handleResData(0, '获取成功', data))
  }
)

export default router
