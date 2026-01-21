import type {
  ResData,
  Post,
  PostData,
  Image,
  PostForwardData,
  PostImportData
} from './base'

export type PostGetByCursorQueryType = {
  content?: string | undefined
  isDelete?: 'true' | 'false' | 'all' | undefined
}
export type PostGetByCursorData = PostData[]
export type PostGetByCursorRes = ResData<PostGetByCursorData>

export type PostSendJsonType = {
  content?: string | undefined
  images?: string[] | undefined
  createdAt?: Date | undefined
  parentPostId?: string | null | undefined
  // twitterId?: string | null | undefined
  // twitterLink?: string | null | undefined
  isDeleted?: boolean | undefined
}
export type PostSendRes = ResData<Post>

export type PostUpdateJsonType = PostSendJsonType & {
  id: string
}
export type PostUpdateRes = ResData<Post>

export type PostGetByIdQueryType = {
  keepIsDetele?: 'true' | 'false' | undefined
}
export type PostGetByIdData = Post & {
  postForwards: PostForwardData[]
  postImports: PostImportData[]
  parentPost: Post | null
  replies: Array<
    Post & {
      replies: Post[]
    }
  >
}
export type PostGetByIdRes = ResData<PostGetByIdData>

export type PostDeleteQueryType = {
  delateImage?: 'true' | 'false' | undefined
}
export type PostDeleteData = {
  deletedPost: Post
  deletedImages: (Image | null)[]
}
export type PostDeleteRes = ResData<PostDeleteData>

export type PostDeleteAllQueryType = PostDeleteQueryType
export type PostDeleteAllData = PostDeleteData[]
export type PostDeleteAllRes = ResData<PostDeleteAllData>
