import { type ProfileStore } from '@/types'
import { store, save } from '../init'

export const setNameBio = (
  name: ProfileStore['name'],
  bio: ProfileStore['bio']
) => {
  save({
    ...store,
    name,
    bio
  })
}

export const setAboutMarkdown = (
  aboutMarkdown: ProfileStore['aboutMarkdown']
) => {
  save({
    ...store,
    aboutMarkdown
  })
}
