export type BackendProfileStore = {
  avatar: string | null
  avatarArray: {
    path: string
    uuid: string
    size: number
    // addAt: Date
    addAt: string
  }[]
  name: string
  bio: string
  socialMedias: {
    uuid: string
    name: string
    description: string
    link: string
    fontawesomeClass: string
  }[]
  aboutMarkdown: string
  externalLinks: {
    type: 'contact' | 'friend'
    uuid: string
    name: string
    description: string
    link: string
    icon: string
    isCircle: boolean
  }[]
  externalIcons: {
    path: string
    uuid: string
    size: number
    // addAt: Date
    addAt: string
  }[]
}
