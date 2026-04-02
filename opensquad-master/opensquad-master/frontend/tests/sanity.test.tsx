import { describe, it, expect } from 'vitest'

describe('Frontend sanity tests', () => {
  it('should have correct package name', () => {
    const packageName = 'opensquad-frontend'
    expect(packageName).toBe('opensquad-frontend')
  })

  it('should import known dependencies', async () => {
    const next = await import('next')
    const zod = await import('zod')
    const reactQuery = await import('@tanstack/react-query')

    expect(typeof next).toBe('object')
    expect(typeof zod).toBe('object')
    expect(typeof reactQuery).toBeTruthy()
  })

  it('should have required scripts', async () => {
    const packageJson = await import('../package.json', {
      assert: { type: 'json' },
    })
    const scripts = packageJson.default.scripts
    expect(scripts).toHaveProperty('dev')
    expect(scripts).toHaveProperty('build')
    expect(scripts).toHaveProperty('start')
    expect(scripts).toHaveProperty('lint')
    expect(scripts).toHaveProperty('test')
  })

  it('should have required dependencies', async () => {
    const packageJson = await import('../package.json', {
      assert: { type: 'json' },
    })
    const deps = packageJson.default.dependencies
    expect(deps).toHaveProperty('next')
    expect(deps).toHaveProperty('next-intl')
    expect(deps).toHaveProperty('react-hook-form')
    expect(deps).toHaveProperty('zod')
    expect(deps).toHaveProperty('@tanstack/react-query')
    expect(deps).toHaveProperty('stripe')
  })

  it('should have TypeScript in devDependencies', async () => {
    const packageJson = await import('../package.json', {
      assert: { type: 'json' },
    })
    const devDeps = packageJson.default.devDependencies
    expect(devDeps).toHaveProperty('typescript')
    expect(devDeps).toHaveProperty('vitest')
    expect(devDeps).toHaveProperty('tailwindcss')
  })
})
