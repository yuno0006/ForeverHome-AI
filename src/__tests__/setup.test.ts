import { describe, it, expect } from 'vitest'

describe('Vitest Configuration', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true)
  })

  it('should support TypeScript', () => {
    const greeting: string = 'Hello, ForeverHome AI!'
    expect(greeting).toContain('ForeverHome')
  })
})
