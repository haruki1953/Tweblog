import { adminLoginJsonSchema, imageGetByCursorParamSchema, imageGetByCursorQuerySchema, imageGetByIdParamSchema, postGetByCursorParamSchma, postGetByCursorQuerySchma, postGetByIdParamSchema, postGetByIdQuerySchma } from '@/schemas'
import { adminLoginService, imageGetByCursorService, imageGetByIdService, postGetByCursorService, postGetByIdService, profileGetDataService, profileGetStoreService } from '@/services'
import { handleResData, zValWEH } from '@/helpers'
import { Hono } from 'hono'
import { maskSensitiveToken, useLogUtil } from '@/utils'
import { AppError } from '@/classes'
import { type PostGetByCursorData, type PostGetByIdData } from '@/types'

const router = new Hono()

const logUtil = useLogUtil()

router.post(
  '/admin-login',
  zValWEH('json', adminLoginJsonSchema),
  async (c) => {
    const {
      username, password
    } = c.req.valid('json')

    // 获取请求信息
    const xForwardedFor = c.req.header('x-forwarded-for')
    const xRealIp = c.req.header('x-real-ip')
    const userAgent = c.req.header('user-agent')
    const referer = c.req.header('referer')

    const token = await adminLoginService(username, password).catch((error) => {
      if (!(error instanceof AppError)) {
        throw error
      }
      const title = '登录失败 | ' + error.message

      logUtil.warning({
        title,
        content:
        `username: ${username}\n` +
        `password: ${maskSensitiveToken(password)}\n` +
        `x-forwarded-for: ${xForwardedFor}\n` +
        `x-real-ip: ${xRealIp}\n` +
        `user-agent: ${userAgent}\n` +
        `referer: ${referer}\n`
      })
      throw error
    })
    logUtil.success({
      title: '登陆成功',
      content:
      `x-forwarded-for: ${xForwardedFor}\n` +
      `x-real-ip: ${xRealIp}\n` +
      `user-agent: ${userAgent}\n` +
      `referer: ${referer}\n`
    })

    c.status(200)
    return c.json(handleResData(0, '登陆成功', token))
  }
)

router.get(
  '/post/id/:id',
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
  '/post/cursor/:id?',
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

router.get(
  '/image/id/:id',
  zValWEH('param', imageGetByIdParamSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const data = await imageGetByIdService(id)
    c.status(200)
    return c.json(handleResData(0, '获取成功', data))
  }
)

router.get(
  '/image/cursor/:id?',
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

router.get(
  '/profile/all',
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

export default router
