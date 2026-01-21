import { type ProfileStore } from '@/types'
import { save, store } from '../init'

export const setSocialMedias = (
  socialMedias: ProfileStore['socialMedias']
) => {
  save({
    ...store,
    socialMedias
  })
}
