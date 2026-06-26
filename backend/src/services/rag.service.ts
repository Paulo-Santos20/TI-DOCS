import { db } from '../config/database'
import { documentChunks, documents } from '../db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { env } from '../config/environment'
import logger from '../config/logger'
import { AppError } from '../middleware/error.middleware'

const CHUNK_SIZE = 512
const CHUNK_OVERLAP = 64
const MAX_CHUNKS = 5

const AI_ERROR = {
  QUOTA: 'Limite de uso da IA excedido. Tente novamente mais tarde ou contate o administrador.',
  AUTH: 'Chave de API da IA inválida ou não configurada. Contate o administrador.',
  UNAVAILABLE: 'IA não disponível no momento. Tente novamente mais tarde.',
  TIMEOUT: 'IA não respondeu a tempo. Tente novamente.',
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 60000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (!response.ok) {
      if (response.status === 429) throw new AppError(429, AI_ERROR.QUOTA)
      if (response.status === 401 || response.status === 403) throw new AppError(502, AI_ERROR.AUTH)
      throw new AppError(502, `IA retornou erro ${response.status}`)
    }
    return response
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new AppError(503, AI_ERROR.TIMEOUT)
    }
    if (err instanceof AppError) throw err
    logger.error(`IA connection failed: ${err.message}`)
    throw new AppError(503, AI_ERROR.UNAVAILABLE)
  } finally {
    clearTimeout(timer)
  }
}

export function chunkText(text: string): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []

  for (let i = 0; i < words.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
    const chunk = words.slice(i, i + CHUNK_SIZE).join(' ')
    if (chunk.trim()) chunks.push(chunk)
  }

  return chunks
}

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetchWithTimeout(`${env.OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: env.OLLAMA_MODEL, prompt: text }),
  })
  const data = await response.json()
  return data.embedding
}

export async function indexDocument(docId: number, text: string) {
  await db.delete(documentChunks).where(eq(documentChunks.documentId, docId))

  const chunks = chunkText(text)
  const results = await Promise.allSettled(chunks.map(c => getEmbedding(c)))

  const values: any[] = []
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    if (r.status === 'fulfilled') {
      values.push({
        documentId: docId, chunkIndex: i,
        chunkText: chunks[i], embedding: r.value,
      })
    }
  }

  if (values.length > 0) {
    await db.insert(documentChunks).values(values as any)
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export async function searchRelevantChunks(query: string, sectorId: number, limit = MAX_CHUNKS) {
  const queryEmbedding = await getEmbedding(query)

  const rows = await db
    .select({
      chunkText: documentChunks.chunkText,
      documentId: documentChunks.documentId,
      title: documents.title,
      embedding: documentChunks.embedding,
    })
    .from(documentChunks)
    .innerJoin(documents, eq(documentChunks.documentId, documents.id))
    .where(and(
      eq(documents.sectorId, sectorId),
      isNull(documents.deletedAt),
    ))

  const scored = rows
    .filter(r => Array.isArray(r.embedding) && r.embedding.length > 0)
    .map(r => ({
      chunk_text: r.chunkText,
      document_id: r.documentId,
      title: r.title,
      similarity: cosineSimilarity(queryEmbedding, r.embedding as number[]),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  return scored
}
