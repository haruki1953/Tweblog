export interface PostContentTextPart {
  type: 'text'
  content: string
}

export interface PostContentLinkPart {
  type: 'link'
  content: string
  href: string
}

export type PostContentPart = PostContentTextPart | PostContentLinkPart
