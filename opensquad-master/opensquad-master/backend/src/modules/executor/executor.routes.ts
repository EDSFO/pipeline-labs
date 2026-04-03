import { FastifyInstance } from 'fastify'
import {
  startExecutionHandler,
  getStatusHandler,
  approveCheckpointHandler,
  rejectCheckpointHandler,
} from './executor.controller'

export async function executorRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /executor/start - Start squad execution (JWT protected)
  fastify.post('/executor/start', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['squadId'],
        properties: {
          squadId: { type: 'string', minLength: 1 },
          inputs: { type: 'object', additionalProperties: { type: 'string' } },
        },
      },
    },
  }, startExecutionHandler)

  // GET /executor/status/:jobId - Get execution status (JWT protected)
  fastify.get('/executor/status/:jobId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string', minLength: 1 },
        },
      },
    },
  }, getStatusHandler)

  // POST /executor/checkpoint/:jobId/approve - Approve checkpoint (JWT protected)
  fastify.post('/executor/checkpoint/:jobId/approve', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string', minLength: 1 },
        },
      },
    },
  }, approveCheckpointHandler)

  // POST /executor/checkpoint/:jobId/reject - Reject checkpoint (JWT protected)
  fastify.post('/executor/checkpoint/:jobId/reject', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          jobId: { type: 'string', minLength: 1 },
        },
      },
    },
  }, rejectCheckpointHandler)
}