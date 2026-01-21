import { useFetchSystem } from '@/systems'
import { urlJoinUtil } from '@/utils'
import { z } from 'zod'
import { handleBlueskyRes } from './base'
import { type blueskyBlobSchema } from './bsky-blob'
import { blueskyPostContentInfoUtil } from './dependencies'

const fetchSystem = useFetchSystem()

const blueskyRecordSchema = z.object({
  uri: z.string(),
  cid: z.string()
})

// 发送帖子
// https://docs.bsky.app/docs/api/com-atproto-repo-create-record
export const blueskyCreateRecordApi = async (parameter: {
  pdsHost: string
  accessJwt: string
  repo: string
  text: string
  images: Array<{
    image: z.infer<typeof blueskyBlobSchema>['blob']
    alt?: string | null
    aspectRatio?: {
      width: number
      height: number
    }
  }>
  reply?: {
    root: {
      uri: string
      cid: string
    }
    parent: {
      uri: string
      cid: string
    }
  }
}) => {
  const {
    pdsHost,
    accessJwt,
    repo,
    text,
    images,
    reply
  } = parameter

  const contentInfo = blueskyPostContentInfoUtil(text)

  const res = await fetchSystem.fetchProxy(
    urlJoinUtil(pdsHost, 'xrpc/com.atproto.repo.createRecord'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessJwt}`
      },
      body: JSON.stringify({
        repo,
        collection: 'app.bsky.feed.post',
        record: {
          $type: 'app.bsky.feed.post',
          text: contentInfo.textContent,
          createdAt: new Date().toISOString(),
          reply,
          embed: {
            $type: 'app.bsky.embed.images',
            images: images.map(i => {
              return {
                image: i.image,
                alt: (() => {
                  if (i.alt == null) {
                    return ''
                  }
                  return i.alt
                })(),
                aspectRatio: i.aspectRatio
              }
            })
          },
          // 处理链接
          facets: contentInfo.linkInfo.map((i) => {
            return {
              index: {
                byteStart: i.byteStart,
                byteEnd: i.byteEnd
              },
              features: [{
                $type: 'app.bsky.richtext.facet#link',
                uri: i.link
              }]
            }
          })
        }
      })
    }
  )

  return await handleBlueskyRes({
    res,
    resultSchema: blueskyRecordSchema,
    apiName: 'CreateRecord'
  })
}
