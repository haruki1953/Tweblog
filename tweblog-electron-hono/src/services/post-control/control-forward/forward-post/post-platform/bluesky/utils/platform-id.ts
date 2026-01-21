// Bluesky 的 PlatformPostId 结构特殊，是json字符串
// 需注意json的顺序，顺序绝对不能错。否则相同帖子生成的字符串不同，当作id使用就会出错
// 所以每次生成时，都要手动填写新的json对象，不要直接用原有的对象生成
// const json = {
//   // 本帖子的数据
//   post: {
//     uri: 'at://did:plc:fju6cv4shmqbymfqc7jvzkya/app.bsky.feed.post/3liisyclmrd2b',
//     cid: 'bafyreif6ks5kpvammt45bgtj6prk767hjav6mbfqspgvbov7fv7dgkm5bq'
//   },
//   // 根帖子的数据，如果本帖就是根帖就填本贴的数据
//   root: {
//     uri: 'at://did:plc:fju6cv4shmqbymfqc7jvzkya/app.bsky.feed.post/3liisyclmrd2b',
//     cid: 'bafyreif6ks5kpvammt45bgtj6prk767hjav6mbfqspgvbov7fv7dgkm5bq'
//   }
// }
// const str = JSON.stringify(json)

import { z } from 'zod'

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

// 解析 PlatformPostId
export const blueskyPlatformPostIdParseUtil = (input: string) => {
  let idData
  try {
    idData = blueskyPlatformPostIdDataSchema.parse(JSON.parse(input))
  } catch (error) {
    return null
  }
  return idData
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
