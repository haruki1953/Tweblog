import { urlJoinUtil } from '@/utils'
import { z } from 'zod'

// 拼接 Bluesky 的链接
export const joinWebUrlBluesky = (data: {
  // https://bsky.app
  webHost: string
  // harukiowo.bsky.social
  identifier: string // identifier 就是 author.handle
  // at://did:plc:fju6cv4shmqbymfqc7jvzkya/app.bsky.feed.post/3liisyclmrd2b
  uri: string
}) => {
  const { webHost, identifier, uri } = data
  // 3liisyclmrd2b
  const postStrId = blueskyUriToPostStrId(uri) ?? ''
  // https://bsky.app/profile/harukiowo.bsky.social/post/3liisyclmrd2b
  return urlJoinUtil(webHost, `profile/${identifier}/post/${postStrId}`)
}

// 将 uri 转为 帖子字符串标识
export const blueskyUriToPostStrId = (
  // at://did:plc:fju6cv4shmqbymfqc7jvzkya/app.bsky.feed.post/3liisyclmrd2b
  uri: string
) => {
  const parts = uri.split('/')
  if (parts.length === 0) {
    return null
  }
  // 3liisyclmrd2b
  return parts[parts.length - 1]
}

// 从图片链接解析出 refLink，用来充当图片id
export const blueskyImageUrlToRefLink = (
  // https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:fju6cv4shmqbymfqc7jvzkya/bafkreia2neu2ji3edzipbdex4ndmsej3bs5l4oeh7v36fx27inop5jymtm@jpeg
  url: string
) => {
  // eslint-disable-next-line no-useless-escape
  const match = url.match(/\/([^\/]+?)(?:@[^\/]*)?$/)
  return match ? match[1] : null
}

// 生成 PlatformPostId
export const blueskyPlatformPostIdStringifyUtil = (
  idData: z.infer<typeof blueskyPlatformPostIdDataSchema>
) => {
  const json = {
    post: {
      uri: idData.post.uri,
      cid: idData.post.cid
    },
    root: {
      uri: idData.root.uri,
      cid: idData.root.cid
    }
  }
  return JSON.stringify(json)
}

const blueskyPlatformPostIdDataSchema = z.object({
  post: z.object({
    uri: z.string(),
    cid: z.string()
  }),
  root: z.object({
    uri: z.string(),
    cid: z.string()
  })
})
