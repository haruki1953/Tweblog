/* eslint-disable drizzle/enforce-delete-with-where */
import { postDeleteAllQuerySchema, postDeleteParamSchema, postDeleteQuerySchema, postGetByCursorParamSchma, postGetByCursorQuerySchma, postGetByIdParamSchema, postGetByIdQuerySchma, postSendJsonSchema, postUpdateJsonSchema } from '@/schemas'
import { postDeleteAllService, postDeleteService, postGetByCursorService, postGetByIdService, postSendService, postUpdateService } from '@/services'
import { useAdminSystem } from '@/systems'
import { type PostGetByCursorData, type PostGetByIdData, type UserJwtVariables } from '@/types'
import { handleResData, zValWEH } from '@/helpers'
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
  zValWEH('json', postSendJsonSchema),
  async (c) => {
    const postInfo = c.req.valid('json')

    const data = await postSendService(postInfo)

    c.status(200)
    return c.json(handleResData(0, '发送成功', data))
  }
)

router.put(
  '/',
  zValWEH('json', postUpdateJsonSchema),
  async (c) => {
    const postInfo = c.req.valid('json')

    const data = await postUpdateService(postInfo)

    c.status(200)
    return c.json(handleResData(0, '修改成功', data))
  }
)

router.delete(
  '/id/:id',
  zValWEH('param', postDeleteParamSchema),
  zValWEH('query', postDeleteQuerySchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const query = c.req.valid('query')
    const data = await postDeleteService(id, query)
    c.status(200)
    return c.json(handleResData(0, '删除成功', data))
  }
)

router.delete(
  '/all',
  zValWEH('query', postDeleteAllQuerySchema),
  async (c) => {
    const query = c.req.valid('query')
    const data = await postDeleteAllService(query)
    c.status(200)
    return c.json(handleResData(0, '删除成功', data))
  }
)

router.get(
  '/id/:id',
  zValWEH('param', postGetByIdParamSchema),
  zValWEH('query', postGetByIdQuerySchma),
  async (c) => {
    const { id } = c.req.valid('param')
    const query = c.req.valid('query')

    const data: PostGetByIdData = await postGetByIdService(id, query)
    c.status(200)
    return c.json(handleResData(0, '获取成功', data))
  }
)

router.get(
  '/cursor/:id?',
  zValWEH('param', postGetByCursorParamSchma),
  zValWEH('query', postGetByCursorQuerySchma),
  async (c) => {
    const { id } = c.req.valid('param')
    const query = c.req.valid('query')

    const data: PostGetByCursorData = await postGetByCursorService(id, query)
    c.status(200)
    return c.json(handleResData(0, '获取成功', data))
  }
)

export default router
