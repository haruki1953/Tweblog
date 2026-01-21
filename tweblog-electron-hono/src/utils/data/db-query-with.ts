import { type DQWPostData, type DQWImageData, type DQWPostGetById, type DQWPostGetByCursor } from '@/types'

// 数据整理，处理查询数据

// 帖子的基本数据整理
const dataDQWPostDataHandle = (data: DQWPostData) => {
  // 整理images
  const images = data.postsToImages.map((pTIitem) => {
    return pTIitem.image
  })
  const _count = {
    // 计数replies
    replies: data.replies.length
  }
  return {
    ...data,
    images,
    _count,
    postsToImages: undefined,
    replies: undefined
  }
}
// 为了方便管理，dataDQWPostDataHandle不导出，以这个代替
export const dataDQWPostBaseHandle = (data: DQWPostData) => {
  return dataDQWPostDataHandle(data)
}

// 创建帖子后的查询数据处理
export const dataDQWPostSendHandle = (data: DQWPostData) => {
  return dataDQWPostDataHandle(data)
}

// 帖子id查询的查询数据处理
export const dataDQWPostGetByIdHandle = (data: DQWPostGetById) => {
  // 处理基本数据
  const postData = dataDQWPostDataHandle(data)
  // 处理 postImports postForwards
  const { postImports, postForwards } = data
  // 处理parentPost
  const parentPost = (() => {
    if (data.parentPost == null) {
      return null
    }
    // 处理基本数据
    const postData = dataDQWPostDataHandle(data.parentPost)
    // 处理 postImports postForwards
    const { postImports, postForwards } = data.parentPost
    return {
      ...postData,
      postImports,
      postForwards
    }
  })()
  // 处理replies 一级回复
  const replies = data.replies.map((rp1) => {
    // 处理基本数据
    const postData = dataDQWPostDataHandle(rp1)
    // 处理replies 二级回复
    const replies = rp1.replies.map((rp2) => {
      // 处理基本数据
      const postData = dataDQWPostDataHandle(rp2)
      return {
        ...postData
      }
    })
    return {
      ...postData,
      replies
    }
  })
  return {
    ...postData,
    postImports,
    postForwards,
    parentPost,
    replies
  }
}

// 帖子分页查询数据处理
export const dataDQWPostGetByCursorHandle = (dataList: DQWPostGetByCursor) => {
  return dataList.map((data) => {
    // 处理基本数据
    const postData = dataDQWPostDataHandle(data)
    // 处理parentPost
    const parentPost = (() => {
      if (data.parentPost == null) {
        return null
      }
      // 处理基本数据
      const postData = dataDQWPostDataHandle(data.parentPost)
      return {
        ...postData
      }
    })()
    return {
      ...postData,
      parentPost
    }
  })
}

// 图片的数据整理
const dataDQWImageDataHandle = (data: DQWImageData) => {
  // 整理posts
  const posts = data.postsToImages.map((pTIitem) => {
    const _count = {
      // 计数 images
      images: pTIitem.post.postsToImages.length,
      // 计数 replies
      replies: pTIitem.post.replies.length
    }
    return {
      ...pTIitem.post,
      _count,
      postsToImages: undefined,
      replies: undefined
    }
  })
  const _count = {
    // 计数 posts
    posts: posts.length
  }
  return {
    ...data,
    posts,
    _count,
    postsToImages: undefined
  }
}
export const dataDQWImageBaseHandle = (data: DQWImageData) => {
  return dataDQWImageDataHandle(data)
}

// src\utils\data\db-query-with.ts
// 在 src\services\image.ts 被调用
// 通过id查询图片
export const dataDQWImageGetByIdHandle = (data: DQWImageData) => {
  return dataDQWImageDataHandle(data)
}

// src\utils\data\db-query-with.ts
// 在 src\services\image.ts 被调用
// 通过游标分页查询图片
export const dataDQWImageGetByCursorHandle = (dataList: DQWImageData[]) => {
  return dataList.map(data => dataDQWImageDataHandle(data))
}
