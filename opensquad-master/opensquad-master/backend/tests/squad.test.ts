import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../src/lib/prisma'
import {
  getSquadsHandler,
  getSquadBySlugHandler,
  getMySquadsHandler,
  purchaseSquadHandler,
} from '../src/modules/squad/squad.controller'
import { registerHandler, loginHandler } from '../src/modules/auth/auth.controller'

describe('Squad Module', () => {
  let fastify: FastifyInstance
  let authToken: string
  let userId: string

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

    // Register squad routes
    fastify.get('/squads', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            locale: { type: 'string', enum: ['pt-BR', 'en-US'] },
          },
        },
      },
    }, getSquadsHandler)

    fastify.get('/squads/:slug', {
      schema: {
        params: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            locale: { type: 'string', enum: ['pt-BR', 'en-US'] },
          },
        },
      },
    }, getSquadBySlugHandler)

    fastify.get('/squads/mine', {
      onRequest: [fastify.authenticate],
    }, getMySquadsHandler)

    fastify.post('/squads/:id/purchase', {
      onRequest: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            stripePaymentId: { type: 'string' },
          },
        },
      },
    }, purchaseSquadHandler)

    await fastify.ready()
  })

  afterAll(async () => {
    await fastify.close()
  })

  beforeEach(async () => {
    // Clean up test users
    try {
      await prisma.user.deleteMany({
        where: { email: { in: ['squadtest@example.com', 'squadtest2@example.com'] } },
      })
    } catch {
      // Ignore cleanup errors
    }

    // Clean up test user squads
    try {
      await prisma.userSquad.deleteMany({
        where: {
          user: { email: { in: ['squadtest@example.com', 'squadtest2@example.com'] } },
        },
      })
    } catch {
      // Ignore cleanup errors
    }

    // Register a test user and get token
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'squadtest@example.com',
        password: 'password123',
        name: 'Squad Test',
      },
    })

    const body = JSON.parse(response.body)
    authToken = body.token
    userId = body.user.id
  })

  describe('GET /squads', () => {
    it('should return published squads with default locale', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/squads',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('squads')
      expect(Array.isArray(body.squads)).toBe(true)
    })

    it('should return published squads with pt-BR locale', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/squads?locale=pt-BR',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('squads')
      expect(Array.isArray(body.squads)).toBe(true)
    })

    it('should return published squads with en-US locale', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/squads?locale=en-US',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('squads')
      expect(Array.isArray(body.squads)).toBe(true)
    })
  })

  describe('GET /squads/:slug', () => {
    it('should return 404 for non-existent squad', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/squads/non-existent-squad',
      })

      expect(response.statusCode).toBe(404)
    })

    it('should return squad by slug with default locale', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/squads/instagram-carousel',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('squad')
      expect(body.squad.slug).toBe('instagram-carousel')
    })

    it('should return squad by slug with pt-BR locale', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/squads/instagram-carousel?locale=pt-BR',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('squad')
      expect(body.squad.slug).toBe('instagram-carousel')
      expect(body.squad.localization.locale).toBe('pt-BR')
    })

    it('should return squad by slug with en-US locale', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/squads/instagram-carousel?locale=en-US',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('squad')
      expect(body.squad.slug).toBe('instagram-carousel')
      expect(body.squad.localization.locale).toBe('en-US')
    })
  })

  describe('GET /squads/mine', () => {
    it('should return 401 without token', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/squads/mine',
      })

      expect(response.statusCode).toBe(401)
    })

    it('should return user squads with valid token', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/squads/mine',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('squads')
      expect(Array.isArray(body.squads)).toBe(true)
    })
  })

  describe('POST /squads/:id/purchase', () => {
    it('should return 401 without token', async () => {
      // First get a published squad id
      const squadsResponse = await fastify.inject({
        method: 'GET',
        url: '/squads',
      })
      const squads = JSON.parse(squadsResponse.body).squads
      const squadId = squads[0]?.id

      const response = await fastify.inject({
        method: 'POST',
        url: `/squads/${squadId}/purchase`,
        payload: {
          stripePaymentId: 'pi_test123',
        },
      })

      expect(response.statusCode).toBe(401)
    })

    it('should return 404 for non-existent squad', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/squads/non-existent-id/purchase',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          stripePaymentId: 'pi_test123',
        },
      })

      expect(response.statusCode).toBe(404)
    })

    it('should purchase a squad with valid token', async () => {
      // First get a published squad id
      const squadsResponse = await fastify.inject({
        method: 'GET',
        url: '/squads',
      })
      const squads = JSON.parse(squadsResponse.body).squads
      const squadId = squads[0]?.id

      const response = await fastify.inject({
        method: 'POST',
        url: `/squads/${squadId}/purchase`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          stripePaymentId: 'pi_test123',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.message).toBe('Squad purchased successfully')
    })

    it('should return 409 when user already owns squad', async () => {
      // First get a published squad id
      const squadsResponse = await fastify.inject({
        method: 'GET',
        url: '/squads',
      })
      const squads = JSON.parse(squadsResponse.body).squads
      const squadId = squads[0]?.id

      // Purchase the squad first time
      await fastify.inject({
        method: 'POST',
        url: `/squads/${squadId}/purchase`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          stripePaymentId: 'pi_test123',
        },
      })

      // Try to purchase again
      const response = await fastify.inject({
        method: 'POST',
        url: `/squads/${squadId}/purchase`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          stripePaymentId: 'pi_test456',
        },
      })

      expect(response.statusCode).toBe(409)
      const body = JSON.parse(response.body)
      expect(body.error).toBe('User already owns this squad')
    })

    it('should allow purchasing squad again after deactivation (not implemented - requires admin)', async () => {
      // This test documents expected behavior - reactivation not exposed via API
      // The purchaseSquad service handles reactivation internally but there's no
      // admin endpoint to deactivate a squad first
    })
  })
})
