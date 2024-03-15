// @typescript-eslint/no-unused-vars
import axios, { AxiosError } from 'axios'
import config, { defaultRequestInterceptors, defaultResponseInterceptors } from './config'

import { AxiosInstance, InternalAxiosRequestConfig, RequestConfig, AxiosResponse } from './types'
import { ElMessage } from 'element-plus'
import { useLogout } from '@/hooks/web/useLogout'
import { APIResponseCodes } from '@/api/common/types'
import { isHttps } from '@/utils/is'

const { interceptors } = config
// 判断部署地址
export const PATH_URL =
  isHttps(window.location.href) && import.meta.env.VITE_HTTPS_API_BASE_PATH
    ? import.meta.env.VITE_HTTPS_API_BASE_PATH
    : import.meta.env.VITE_API_BASE_PATH

const { requestInterceptors, responseInterceptors } = interceptors

const abortControllerMap: Map<string, AbortController> = new Map()

// 强制登出 code
const FORCE_LOOUT_CODES = [
  APIResponseCodes.OtherLogin,
  APIResponseCodes.LoginTimeout,
  APIResponseCodes.Need2ReLogin,
  APIResponseCodes.NotLogin
]

const axiosInstance: AxiosInstance = axios.create({
  ...config,
  baseURL: PATH_URL
})

axiosInstance.interceptors.request.use((res: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = res.url || ''
  res.signal = controller.signal
  abortControllerMap.set(url, controller)
  return res
})

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const url = res.config.url || ''
    abortControllerMap.delete(url)
    if (res.config.responseType === 'blob') {
      return res
    }
    if (res.data && !(res.data as IResponse).success) {
      // 处理服务端返回的报错
      const errorMsg = (res.data as IResponse).message || res.statusText
      const errCode = (res.data as IResponse).code
      const needReLogin = FORCE_LOOUT_CODES.includes(errCode)
      const needReloginDuration = 4000
      const defaultDuration = 3000
      const logoutAction = useLogout()
      ElMessage.error({
        message: errorMsg,
        duration: needReLogin ? needReloginDuration : defaultDuration,
        onClose() {
          // 需要重新登录的 code 自动跳转
          if (needReLogin) {
            logoutAction.logout()
          }
        }
      })

      return Promise.reject(res.data)
    }
    // 这里不能做任何处理，否则后面的 interceptors 拿不到完整的上下文了
    return res
  },
  (error: AxiosError) => {
    console.log('err:  ' + error) // for debug
    ElMessage.error(error.message)
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.request.use(requestInterceptors || defaultRequestInterceptors)
axiosInstance.interceptors.response.use(responseInterceptors || defaultResponseInterceptors)

const service = {
  request: (config: RequestConfig) => {
    return new Promise((resolve, reject) => {
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config as any)
      }

      axiosInstance
        .request(config)
        .then((res) => {
          resolve(res)
        })
        .catch((err: any) => {
          reject(err)
        })
    })
  },
  cancelRequest: (url: string | string[]) => {
    const urlList = Array.isArray(url) ? url : [url]
    for (const _url of urlList) {
      abortControllerMap.get(_url)?.abort()
      abortControllerMap.delete(_url)
    }
  },
  cancelAllRequest() {
    for (const [_, controller] of abortControllerMap) {
      controller.abort()
    }
    abortControllerMap.clear()
  }
}

export default service
