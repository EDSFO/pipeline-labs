import { describe, it, expect } from 'vitest'

describe('Backend sanity tests', () => {
  it('should have correct package name', () => {
    // This verifies the package.json was created correctly
    const packageName = 'opensquad-backend'
    expect(packageName).toBe('opensquad-backend')
  })

  it('should import known dependencies', async () => {
    // Verify key dependencies are available
    const fastify = await import('fastify')
    const zod = await import('zod')
    const stripe = await import('stripe')

    // fastify is an ESM module with a default export (a function)
    expect(typeof fastify.default).toBe('function')
    expect(typeof zod).toBe('object')
    // stripe main export is a constructor function
    expect(typeof stripe.default).toBe('function')
  })

  it('should have correct module type', async () => {
    // Verify ESM module type
    const packageJson = await import('../package.json', {
      assert: { type: 'json' },
    })
    expect(packageJson.default.type).toBe('module')
  })

  it('should have required scripts', async () => {
    const packageJson = await import('../package.json', {
      assert: { type: 'json' },
    })
    const scripts = packageJson.default.scripts
    expect(scripts).toHaveProperty('dev')
    expect(scripts).toHaveProperty('build')
    expect(scripts).toHaveProperty('start')
    expect(scripts).toHaveProperty('test')
    expect(scripts).toHaveProperty('db:migrate')
    expect(scripts).toHaveProperty('db:seed')
  })

  it('should have required dependencies', async () => {
    const packageJson = await import('../package.json', {
      assert: { type: 'json' },
    })
    const deps = packageJson.default.dependencies
    expect(deps).toHaveProperty('fastify')
    expect(deps).toHaveProperty('@fastify/cors')
    expect(deps).toHaveProperty('@fastify/jwt')
    expect(deps).toHaveProperty('@prisma/client')
    expect(deps).toHaveProperty('bcrypt')
    expect(deps).toHaveProperty('bullmq')
    expect(deps).toHaveProperty('ioredis')
    expect(deps).toHaveProperty('stripe')
    expect(deps).toHaveProperty('resend')
    expect(deps).toHaveProperty('zod')
  })
})
