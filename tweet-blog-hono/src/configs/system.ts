import type { AdminStore, FileStore, ForwardStore, ProfileStore, TaskStore } from '@/types'
import { cloneDeep } from 'lodash'
import path from 'path'

// web版，保存在项目目录
export const systemDataPath = path.join(__dirname, '../../data/')

const storeDefaultAdmin: AdminStore = {
  username: 'admin',
  password: 'adminadmin', // 将被哈希
  jwtAdminSecretKey: 'Will randomly generate', // 将会随机生成
  jwtAdminExpSeconds: 10 * 24 * 60 * 60, // 10 days
  loginMaxFailCount: 10,
  loginLockSeconds: 10 * 60 * 60, // 10 hours
  proxyAddressHttp: ''
}
export const systemAdminConfig = {
  storeFile: path.join(systemDataPath, 'admin.json'),
  storeDefault: () => cloneDeep(storeDefaultAdmin),
  passwordSaltRounds: 10
}

export const systemPublicPath = path.join(systemDataPath, 'public/')

const imageSavePath = path.join(systemPublicPath, 'image/')
const avatarSavePath = path.join(systemPublicPath, 'avatar/')
const iconSavePath = path.join(systemPublicPath, 'icon/')

const storeDefaultFile: FileStore = {
  imageLargeMaxLength: 3000,
  imageSmallMaxLength: 600,
  imageQuality: 90
}
export const systemFileConfig = {
  storeFile: path.join(systemDataPath, 'file.json'),
  storeDefault: () => cloneDeep(storeDefaultFile),
  imageSavePath,
  originalImageSavePath: path.join(imageSavePath, 'original/'),
  largeImageSavePath: path.join(imageSavePath, 'large/'),
  smallImageSavePath: path.join(imageSavePath, 'small/'),
  imageExtension: '.jpeg',
  avatarSavePath,
  iconSavePath
}

const storeDefaultProfile: ProfileStore = {
  avatar: null,
  avatarArray: [],
  name: '',
  bio: '',
  socialMedias: [],
  aboutMarkdown: '# 关于 Tweblog\n\n**Tweblog 是一个社交媒体博客化工具**，目的是为了方便同时运营多个社交媒体，也可以用它来充当自己的博客。\n\n**官网/文档：** [tweblog.com](https://tweblog.com)\n',
  externalLinks: [],
  externalIcons: []
}
export const systemProfileConfig = {
  storeFile: path.join(systemDataPath, 'profile.json'),
  storeDefault: () => cloneDeep(storeDefaultProfile)
}

const storeDefaultForward: ForwardStore = {
  forwardSettingList: []
}
export const systemForwardConfig = {
  storeFile: path.join(systemDataPath, 'forward.json'),
  storeDefault: () => cloneDeep(storeDefaultForward)
}

const storeDefaultTask: TaskStore = {
  taskImportList: [],
  taskForwardList: []
}
export const systemTaskConfig = {
  storeFile: path.join(systemDataPath, 'task.json'),
  storeDefault: () => cloneDeep(storeDefaultTask)
}
