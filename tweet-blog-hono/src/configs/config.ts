// get backend port from env
let httpPort = Number(process.env.TWEBLOG_PORT)
// default port
if (Number.isNaN(httpPort)) {
  httpPort = 3000
}
export { httpPort }

export const postConfig = {
  // 不再将帖子的图片限制为4个
  // postMaxImages: 4,
  postNumInPage: 20,
  imageNumInPage: 20
} as const
