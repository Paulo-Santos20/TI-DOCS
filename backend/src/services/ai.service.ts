import { env } from '../config/environment'
import logger from '../config/logger'
import { AppError } from '../middleware/error.middleware'

interface OllamaGenerateResponse {
  response: string
}

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

export async function askPhi(prompt: string): Promise<string> {
  const response = await fetchWithTimeout(`${env.OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { num_predict: 256, temperature: 0.1 },
    }),
  })

  const data: OllamaGenerateResponse = await response.json()
  return data.response
}

export function buildRagPrompt(question: string, contexts: { title: string; chunkText: string; similarity: number }[]): string {
  const contextStr = contexts.map(c =>
    `[Fonte: ${c.title}]\n${c.chunkText}`
  ).join('\n\n')

  return `Você é um assistente especializado em documentação hospitalar.
Responda APENAS com base no contexto fornecido abaixo.
Se a informação não estiver no contexto, diga "Não encontrei essa informação nos documentos disponíveis."
Sempre cite a fonte (título do documento) ao responder.

Contexto:
${contextStr}

Pergunta: ${question}

Resposta:`
}
