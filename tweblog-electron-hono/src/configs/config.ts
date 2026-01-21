import portfinder from 'portfinder'

// get backend port from env
let httpPort = Number(process.env.TWEBLOG_PORT)
// default port
if (Number.isNaN(httpPort)) {
  httpPort = 51125
}
export { httpPort }

// 服务器运行前执行并await这个，确保端口未占用
export const httpPortInit = async () => {
  // 将开始搜索 httpPort 并扫描直到最大端口号
  httpPort = await portfinder.getPortPromise({
    port: httpPort
  })
}

export const postConfig = {
  // 不再将帖子的图片限制为4个
  // postMaxImages: 4,
  postNumInPage: 20,
  imageNumInPage: 20
} as const
