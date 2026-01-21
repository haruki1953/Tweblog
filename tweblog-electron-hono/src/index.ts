import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { httpPort, httpPortInit } from './configs'
import { apiRouter, staticRouter } from './routers'
import { handleGlobalError, handleResData } from './helpers'
import { startInitService } from './services'
import { checkOnlyOneDesktop, startElectronDesktop } from './desktop'

const app = new Hono()

app.use(cors())

app.route('/api', apiRouter)
app.route('/', staticRouter)

app.notFound((c) => {
  c.status(404)
  return c.json(handleResData(1, '404 Not Found'))
})

// global error handler
app.onError(handleGlobalError)

// 等待初始化再进行之后的启动操作
;(async () => {
  // 确保只有一个实例在运行
  const onlyOne = checkOnlyOneDesktop()
  if (!onlyOne) {
    // 虽然 checkOnlyOneDesktop 中有 quitApp，最好在这里也return
    // 以避免下面的操作又被执行，尤其是 startInitService 会初始化任务系统
    return
  }

  // 端口初始化
  await httpPortInit()

  // 服务初始化
  startInitService()

  // 启动hono服务器
  const server = serve({
    fetch: app.fetch,
    port: httpPort
  })

  // 启动electron桌面
  startElectronDesktop(server)
})().catch((error) => { console.log(error) })
