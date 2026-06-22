import { env } from '../config/environment'
import { AppError } from '../middleware/error.middleware'

interface OllamaGenerateResponse {
  response: string
}

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

export async function askPhi(prompt: string): Promise<string> {
  const response = await fetchWithTimeout(`${env.OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { num_predict: 512, temperature: 0.1 },
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
