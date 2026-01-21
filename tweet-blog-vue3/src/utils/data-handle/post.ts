import type {
  Post,
  PostPoolItem,
  PostData,
  PostGetByCursorData,
  PostGetByIdData,
  Image
} from '@/types'
import { mergeArrays } from './base'

export const postGetByCursorDataHandle = (
  data: PostGetByCursorData
): PostData[][] => {
  // first handel data to `PostData[][]`

  // 1 将有关系的帖子合并在一起
  // 转为id二维数组
  const idTempGrid: string[][] = data.map((post) => {
    const idList: string[] = []
    if (post.parentPost != null) {
      idList.push(post.parentPost.id)
    }
    idList.push(post.id)
    return idList
  })
  // 合并有关系的数组
  const idRelationGrid = mergeArrays(idTempGrid)
  // 将合并后的数字二维数组转为帖子二维数组
  const postRelationGrid: PostData[][] = idRelationGrid.map((idList) => {
    return idList
      .map((id) => {
        let idPost: PostData | undefined
        data.some((post) => {
          if (post.id === id) {
            idPost = post
            return true
          }
          if (idPost === undefined && post.parentPost?.id === id) {
            idPost = {
              ...post.parentPost,
              parentPost: null
            }
          }
        })
        return idPost
      })
      .filter((post) => post) as PostData[]
  })

  // 2 按组整理数据，遍历postRelationGrid
  const postGroupInfoList: {
    latestPost: PostData
    postGroup: PostData[]
  }[] = []
  postRelationGrid.forEach((postList) => {
    const postGroup: PostData[] = []
    let latestPost: PostData
    // 1 找到主帖 parentPost === null
    const mainPost = postList.find((post) => post.parentPost === null)
    if (!mainPost) {
      // 出现错误，原样返回
      return postList
    }
    postGroup.push(mainPost)
    latestPost = mainPost

    // 2 递归处理回复与回复的回复
    const recursionToHandleReplies = (parentId: string) => {
      // 查找
      const replies = postList.filter(
        (post) => post.parentPost?.id === parentId
      )
      if (replies.length === 0) {
        return
      }
      // 排序，以日期 升序排序（最新的帖子在下）
      replies.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      // 判断最新的回复是不是当前最新的帖子
      const latestReplie = replies[replies.length - 1]
      if (
        new Date(latestReplie.createdAt).getTime() >
        new Date(latestPost.createdAt).getTime()
      ) {
        latestPost = latestReplie
      }

      // 递归查找回复的回复
      replies.forEach((repost) => {
        postGroup.push(repost)
        recursionToHandleReplies(repost.id)
      })
    }
    recursionToHandleReplies(mainPost.id)

    postGroupInfoList.push({
      postGroup,
      latestPost
    })
  })

  // 3 将postGroupList中的postGroup排序，
  // 以帖子数组中日期最新的帖子（最后一个）的日期 降序排序（最新的帖子组在上）
  postGroupInfoList.sort(
    (a, b) =>
      new Date(b.latestPost.createdAt).getTime() -
      new Date(a.latestPost.createdAt).getTime()
  )
  const postGroupList = postGroupInfoList.map((i) => i.postGroup)

  // console.log(idTempGrid)
  // console.log(idRelationGrid)

  // 241021 为images排序
  const postGroupListAfterHandlePostImagesOrder = postGroupList.map((group) => {
    return group.map((post) => {
      return handlePostImagesOrder(post)
    })
  })

  return postGroupListAfterHandlePostImagesOrder
}

const handlePostWithNotReplies = (post: PostData | Post): PostData => {
  let parentPost = null
  if ('parentPost' in post && post.parentPost != null) {
    parentPost = post.parentPost
  }
  const postData = {
    ...post,
    parentPost,
    replies: undefined
  }
  return postData
}
const handlePostWithNotParent = (post: PostData | Post): Post => {
  const postData = {
    ...post,
    parentPost: undefined,
    replies: undefined
  }
  return postData
}

// 类型守卫函数
// function isNumberArray(arr: any[]): arr is number[] {
//   return arr.every((item) => typeof item === 'number')
// }
function isStringArray(arr: any[]): arr is string[] {
  return arr.every((item) => typeof item === 'string')
}
// 利用 imagesOrder 对 images 排序
const handlePostImagesOrder = <T extends PostData>(post: T): T => {
  let newImages: Image[] = []
  try {
    if (post.imagesOrder == null) {
      throw new Error()
    }
    const imagesOrderIdList = JSON.parse(post.imagesOrder)
    if (
      !Array.isArray(imagesOrderIdList) ||
      !isStringArray(imagesOrderIdList)
    ) {
      throw new Error()
    }
    const imagesOrderList = imagesOrderIdList
      .map((imgId) => {
        return post.images.find((img) => img.id === imgId)
      })
      .filter((img): img is Image => img !== undefined)
    newImages = imagesOrderList
  } catch (error) {
    newImages = post.images
  }
  return {
    ...post,
    images: newImages
  }
}

export const postGetByIdDataHandle = (data: PostGetByIdData): PostPoolItem => {
  const mainPost = {
    ...handlePostWithNotReplies(data),
    postForwards: data.postForwards,
    postImports: data.postImports
  }

  const parentPost = data.parentPost
    ? handlePostWithNotReplies(data.parentPost)
    : null

  const replies: PostData[][] = data.replies.map((post) => {
    const mainPostInGroup = handlePostWithNotReplies(post)
    mainPostInGroup.parentPost = handlePostWithNotParent(mainPost)

    const repliePostListInGroup = post.replies.map((p) => {
      const repliePostInGroup = handlePostWithNotReplies(p)
      repliePostInGroup.parentPost = handlePostWithNotParent(mainPostInGroup)
      return repliePostInGroup
    })
    // 升序排序 （二级回复）
    repliePostListInGroup.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    const postGroup: PostData[] = [mainPostInGroup, ...repliePostListInGroup]
    return postGroup
  })
  // 升序排序 依据第一个帖子（一级回复）
  replies.sort(
    (a, b) =>
      new Date(a[0].createdAt).getTime() - new Date(b[0].createdAt).getTime()
  )

  // 241021 为images排序
  const mainPostAfterHandlePostImagesOrder = handlePostImagesOrder(mainPost)
  const parentPostAfterHandlePostImagesOrder = (() => {
    if (parentPost == null) {
      return null
    }
    return handlePostImagesOrder(parentPost)
  })()
  const repliesAfterHandlePostImagesOrder = replies.map((group) => {
    return group.map((post) => {
      return handlePostImagesOrder(post)
    })
  })

  const now = new Date().toISOString()
  return {
    id: mainPost.id,
    pushAt: now,
    updateAt: now,
    mainPost: mainPostAfterHandlePostImagesOrder,
    parentPost: parentPostAfterHandlePostImagesOrder,
    replies: repliesAfterHandlePostImagesOrder
  }
}
