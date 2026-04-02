import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { authPlugin } from '../src/modules/auth/index'
import { prisma } from '../src/lib/prisma'

describe('Auth Module', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = Fastify()

    await fastify.register(cors, { origin: true })
    await fastify.register(authPlugin)

    // Health check endpoint (same as in app.ts)
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })

    await fastify.ready()
  })

  afterAll(async () => {
    await fastify.close()
  })

  beforeEach(async () => {
    // Clean up test users
    try {
      await prisma.user.deleteMany({
        where: { email: { in: ['test@example.com', 'test2@example.com'] } },
      })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('token')
      expect(body).toHaveProperty('user')
      expect(body.user.email).toBe('test@example.com')
      expect(body.user.name).toBe('Test User')
    })

    it('should reject duplicate email', async () => {
      // First registration
      await fastify.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test2@example.com',
          password: 'password123',
        },
      })

      // Duplicate registration
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test2@example.com',
          password: 'password456',
        },
      })

      expect(response.statusCode).toBe(409)
    })

    it('should reject invalid email', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'invalid-email',
          password: 'password123',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject short password', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'short',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await fastify.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      })
    })

    it('should login with valid credentials', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('token')
      expect(body.user.email).toBe('test@example.com')
    })

    it('should reject invalid password', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      })

      expect(response.statusCode).toBe(401)
    })

    it('should reject non-existent user', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'password123',
        },
      })

      expect(response.statusCode).toBe(401)
    })
  })

  describe('POST /auth/logout', () => {
    it('should return success message', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/logout',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.message).toBe('Logged out successfully')
    })
  })

  describe('GET /auth/me', () => {
    it('should return 401 without token', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/auth/me',
      })

      expect(response.statusCode).toBe(401)
    })

    it('should return user data with valid token', async () => {
      // Register and get token
      const registerResponse = await fastify.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      })

      const { token } = JSON.parse(registerResponse.body)

      // Access /auth/me with token
      const response = await fastify.inject({
        method: 'GET',
        url: '/auth/me',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.user.email).toBe('test@example.com')
      expect(body.user.name).toBe('Test User')
    })
  })

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/health',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('ok')
      expect(body).toHaveProperty('timestamp')
    })
  })
})
