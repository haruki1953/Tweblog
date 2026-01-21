import { store } from './init'
import {
  addAvatar,
  addExternalIcon,
  delAvatar,
  delExternalIcon,
  delNotUsedAvatars,
  delNotUsedExternalIcon,
  setAboutMarkdown,
  setAvatar,
  setExternalLinks,
  setNameBio,
  setSocialMedias
} from './services'

export const useProfileSystem = () => {
  return {
    store,
    setNameBio,
    setAboutMarkdown,
    setSocialMedias,
    addAvatar,
    delAvatar,
    delNotUsedAvatars,
    setAvatar,
    addExternalIcon,
    delExternalIcon,
    delNotUsedExternalIcon,
    setExternalLinks
  }
}
