import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { asyncHandler } from '../lib/async-handler'
import { searchRelevantChunks } from '../services/rag.service'
import { askPhi, buildRagPrompt } from '../services/ai.service'

const router = Router()
router.use(authMiddleware)

const askSchema = z.object({
  question: z.string().min(1, 'Pergunta é obrigatória').max(1000),
})

router.post('/ask', validate(askSchema), asyncHandler(async (req: AuthRequest, res) => {
  const { question } = req.body
  const sectorId = req.user!.sectorId

  const results = await searchRelevantChunks(question, sectorId)
  const contexts = results.map((r: any) => ({
    title: r.title, chunkText: r.chunk_text, similarity: r.similarity,
  }))

  if (contexts.length === 0) {
    return res.json({ answer: 'Não encontrei documentos relacionados a essa pergunta no seu setor.' })
  }

  const prompt = buildRagPrompt(question, contexts)
  const answer = await askPhi(prompt)

  res.json({ answer, sources: contexts.map(c => ({ title: c.title })) })
}))

export default router
