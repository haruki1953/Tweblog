import axios from 'axios'
import { axiosConfig } from '@/config'
import { sakiMessage } from './message'
import { desktopGenerateTokenAdmin } from '@/desktop'

const instance = axios.create({
  // TODO 1. 基础地址，超时时间
  baseURL: axiosConfig.baseUrl,
  timeout: axiosConfig.timeout
})

// 请求拦截器
instance.interceptors.request.use(
  async (config) => {
    // electron专用，获取token
    const token = await desktopGenerateTokenAdmin()
    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (err) => Promise.reject(err)
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    // TODO 4. 摘取核心响应数据
    // 204 响应表示请求成功但无内容
    if (res.status === 204 || res.data.code === 0) {
      return res
    }
    // TODO 3. 处理业务失败
    // 处理业务失败, 给错误提示，抛出错误
    sakiMessage({
      type: 'error',
      message: res.data.message || '服务异常'
    })
    return Promise.reject(res.data)
  },
  (err) => {
    // TODO 5. 处理401错误
    // electron不需要

    // 错误的默认情况 => 只要给提示
    sakiMessage({
      type: 'error',
      message: err.response?.data.message || '服务异常'
    })
    return Promise.reject(err)
  }
)

export default instance
