import { describe, it, expect } from 'vitest'

// chunkText is a pure function, test it directly
import { chunkText } from '../services/rag.service'

describe('rag.service', () => {
  describe('chunkText', () => {
    it('should return empty array for empty text', () => {
      expect(chunkText('')).toEqual([])
    })

    it('should return single chunk for short text', () => {
      const result = chunkText('hello world')
      expect(result).toHaveLength(1)
      expect(result[0]).toBe('hello world')
    })

    it('should split text into multiple chunks', () => {
      const words = Array.from({ length: 600 }, (_, i) => `word${i}`)
      const text = words.join(' ')
      const result = chunkText(text)
      expect(result.length).toBeGreaterThan(1)
      expect(result[0].split(' ').length).toBeLessThanOrEqual(512)
    })
  })
})
