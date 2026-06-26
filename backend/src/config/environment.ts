import 'dotenv/config'

function requireEnv(key: string, hint: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Variável de ambiente ${key} é obrigatória. ${hint}`)
  return val
}

function parseIntSafe(val: string | undefined, fallback: number): number {
  if (!val) return fallback
  const parsed = parseInt(val)
  return isNaN(parsed) ? fallback : parsed
}

export const env = {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseIntSafe(process.env.DB_PORT, 5432),
  DB_NAME: process.env.DB_NAME || 'tidocs',
  DB_USER: process.env.DB_USER || 'tidocs',
  DB_PASSWORD: requireEnv('DB_PASSWORD', 'Defina DB_PASSWORD no .env'),
  JWT_SECRET: requireEnv('JWT_SECRET', 'Defina JWT_SECRET no .env (ex: openssl rand -hex 64)'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'phi3:mini',
  PORT: parseIntSafe(process.env.PORT, 3001),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  UPLOAD_RATE_LIMIT: parseIntSafe(process.env.UPLOAD_RATE_LIMIT, 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseIntSafe(process.env.MAX_FILE_SIZE, 10485760),
  DB_POOL_MAX: parseIntSafe(process.env.DB_POOL_MAX, 20),
  RATE_LIMIT_WINDOW_MS: parseIntSafe(process.env.RATE_LIMIT_WINDOW_MS, 900000),
  RATE_LIMIT_MAX: parseIntSafe(process.env.RATE_LIMIT_MAX, 100),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DATABASE_URL: requireEnv('DATABASE_URL', 'Defina DATABASE_URL no .env (ex: postgres://user:pass@host:5432/db)'),
}
