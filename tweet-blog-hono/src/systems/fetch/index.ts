import { baseBlobApi, baseTestApi } from './api'
import { fetchProxy, getAgent } from './proxy'

export const useFetchSystem = () => {
  return {
    baseBlobApi,
    baseTestApi,
    getAgent,
    fetchProxy
  }
}
