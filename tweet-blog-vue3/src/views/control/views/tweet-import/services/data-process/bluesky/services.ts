import type { ImportPostList } from '@/types'
import { platformKeyMap } from '@/config'
import { z } from 'zod'
import { sakiNotification } from '@/utils'
import {
  blueskyImageUrlToRefLink,
  blueskyPlatformPostIdStringifyUtil,
  blueskyTextAndLinkInfoToContent,
  joinWebUrlBluesky
} from './utils'

const platform = platformKeyMap.Bluesky.key

export const dataProcessBlueskyService = (
  jsonData: string,
  jsonOption: string
): ImportPostList | null => {
  // 解析 jsonOption
  const optionInfo = blueskyJsonOptionProcess(jsonOption)
  if (optionInfo == null) {
    return null
  }
  // 解析 jsonData
  const dataInfo = blueskyJsonDataProcess(jsonData)
  if (dataInfo == null) {
    return null
  }
  // 准备ImportPostList
  const importPostList: ImportPostList = []
  for (const feedItem of dataInfo.feed) {
    // 解析 post
    const feedItemPost = (() => {
      const postData = feedItem.post

      // 解析 post.record
      const feedItemPostRecord = (() => {
        const recordData = postData.record

        // content
        const content = (() => {
          if (recordData.text == null) {
            return null
          }
          // TODO 链接处理
          const content_Text = recordData.text
          const content_LinkInfo = (() => {
            const facetsList = recordData.facets
            if (facetsList == null) {
              return null
            }
            const linkInfo: {
              byteStart: number
              byteEnd: number
              link: string
            }[] = []
            for (const facetsItem of facetsList) {
              const link = facetsItem.features.find((i) => i.uri != null)?.uri
              if (link == null) {
                continue
              }
              linkInfo.push({
                link,
                ...facetsItem.index
              })
            }
            return linkInfo
          })()

          if (content_LinkInfo == null) {
            return content_Text
          }
          //
          return blueskyTextAndLinkInfoToContent({
            text: content_Text,
            linkInfo: content_LinkInfo
          })
        })()
        if (content == null) {
          return null
        }

        // createdAt
        const createdAt = (() => {
          if (recordData.createdAt == null) {
            return null
          }
          const valResult = z.coerce.date().safeParse(recordData.createdAt)
          if (!valResult.success) {
            return null
          }
          return valResult.data.toISOString()
        })()
        if (createdAt == null) {
          return null
        }

        return {
          content,
          createdAt
        }
      })()
      if (feedItemPostRecord == null) {
        return null
      }
      const {
        //
        content,
        createdAt
      } = feedItemPostRecord

      // platformId_IdDataPost
      const platformId_IdDataPost = {
        uri: postData.uri,
        cid: postData.cid
      }

      // platformLink
      const platformLink = joinWebUrlBluesky({
        webHost: optionInfo.webHost,
        identifier: postData.author.handle,
        uri: postData.uri
      })

      // importImages
      const importImages = (() => {
        if (postData.embed?.images == null) {
          return []
        }
        const valList: ImportPostList[number]['importImages'] = []
        for (const imageItem of postData.embed.images) {
          const link = imageItem.fullsize
          const platformId = blueskyImageUrlToRefLink(link)
          if (platformId == null) {
            continue
          }
          const alt = imageItem.alt
          valList.push({
            createdAt,
            link,
            alt,
            platform,
            platformId
          })
        }
        return valList
      })()

      return {
        content,
        createdAt,
        importImages,
        platformLink,
        platformId_IdDataPost
      }
    })()
    if (feedItemPost == null) {
      continue
    }
    const {
      content,
      createdAt,
      importImages,
      platformLink,
      platformId_IdDataPost
    } = feedItemPost

    // platformId
    const platformId = (() => {
      const rootUri = feedItem.reply?.root.uri
      const rootCid = feedItem.reply?.root.cid
      if (rootUri == null || rootCid == null) {
        // 没有root（根帖）说明没有父帖，root应为本帖数据
        return blueskyPlatformPostIdStringifyUtil({
          post: platformId_IdDataPost,
          root: platformId_IdDataPost
        })
      }
      // 有root（根帖）
      return blueskyPlatformPostIdStringifyUtil({
        post: platformId_IdDataPost,
        root: {
          uri: rootUri,
          cid: rootCid
        }
      })
    })()

    // platformParentId
    const platformParentId = (() => {
      const parentUri = feedItem.reply?.parent.uri
      const parentCid = feedItem.reply?.parent.cid
      const rootUri = feedItem.reply?.root.uri
      const rootCid = feedItem.reply?.root.cid
      if (
        parentUri == null ||
        parentCid == null ||
        rootUri == null ||
        rootCid == null
      ) {
        return null
      }
      return blueskyPlatformPostIdStringifyUtil({
        post: {
          uri: parentUri,
          cid: parentCid
        },
        root: {
          uri: rootUri,
          cid: rootCid
        }
      })
    })()

    // 没有内容就忽略
    if (content === '' && importImages.length === 0) {
      continue
    }

    importPostList.push({
      content,
      createdAt,
      platform,
      platformId,
      platformLink,
      platformParentId,
      importImages
    })
  }
  // 原始的importPostList是时间降序的，将其反转，为时间升序，以此来保证回复生效
  importPostList.reverse()
  return importPostList
}

// 解析 jsonData
const blueskyJsonDataProcess = (jsonData: string) => {
  let dataInfo
  try {
    dataInfo = blueskyAuthorFeedSchema.parse(JSON.parse(jsonData))
  } catch (error) {
    return null
  }
  return dataInfo
}

// 解析 jsonOption
const blueskyJsonOptionProcess = (jsonOption: string) => {
  let optionInfo
  try {
    let optionJson
    try {
      optionJson = JSON.parse(jsonOption)
    } catch (error) {
      optionJson = undefined
    }
    optionInfo = jsonOptionSchema.parse(optionJson)
  } catch (error) {
    sakiNotification({
      type: 'error',
      title: 'json选项错误',
      message: String(error)
    })
    return null
  }
  return optionInfo
}

// blueskyAuthorFeedSchema
const blueskyAuthorFeedSchema = z.object({
  feed: z.array(
    z.object({
      post: z.object({
        uri: z.string(),
        cid: z.string(),
        author: z.object({
          did: z.string(),
          handle: z.string()
        }),
        record: z.object({
          text: z.string().optional(),
          createdAt: z.string().optional(),
          facets: z
            .array(
              z.object({
                features: z.array(
                  z.object({
                    uri: z.string().optional()
                  })
                ),
                index: z.object({
                  byteStart: z.number(),
                  byteEnd: z.number()
                })
              })
            )
            .optional()
        }),
        embed: z
          .object({
            images: z
              .array(
                z.object({
                  fullsize: z.string(),
                  alt: z.string()
                })
              )
              .optional()
          })
          .optional()
      }),
      reply: z
        .object({
          root: z.object({
            uri: z.string().optional(),
            cid: z.string().optional()
          }),
          parent: z.object({
            uri: z.string().optional(),
            cid: z.string().optional()
          })
        })
        .optional()
    })
  )
})

// {
//   "webHost": "https://bsky.app"
// }
// 不填将默认为 https://bsky.app
const jsonOptionSchema = z
  .object({
    webHost: z.string()
  })
  .default({
    webHost: 'https://bsky.app'
  })
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type JsonOptionType = z.infer<typeof jsonOptionSchema>
