import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const TOKEN_KEY = 'myblock_token'
const REFRESH_TOKEN_KEY = 'myblock_refresh_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export const setTokens = (token: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

const client = axios.create({
  baseURL: '/api/v1',
})

// Attach JWT to every request
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, attempt token refresh once
let isRefreshing = false
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              if (original.headers) original.headers.Authorization = `Bearer ${token}`
              resolve(client(original))
            },
            reject,
          })
        })
      }

      isRefreshing = true

      try {
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken })
        const newToken: string = data.token
        setTokens(newToken, data.refreshToken ?? refreshToken)

        refreshQueue.forEach((cb) => cb.resolve(newToken))
        refreshQueue = []

        if (original.headers) original.headers.Authorization = `Bearer ${newToken}`
        return client(original)
      } catch (refreshError) {
        clearTokens()
        refreshQueue.forEach((cb) => cb.reject(refreshError))
        refreshQueue = []
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default client
