import he from 'he'
import type {
  XtwitterCoreUser,
  XtwitterMediaList,
  XtwitterUrlList
} from './types'

// 处理推文文字内容，
// 1 将短链接替换为正常的链接
// 2 去掉内容最后可能会有的图片链接
// 3 需要视情况裁剪掉 转贴、回复等字样
// 4 解析HTML字符实体（&gt; &lt;）
export const processContent = (data: {
  // "full_text": "RT @harukiO_0: @sirongzi 这一下好心动 https://t.co/c2gZUhfWby"
  // "full_text": "RT @sakiko214: https://t.co/b2xO1VE7SF\n终于给番剧小窝实现了番剧的更新提示，感觉变得活跃了很多 https://t.co/wJ4XMuVDn6"
  // "full_text": "上火了，嘴烂了好难受，炫了10粒维生素c，希望明天能好点\uD83D\uDE07"
  full_text: string
  media: XtwitterMediaList
  urls: XtwitterUrlList
}) => {
  const { full_text, media, urls } = data
  // 将短链接替换为正常链接
  let processedText = full_text
  urls.forEach((url) => {
    processedText = processedText.replace(url.url, url.expanded_url)
  })

  // 去掉内容最后的图片链接
  media.forEach((mediaItem) => {
    // processedText = processedText.replace(mediaItem.url, '')
    processedText = processedText.replace(new RegExp(` ?${mediaItem.url}$`), '')
  })

  // 处理转贴和回复的字样
  processedText = processedText.replace(/^(RT @\w+: )?(@\w+ )?/, '')

  // 解析HTML字符实体（&gt; &lt;）
  processedText = he.decode(processedText)

  return processedText
}

// 处理时间
export const processCreatedAt = (data: {
  // "created_at": "Mon Nov 04 07:52:53 +0000 2024",
  created_at: string
}) => {
  const { created_at } = data
  const date = new Date(created_at)
  return date.toISOString()
}

// 处理帖子链接
export const processPlatformLink = (data: {
  //
  id_str: string
  user: XtwitterCoreUser
}) => {
  const { id_str, user } = data
  return `https://x.com/${user?.screen_name || '_'}/status/${id_str}`
}

// 处理图片链接，将其拼接为大图链接
export const processImageLink = (data: {
  // "media_url_https": "https://pbs.twimg.com/media/GU1r9eGbsAAPu0K.jpg"
  media_url_https: string
}) => {
  const { media_url_https } = data
  // 转为这个样子 https://pbs.twimg.com/media/GU1r9eGbsAAPu0K?format=jpg&name=large
  // 自动通过 media_url_https 的 .xxx 来判断 format=xxx，没有 .xxx 时默认jpg
  const formatMatch = media_url_https.match(/\.(\w+)$/)
  let format
  let baseurl
  if (formatMatch) {
    format = formatMatch[1]
    // 在media_url_https的末尾去掉 `.${format}`，
    baseurl = media_url_https.slice(0, -`.${format}`.length)
  } else {
    format = 'jpg'
    baseurl = media_url_https
  }
  return `${baseurl}?format=${format}&name=large`
}
