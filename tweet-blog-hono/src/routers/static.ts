import { Hono } from 'hono'
import { serveStatic } from 'hono/serve-static'
import fsp from 'fs/promises'
import { staticConfig } from '@/configs'

const router = new Hono()

staticConfig.files.forEach((file) => {
  router.use(file.path, serveStatic({
    root: file.root,
    getContent: async (path, c) => {
      try {
        const content = await fsp.readFile(path)
        // 有类型问题，但是运行时没问题，先as了
        // getContent 需要返回的是 Data | Response | null
        return content as any
      } catch (error) {
        return null
      }
    },
    onFound: (_path, c) => {
      staticConfig.settings.forEach(setting => {
        if (setting.pathReg.test(_path)) {
          setting.headers.forEach(header => {
            c.header(header.name, header.value)
          })
        }
      })
    }
  }))
})

export default router
