import { db } from '../config/database'
import { documentChunks } from '../db/schema'
import { eq, sql } from 'drizzle-orm'
import { env } from '../config/environment'
import { AppError } from '../middleware/error.middleware'

const CHUNK_SIZE = 512
const CHUNK_OVERLAP = 64
const MAX_CHUNKS = 5

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (!response.ok) {
      throw new AppError(502, `Ollama retornou erro ${response.status}`)
    }
    return response
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new AppError(503, 'IA não respondeu a tempo. Verifique se o Ollama está rodando.')
    }
    if (err instanceof AppError) throw err
    throw new AppError(503, `Não foi possível conectar ao Ollama: ${err.message}`)
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
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbedding(chunks[i])
    await db.insert(documentChunks).values({
      documentId: docId, chunkIndex: i,
      chunkText: chunks[i], embedding: embedding as any,
    })
  }
}

export async function searchRelevantChunks(query: string, sectorId: number, limit = MAX_CHUNKS) {
  const queryEmbedding = await getEmbedding(query)
  const embeddingStr = `[${queryEmbedding.join(',')}]`

  const results = await db.execute(sql`
    SELECT dc.chunk_text, dc.document_id, d.title,
           1 - (dc.embedding <=> ${embeddingStr}::vector) AS similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE d.sector_id = ${sectorId}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `)

  return results
}
