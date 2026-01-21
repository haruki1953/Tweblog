import { fetchProxyConfig } from '@/configs'
import { fetchProxy } from './dependencies'

export const baseBlobApi = async (url: string) => {
  const response = await fetchProxy(url)
  const blob = await response.blob()
  return blob
}

export const baseTestApi = async (url: string) => {
  const address = (() => {
    if (url === '') {
      return fetchProxyConfig.testUrlDefault
    }
    return url
  })()
  const dateBeforeFetch = new Date()
  await fetchProxy(address)
  const dateAfterFetch = new Date()
  return {
    address,
    latency: dateAfterFetch.getTime() - dateBeforeFetch.getTime()
  }
}
