import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 15000 })

const httpApi = axios.create({ baseURL: '/api', timeout: 15000 })
httpApi.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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

const inflightCache = new Map<string, Promise<any>>()
const responseCache = new Map<string, { data: any; expiry: number }>()
const FRESH_TTL = 60000
const STALE_TTL = 300000

const cacheResponse = (cacheKey: string, data: any) => {
  console.debug(`[api] cache set ${cacheKey}`, typeof data, JSON.stringify(data).slice(0, 80))
  responseCache.set(cacheKey, { data, expiry: Date.now() + STALE_TTL })
  inflightCache.delete(cacheKey)
}

const refreshInBackground = (config: any, cacheKey: string) => {
  httpApi(config).then(res => {
    console.debug(`[api] background refresh success ${cacheKey}`, typeof res.data)
    if (res.data) cacheResponse(cacheKey, res.data)
  }).catch(() => {
    console.debug(`[api] background refresh failed ${cacheKey}, evicting stale cache`)
    responseCache.delete(cacheKey)
  })
}

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  if (config.method && !['get', 'head', 'options'].includes(config.method)) {
    await ensureCsrfToken()
    if (csrfToken) config.headers['x-csrf-token'] = csrfToken
  }

  if (config.method === 'get') {
    const cacheKey = config.url + JSON.stringify(config.params || {})
    const cached = responseCache.get(cacheKey)

    if (cached) {
      if (Date.now() < cached.expiry) {
        console.debug(`[api] FRESH cache ${cacheKey}`)
        config.adapter = () => Promise.resolve({
          data: cached.data, status: 200, statusText: 'OK',
          headers: config.headers, config,
        })
        return config
      }
      if (cached.data) {
        console.debug(`[api] STALE cache ${cacheKey}`)
        refreshInBackground(config, cacheKey)
        config.adapter = () => Promise.resolve({
          data: cached.data, status: 200, statusText: 'OK',
          headers: config.headers, config,
        })
        return config
      }
    }

    const existing = inflightCache.get(cacheKey)
    if (existing) {
      console.debug(`[api] inflight dedup ${cacheKey}`)
      config.adapter = () => existing.then(data => ({
        data, status: 200, statusText: 'OK',
        headers: config.headers, config,
      }))
      return config
    }

    const promise = httpApi(config).then(res => {
      console.debug(`[api] REAL HTTP ${cacheKey}`, typeof res.data, 'status:', res.status)
      if (res.data) cacheResponse(cacheKey, res.data)
      return res.data
    }).catch(err => {
      inflightCache.delete(cacheKey)
      throw err
    })
    inflightCache.set(cacheKey, promise)
    config.adapter = () => promise.then(data => ({
      data, status: 200, statusText: 'OK',
      headers: config.headers, config,
    }))
    return config
  }

  return config
})

function clearCacheByPrefix(prefix: string) {
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) responseCache.delete(key)
  }
}

function clearRelatedCache(url: string) {
  const base = url.split('?')[0].split('/').slice(0, 3).join('/')
  clearCacheByPrefix(base)
  if (base === '/documents' || base === '/categories' || base === '/templates') {
    clearCacheByPrefix('/dashboard')
  }
  if (base === '/users') {
    clearCacheByPrefix('/dashboard')
    clearCacheByPrefix('/audit')
  }
}

api.interceptors.response.use(
  (res) => {
    if (res.config.method && !['get', 'head', 'options'].includes(res.config.method)) {
      clearRelatedCache(res.config.url || '')
    }
    return res
  },
  async (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token')
      localStorage.removeItem('tidocs_user')
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
