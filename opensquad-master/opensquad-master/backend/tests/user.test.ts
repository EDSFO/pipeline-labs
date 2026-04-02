import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../src/lib/prisma'
import { getProfileHandler, updateProfileHandler, changePasswordHandler } from '../src/modules/user/user.controller'
import { registerHandler, loginHandler } from '../src/modules/auth/auth.controller'

describe('User Module', () => {
  let fastify: FastifyInstance
  let authToken: string

  beforeAll(async () => {
    fastify = Fastify()

    await fastify.register(cors, { origin: true })

    // Register JWT plugin with authenticate decorator
    await fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || 'test-secret',
    })

    // Decorate authenticate
    fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify()
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' })
      }
    })

    // Register auth routes
    fastify.post('/auth/register', {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string' },
          },
        },
      },
    }, registerHandler)

    fastify.post('/auth/login', {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
      },
    }, loginHandler)

    // Register user routes directly
    fastify.get('/user/me', {
      onRequest: [fastify.authenticate],
    }, getProfileHandler)

    fastify.patch('/user/me', {
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            locale: { type: 'string', enum: ['pt-BR', 'en-US'] },
          },
        },
      },
    }, updateProfileHandler)

    fastify.post('/user/me/password', {
      onRequest: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['oldPassword', 'newPassword'],
          properties: {
            oldPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
          },
        },
      },
    }, changePasswordHandler)

    await fastify.ready()
  })

  afterAll(async () => {
    await fastify.close()
  })

  beforeEach(async () => {
    // Clean up test users
    try {
      await prisma.user.deleteMany({
        where: { email: { in: ['usertest@example.com', 'usertest2@example.com'] } },
      })
    } catch {
      // Ignore cleanup errors
    }

    // Register a test user and get token
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'usertest@example.com',
        password: 'password123',
        name: 'User Test',
      },
    })

    const body = JSON.parse(response.body)
    authToken = body.token
  })

  describe('GET /user/me', () => {
    it('should return 401 without token', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/user/me',
      })

      expect(response.statusCode).toBe(401)
    })

    it('should return user profile with valid token', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/user/me',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.user.email).toBe('usertest@example.com')
      expect(body.user.name).toBe('User Test')
      expect(body.user.locale).toBe('pt-BR')
      expect(body.user).not.toHaveProperty('passwordHash')
    })
  })

  describe('PATCH /user/me', () => {
    it('should return 401 without token', async () => {
      const response = await fastify.inject({
        method: 'PATCH',
        url: '/user/me',
        payload: {
          name: 'Updated Name',
        },
      })

      expect(response.statusCode).toBe(401)
    })

    it('should update user name', async () => {
      const response = await fastify.inject({
        method: 'PATCH',
        url: '/user/me',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Updated Name',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.user.name).toBe('Updated Name')
      expect(body.user.email).toBe('usertest@example.com')
    })

    it('should update user locale', async () => {
      const response = await fastify.inject({
        method: 'PATCH',
        url: '/user/me',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          locale: 'en-US',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.user.locale).toBe('en-US')
    })

    it('should reject invalid locale', async () => {
      const response = await fastify.inject({
        method: 'PATCH',
        url: '/user/me',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          locale: 'fr-FR',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /user/me/password', () => {
    it('should return 401 without token', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/user/me/password',
        payload: {
          oldPassword: 'password123',
          newPassword: 'newpassword123',
        },
      })

      expect(response.statusCode).toBe(401)
    })

    it('should change password with valid old password', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/user/me/password',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          oldPassword: 'password123',
          newPassword: 'newpassword123',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.message).toBe('Password changed successfully')
    })

    it('should reject with invalid old password', async () => {
      // First register a new user to get a fresh token
      const registerResponse = await fastify.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'usertest2@example.com',
          password: 'password123',
          name: 'User Test 2',
        },
      })

      const { token } = JSON.parse(registerResponse.body)

      const response = await fastify.inject({
        method: 'POST',
        url: '/user/me/password',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          oldPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        },
      })

      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('Invalid old password')
    })

    it('should reject short new password', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/user/me/password',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          oldPassword: 'password123',
          newPassword: 'short',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should allow login with new password after change', async () => {
      // Change password
      await fastify.inject({
        method: 'POST',
        url: '/user/me/password',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          oldPassword: 'password123',
          newPassword: 'newpassword123',
        },
      })

      // Try to login with new password
      const loginResponse = await fastify.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'usertest@example.com',
          password: 'newpassword123',
        },
      })

      expect(loginResponse.statusCode).toBe(200)
      const body = JSON.parse(loginResponse.body)
      expect(body).toHaveProperty('token')
      expect(body.user.email).toBe('usertest@example.com')
    })
  })
})
