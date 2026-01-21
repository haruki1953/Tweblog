import { platformKeyMap } from '@/config'
import type { ImportPostList } from '@/types'
import {
  xtwitterCoreUserSchema,
  xtwitterEntriesItemHaveItemContentSchema,
  xtwitterEntriesItemHaveItemsSchema,
  xtwitterInstructionsItemSchema,
  xtwitterItemContentSchema,
  xtwitterMediaItemSchema,
  xtwitterResSchema,
  xtwitterTweetResultsSchema,
  xtwitterUrlsItemSchema
} from './schemas'
import {
  processContent,
  processCreatedAt,
  processImageLink,
  processPlatformLink
} from './utils'

const platform = platformKeyMap.X.key

export const dataProcessXtwitterService = (
  jsonData: string
): ImportPostList | null => {
  const dataAny = JSON.parse(jsonData)
  const xtwitterResResult = xtwitterResSchema.safeParse(dataAny)
  if (!xtwitterResResult.success) {
    return null
  }

  // instructions 是一个数组，entries 在其中的某一项中，需要找一下
  const instructions_list =
    xtwitterResResult.data.data.user.result.timeline_v2.timeline.instructions

  // 寻找 instructions 包含 entries 的项
  let entries_list
  for (const instructions_item of instructions_list) {
    const xtwitterInstructionsItemResult =
      xtwitterInstructionsItemSchema.safeParse(instructions_item)
    if (xtwitterInstructionsItemResult.success) {
      entries_list = xtwitterInstructionsItemResult.data.entries
    }
  }
  if (entries_list == null) {
    return null
  }

  // 整理帖子数据
  const importPosts: ImportPostList = []
  // entries_item 中 itemContent 包含帖子数据，而 itemContent 的位置不固定
  // 可能直接存在 entries_item 中，也可能存在于 entries_item 中的 items 数组中
  for (const entries_item of entries_list) {
    // 尝试找到 itemContent
    const xtwitterEntriesItemHaveItemContentResult =
      xtwitterEntriesItemHaveItemContentSchema.safeParse(entries_item)
    if (xtwitterEntriesItemHaveItemContentResult.success) {
      const itemContent_obj =
        xtwitterEntriesItemHaveItemContentResult.data.content.itemContent
      const post = dataProcessXtwitterService_ProcessPostInItemcontent({
        itemContent_obj
      })
      if (post != null) {
        importPosts.push(post)
      }
      continue
    }
    // 未找到 itemContent，那么在 items 数组中寻找
    const xtwitterEntriesItemHaveItemsResult =
      xtwitterEntriesItemHaveItemsSchema.safeParse(entries_item)
    if (xtwitterEntriesItemHaveItemsResult.success) {
      const items_list = xtwitterEntriesItemHaveItemsResult.data.content.items
      for (const items_item of items_list) {
        const itemContent_obj = items_item.item.itemContent
        const post = dataProcessXtwitterService_ProcessPostInItemcontent({
          itemContent_obj
        })
        if (post != null) {
          importPosts.push(post)
        }
      }
      continue
    }
  }
  return importPosts
}

// 在 itemContent_obj 中解析推文数据
export const dataProcessXtwitterService_ProcessPostInItemcontent = (data: {
  itemContent_obj: any
}) => {
  const { itemContent_obj } = data
  const xtwitterItemContentResult =
    xtwitterItemContentSchema.safeParse(itemContent_obj)
  if (!xtwitterItemContentResult.success) {
    return null
  }
  const itemContent = xtwitterItemContentResult.data
  const result = (() => {
    const result = itemContent.tweet_results.result
    // 如果有转贴则以转贴为准
    const xtwitterTweetResultsResult = xtwitterTweetResultsSchema.safeParse(
      result.legacy.retweeted_status_result
    )
    if (xtwitterTweetResultsResult.success) {
      const retweeted_status_result = xtwitterTweetResultsResult.data
      return retweeted_status_result.result
    }
    return result
  })()
  const legacy = result.legacy

  // user 用户信息 将用于拼接帖子链接
  const user = dataProcessXtwitterService_ProcessUserInCoreUser({
    core_obj: result.core
  })

  // 媒体信息
  const media = (() => {
    // 尝试使用 legacy.entities?.media
    if (legacy.entities?.media != null && legacy.entities.media.length > 0) {
      return dataProcessXtwitterService_ProcessMediaInMediaList({
        media_list: legacy.entities.media
      })
    }
    // 默认返回空数组
    return []
  })()

  // 链接信息
  const urls = (() => {
    if (legacy.entities?.urls != null && legacy.entities.urls.length > 0) {
      return dataProcessXtwitterService_ProcessUrlsInUrlsList({
        urls_list: legacy.entities.urls
      })
    }
    return []
  })()

  // 整理帖子信息
  const { created_at, full_text, id_str, in_reply_to_status_id_str } = legacy
  const content = processContent({ full_text, media, urls })
  const createdAt = processCreatedAt({ created_at })
  // const platform = platformKeyMap.X.key
  const platformId = id_str
  const platformLink = processPlatformLink({ id_str, user })
  const platformParentId = in_reply_to_status_id_str || null
  // 整理图片信息
  const importImages = media.map((i) => {
    const { id_str, ext_alt_text, media_url_https } = i
    const link = processImageLink({ media_url_https })
    const alt = ext_alt_text
    // const platform = platformKeyMap.X.key
    const platformId = id_str
    return {
      createdAt,
      link,
      alt,
      platform,
      platformId
    }
  })
  return {
    content,
    createdAt,
    platform,
    platformId,
    platformLink,
    platformParentId,
    importImages
  }
}

// 在 core user_results 中获取用户信息
export const dataProcessXtwitterService_ProcessUserInCoreUser = (data: {
  core_obj: any
}) => {
  const { core_obj } = data
  const xtwitterCoreUserResult = xtwitterCoreUserSchema.safeParse(core_obj)
  if (!xtwitterCoreUserResult.success) {
    return null
  }
  const core = xtwitterCoreUserResult.data
  const legacy = core.user_results.result.legacy
  return {
    screen_name: legacy.screen_name
  }
}

// 在 media 中获取媒体信息
export const dataProcessXtwitterService_ProcessMediaInMediaList = (data: {
  media_list: any[]
}) => {
  const { media_list } = data
  const media = []
  for (const media_item of media_list) {
    const xtwitterMediaItemResult =
      xtwitterMediaItemSchema.safeParse(media_item)
    if (!xtwitterMediaItemResult.success) {
      continue
    }
    const {
      id_str,
      ext_alt_text = '',
      media_url_https,
      url
    } = xtwitterMediaItemResult.data
    media.push({
      id_str,
      ext_alt_text,
      media_url_https,
      url
    })
  }
  return media
}

// 在 urls 中获取链接信息
export const dataProcessXtwitterService_ProcessUrlsInUrlsList = (data: {
  urls_list: any[]
}) => {
  const { urls_list } = data
  const urls = []
  for (const urls_item of urls_list) {
    //
    const xtwitterUrlsItemResult = xtwitterUrlsItemSchema.safeParse(urls_item)
    if (!xtwitterUrlsItemResult.success) {
      continue
    }
    const { expanded_url, url } = xtwitterUrlsItemResult.data
    urls.push({
      expanded_url,
      url
    })
  }
  return urls
}
