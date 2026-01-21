import { platformKeyMap } from '@/config'
import type { ImportPostList } from '@/types'
import { z } from 'zod'

const platform = platformKeyMap.Telegram.key

//
export const dataProcessTelegramService = (
  jsonData: string
): ImportPostList | null => {
  // tg的数据获取有两种情况，首次直接是直接在网页的html里，之后随着滚动会请求json，但json里只有字符串，字符串里还是html

  // 首先尝试解析json，不管是否成功，之后再解析html
  let strHtml = jsonData
  try {
    strHtml = JSON.parse(jsonData)
  } catch (error) {
    //
  }

  const domparser = new DOMParser()
  const doc = domparser.parseFromString(strHtml, 'text/html')
  // 这里是所有消息的内容
  const messageElList = doc.querySelectorAll(
    '.tgme_widget_message_wrap.js-widget_message_wrap'
  )

  // 准备ImportPostList
  const importPostList: ImportPostList = []
  for (const messageEl of messageElList) {
    // 是否是服务消息，是则应该跳过
    // 比如 Tomoko RD pinned «2月决定就是: ACG Stickers | ACG表情... »
    // 这会和已有的帖子重复
    const isServiceMessage = (() => {
      const val = messageEl.querySelector(
        '.tgme_widget_message.service_message'
      )
      if (val == null) {
        return false
      }
      return true
    })()
    if (isServiceMessage) {
      continue
    }

    // content
    const content = (() => {
      const val = messageEl
        .querySelector('.tgme_widget_message_text.js-message_text')
        // 对innerHTML处理，br替换为换行，删除标签，最终就是帖子内容
        ?.innerHTML.replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, '')
      return val || ''
    })()

    // createdAt
    const createdAt = (() => {
      const val = messageEl.querySelector('time')?.getAttribute('datetime')
      if (val == null) {
        return null
      }
      const valResult = z.coerce.date().safeParse(val)
      if (!valResult.success) {
        return null
      }
      return valResult.data.toISOString()
    })()
    if (createdAt == null) {
      // 值不正确时跳过此messageEl
      continue
    }

    // platformId platformLink
    const platformIdAndLink = (() => {
      const val = messageEl
        .querySelector('.tgme_widget_message_date')
        ?.getAttribute('href')
      if (val == null) {
        return null
      }
      return {
        platformId: tgLinkToPlatformId(val),
        platformLink: val
      }
    })()
    if (platformIdAndLink == null) {
      continue
    }
    const { platformId, platformLink } = platformIdAndLink

    // platformParentId 帖子在所属平台的父帖id
    const platformParentId = (() => {
      const val = messageEl
        .querySelector('.tgme_widget_message_reply')
        ?.getAttribute('href')
      if (val == null) {
        return null
      }
      return tgLinkToPlatformId(val)
    })()

    // importImages
    const importImages: ImportPostList[number]['importImages'] = []
    // 这是图片的内容
    const photoElList = messageEl.querySelectorAll(
      '.tgme_widget_message_photo_wrap'
    )
    for (const photoEl of photoElList) {
      // link
      const link = (() => {
        const val = photoEl.getAttribute('style')
        if (val == null) {
          return null
        }
        // val: "...;background-image:url('https://cdn5.cdn-telegram.org/file/....jpg')"
        // 用正则表达式获取图片链接
        const regex = /background-image:url\('([^']+)'\)/
        const match = val.match(regex)
        const imageLink = (() => {
          if (match) {
            return match[1]
          } else {
            return null
          }
        })()
        return imageLink
      })()
      if (link == null) {
        continue
      }

      // platformId
      const platformId = (() => {
        const val = photoEl.getAttribute('href')
        if (val == null) {
          return null
        }
        // 可能是 https://t.me/tomoko_channel/909
        // 或 https://t.me/harukiOwO/29?single
        // 所以首先尝试去除尾部的 ?single
        const cleanedUrl = val.replace(/\?single$/, '')
        return tgLinkToPlatformId(cleanedUrl)
      })()
      if (platformId == null) {
        continue
      }

      importImages.push({
        createdAt,
        link,
        alt: '', // tg好像没有alt
        platform,
        platformId
      })
    }

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

  // console.log(messageElList)
  // console.log(importPostList)
  return importPostList
}

// Telegram 链接转为 PlatformId 如 @tomoko_channel/927
const tgLinkToPlatformId = (link: string) => {
  // 将字符串 https://t.me/tomoko_channel/927 处理为 tomoko_channel/927
  const usernameAndMessageId = link.substring('https://t.me/'.length)
  // id应该加上 @ 。 tomoko_channel/927 处理为 @tomoko_channel/927
  const chatidAndMessageId = '@' + usernameAndMessageId
  return chatidAndMessageId
}
