import type { ProfileGetAllRes } from '@/types'
import { http } from '@/utils'

export const profileGetAllApi = (): ProfileGetAllRes => {
  return http.get('/profile/all')
}
