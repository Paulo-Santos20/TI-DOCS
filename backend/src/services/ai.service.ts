import { env } from '../config/environment'

interface OllamaGenerateResponse {
  response: string
}

export async function askPhi(prompt: string): Promise<string> {
  const response = await fetch(`${env.OLLAMA_URL}/api/generate`, {
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
