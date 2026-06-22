import 'dotenv/config'

function parseIntSafe(val: string | undefined, fallback: number): number {
  if (!val) return fallback
  const parsed = parseInt(val)
  return isNaN(parsed) ? fallback : parsed
}

const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT || '5432'
const dbName = process.env.DB_NAME || 'tidocs'
const dbUser = process.env.DB_USER || 'tidocs'
const dbPassword = process.env.DB_PASSWORD || 'tidocs123'

export const env = {
  DB_HOST: dbHost,
  DB_PORT: parseIntSafe(process.env.DB_PORT, 5432),
  DB_NAME: dbName,
  DB_USER: dbUser,
  DB_PASSWORD: dbPassword,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'phi3.5:mini',
  PORT: parseIntSafe(process.env.PORT, 3001),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseIntSafe(process.env.MAX_FILE_SIZE, 10485760),
  DB_POOL_MAX: parseIntSafe(process.env.DB_POOL_MAX, 20),
  RATE_LIMIT_WINDOW_MS: parseIntSafe(process.env.RATE_LIMIT_WINDOW_MS, 900000),
  RATE_LIMIT_MAX: parseIntSafe(process.env.RATE_LIMIT_MAX, 100),
  DATABASE_URL: process.env.DATABASE_URL || `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`,
}
