import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 15000 })

let csrfToken: string | null = null
let csrfPromise: Promise<void> | null = null

async function ensureCsrfToken() {
  if (csrfToken) return
  if (csrfPromise) return csrfPromise
  csrfPromise = axios.get('/api/csrf-token')
    .then(res => { csrfToken = res.data.csrfToken })
    .catch(() => { csrfToken = null; csrfPromise = null })
  return csrfPromise
}

ensureCsrfToken()

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  if (config.method && !['get', 'head', 'options'].includes(config.method)) {
    await ensureCsrfToken()
    if (csrfToken) config.headers['x-csrf-token'] = csrfToken
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('mockUser')
      window.location.href = '/login'
    }
    if (err.response?.status === 403 && err.response?.data?.error?.includes('CSRF')) {
      csrfToken = null
      csrfPromise = null
      await ensureCsrfToken()
      if (csrfToken && err.config) {
        err.config.headers['x-csrf-token'] = csrfToken
        return api(err.config)
      }
    }
    return Promise.reject(err)
  }
)

export default api
