import { type platformKeyMap } from '@/configs'
import { blueskyUploadBlobApi, blueskyCreateRecordApi, type DataForForwardPostPlatform, blueskyPlatformPostIdParseUtil, blueskyPlatformPostIdStringifyUtil, blueskyConfig } from './dependencies'
import Jimp from 'jimp'
import { blueskyGetSessionService } from './bluesky-session'
import { useLogUtil } from '@/utils'
import { AppError } from '@/classes'

const logUtil = useLogUtil()

type DataForForwardPostBluesky = DataForForwardPostPlatform<typeof platformKeyMap.Bluesky.key>

// bluesky发送帖子
export const blueskySendPostService = async (data: {
  pdsHost: string
  identifier: string
  password: string
  // accessJwt: string
  // repo: string
  text: string
  parentPostSamePlatformPostId: string | undefined
  targetImageList: DataForForwardPostBluesky['targetImageList']
}) => {
  const {
    pdsHost,
    identifier,
    password,
    text,
    parentPostSamePlatformPostId,
    targetImageList
  } = data

  // 身份验证
  const {
    accessJwt,
    did
  } = await blueskyGetSessionService({
    pdsHost,
    identifier,
    password
  })

  // 发送帖子前，上传图片
  const resUploadBlobInfoList = await Promise.all(targetImageList.map(async (i) => {
    const res = await blueskyUploadBlobApi({
      pdsHost,
      accessJwt,
      filePath: i.localLargeImagePath
    })
    const aspectRatio = await (async () => {
      const image = await Jimp.read(i.localLargeImagePath).catch(() => null)
      if (image == null) {
        return undefined
      }
      return { width: image.bitmap.width, height: image.bitmap.height }
    })()
    return {
      ...i,
      alt: i.alt?.slice(0, blueskyConfig.maxAltCharactersOnSend) ?? undefined,
      aspectRatio,
      image: res.blob,
      did
    }
  }))

  // 准备回复数据
  const reply = (() => {
    if (parentPostSamePlatformPostId == null) {
      return undefined
    }
    const parentIdData = blueskyPlatformPostIdParseUtil(parentPostSamePlatformPostId)
    if (parentIdData == null) {
      logUtil.info({
        title: '转发失败',
        content:
        'bluesky platformPostId 解析失败\n' +
        `platformPostId: ${parentPostSamePlatformPostId}\n`
      })
      throw new AppError('转发失败')
    }
    return {
      root: parentIdData.root,
      parent: parentIdData.post
    }
  })()

  // 发送帖子
  const resCreateRecord = await blueskyCreateRecordApi({
    pdsHost,
    accessJwt,
    repo: did,
    text,
    images: resUploadBlobInfoList,
    reply
  })

  return {
    did,
    resCreateRecord: {
      ...resCreateRecord,
      // 处理帖子id，生成为指定格式的platformPostId
      platformPostId: (() => {
        const parentIdData = (() => {
          if (parentPostSamePlatformPostId == null) {
            return null
          }
          return blueskyPlatformPostIdParseUtil(parentPostSamePlatformPostId)
        })()
        if (parentIdData == null) {
          return blueskyPlatformPostIdStringifyUtil({
            post: resCreateRecord,
            root: resCreateRecord
          })
        }
        return blueskyPlatformPostIdStringifyUtil({
          post: resCreateRecord,
          root: parentIdData.root
        })
      })()
    },
    resUploadBlobInfoList
  }
}
