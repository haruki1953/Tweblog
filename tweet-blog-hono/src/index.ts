import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { appInfo, httpPort, systemAdminConfig } from './configs'
import { apiRouter, staticRouter } from './routers'
import { handleGlobalError, handleResData } from './helpers'
import { startInitService } from './services'

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

startInitService()

const defaultAdmin = systemAdminConfig.storeDefault()
console.log(`
  ========================================
              ${appInfo.copyright.text} 已启动
  ========================================
  
  公开访问: http://127.0.0.1:${httpPort}/
  
  管理访问: http://127.0.0.1:${httpPort}/admin/
  默认用户名: ${defaultAdmin.username}
  默认密码: ${defaultAdmin.password}

  ${appInfo.officialDocs.link}
  ${appInfo.copyright.link}
  
  ========================================
  `)

serve({
  fetch: app.fetch,
  port: httpPort
})
