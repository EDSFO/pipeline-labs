import { Worker, Job } from 'bullmq'
import { executorQueue } from '../../lib/queue.js'
import { redis } from '../../lib/redis.js'

interface ExecutionJobData {
  userId: string
  squadId: string
  inputs: Record<string, string>
  jobId: string
}

interface ExecutionStatus {
  id: string
  status: 'pending' | 'active' | 'waiting_checkpoint' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  checkpoint?: {
    id: string
    name: string
    description: string
  }
  output: Record<string, unknown>
  startedAt: string | null
  completedAt: string | null
}

const EXECUTION_PREFIX = 'squad-execution:'
const CHECKPOINT_WAIT_PREFIX = 'checkpoint-wait:'

// Store execution state in Redis
async function setExecutionState(jobId: string, state: Partial<ExecutionStatus>, userId?: string): Promise<void> {
  const stateObj: Record<string, string> = {
    ...state,
    updatedAt: new Date().toISOString(),
  }
  if (userId) {
    stateObj.userId = userId
  }
  // Convert nested objects to JSON strings
  if (state.checkpoint) {
    stateObj.checkpoint = JSON.stringify(state.checkpoint)
  }
  if (state.output) {
    stateObj.output = JSON.stringify(state.output)
  }
  // Remove undefined values
  Object.keys(stateObj).forEach(key => {
    if (stateObj[key] === undefined) {
      delete stateObj[key]
    }
  })
  await redis.hset(`${EXECUTION_PREFIX}${jobId}`, stateObj)
}

async function getExecutionState(jobId: string): Promise<Record<string, string> | null> {
  const state = await redis.hgetall(`${EXECUTION_PREFIX}${jobId}`)
  return Object.keys(state).length > 0 ? state : null
}

// Wait for checkpoint approval using Redis blocking
async function waitForCheckpointApproval(jobId: string, timeoutMs: number = 60000): Promise<'approved' | 'rejected' | 'timeout'> {
  const startTime = Date.now()
  const waitKey = `${CHECKPOINT_WAIT_PREFIX}${jobId}`

  while (Date.now() - startTime < timeoutMs) {
    // Check if approval/rejection signal exists
    const approved = await redis.get(`${waitKey}:approved`)
    if (approved === '1') {
      await redis.del(`${waitKey}:approved`)
      return 'approved'
    }

    const rejected = await redis.get(`${waitKey}:rejected`)
    if (rejected === '1') {
      await redis.del(`${waitKey}:rejected`)
      return 'rejected'
    }

    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return 'timeout'
}

export async function enqueueSquadExecution(
  userId: string,
  squadId: string,
  inputs: Record<string, string>
): Promise<string> {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  await executorQueue.add('execute-squad', {
    userId,
    squadId,
    inputs,
    jobId,
  })

  // Initialize execution state
  await setExecutionState(jobId, {
    id: jobId,
    status: 'pending',
    currentStep: 0,
    totalSteps: 5, // Placeholder, will be determined by squad pipeline
    output: {},
    startedAt: new Date().toISOString(),
  }, userId)

  return jobId
}

export async function getExecutionStatus(jobId: string): Promise<ExecutionStatus | null> {
  const state = await getExecutionState(jobId)

  if (!state) {
    // Check if job exists in queue
    const job = await executorQueue.getJob(jobId)
    if (!job) return null

    // Job exists but no state yet - return pending
    return {
      id: jobId,
      status: 'pending',
      currentStep: 0,
      totalSteps: 0,
      output: {},
      startedAt: null,
      completedAt: null,
    }
  }

  return {
    id: state.id,
    status: state.status as ExecutionStatus['status'],
    currentStep: parseInt(state.currentStep || '0', 10),
    totalSteps: parseInt(state.totalSteps || '0', 10),
    checkpoint: state.checkpoint ? JSON.parse(state.checkpoint) : undefined,
    output: state.output ? JSON.parse(state.output) : {},
    startedAt: state.startedAt || null,
    completedAt: state.completedAt || null,
  }
}

export async function approveCheckpoint(jobId: string, userId: string): Promise<ExecutionStatus | null> {
  const state = await getExecutionState(jobId)

  if (!state || state.status !== 'waiting_checkpoint') {
    return null
  }

  // Verify user owns the execution
  if (state.userId !== userId) {
    return null
  }

  // Set approval signal
  await redis.set(`${CHECKPOINT_WAIT_PREFIX}${jobId}:approved`, '1')

  await setExecutionState(jobId, {
    status: 'active',
  })

  return getExecutionStatus(jobId)
}

export async function rejectCheckpoint(jobId: string, userId: string): Promise<ExecutionStatus | null> {
  const state = await getExecutionState(jobId)

  if (!state || state.status !== 'waiting_checkpoint') {
    return null
  }

  // Verify user owns the execution
  if (state.userId !== userId) {
    return null
  }

  // Set rejection signal
  await redis.set(`${CHECKPOINT_WAIT_PREFIX}${jobId}:rejected`, '1')

  await setExecutionState(jobId, {
    status: 'failed',
    completedAt: new Date().toISOString(),
  })

  return getExecutionStatus(jobId)
}

// Worker for processing squad execution jobs
export function createExecutorWorker(): Worker {
  const worker = new Worker<ExecutionJobData>(
    'squad-executor',
    async (job: Job<ExecutionJobData>) => {
      const { userId, squadId, inputs, jobId } = job.data

      console.log(`Processing squad execution: ${squadId} for user: ${userId}`)

      // Update status to active
      await setExecutionState(jobId, {
        status: 'active',
        currentStep: 1,
      })

      // For MVP: Simulate execution with delays
      // Real implementation would parse squad pipeline config and execute steps

      // Simulate step 1
      await simulateStep(1000)
      await setExecutionState(jobId, { currentStep: 1, output: { step1: 'Initialized' } })

      // Simulate step 2 - Call AI gateway (placeholder)
      await simulateStep(2000)
      await setExecutionState(jobId, { currentStep: 2, output: { step1: 'Initialized', step2: 'AI processed' } })

      // Simulate checkpoint - set status and wait for approval
      const checkpointData = {
        id: 'checkpoint-1',
        name: 'Review AI Output',
        description: 'Please review the AI generated content before proceeding',
      }
      await setExecutionState(jobId, {
        status: 'waiting_checkpoint',
        checkpoint: checkpointData,
      })

      // Wait for checkpoint approval (using Redis blocking loop)
      const result = await waitForCheckpointApproval(jobId, 300000) // 5 minute timeout

      if (result === 'rejected') {
        await setExecutionState(jobId, {
          status: 'failed',
          completedAt: new Date().toISOString(),
        })
        throw new Error('Execution rejected at checkpoint')
      }

      if (result === 'timeout') {
        await setExecutionState(jobId, {
          status: 'failed',
          completedAt: new Date().toISOString(),
        })
        throw new Error('Checkpoint approval timed out')
      }

      // Approved - continue with remaining steps
      await setExecutionState(jobId, {
        status: 'active',
        currentStep: 3,
      })

      await simulateStep(1500)
      await setExecutionState(jobId, { currentStep: 4, output: { step1: 'Initialized', step2: 'AI processed', step3: 'Checkpoint passed' } })

      await simulateStep(1000)
      await setExecutionState(jobId, {
        status: 'completed',
        currentStep: 5,
        completedAt: new Date().toISOString(),
        output: { step1: 'Initialized', step2: 'AI processed', step3: 'Checkpoint passed', step4: 'Finalized', step5: 'Complete' },
      })

      return { success: true, jobId }
    },
    {
      connection: redis,
      concurrency: 5,
    }
  )

  worker.on('completed', async (job) => {
    console.log(`Job ${job.id} completed successfully`)
    const jobId = job.id as string
    const waitKey = `${CHECKPOINT_WAIT_PREFIX}${jobId}`
    await redis.del(`${EXECUTION_PREFIX}${jobId}`)
    await redis.del(waitKey)
  })

  worker.on('failed', async (job, err) => {
    console.error(`Job ${job?.id} failed:`, err)
    if (job?.id) {
      const jobId = job.id as string
      const waitKey = `${CHECKPOINT_WAIT_PREFIX}${jobId}`
      await setExecutionState(jobId, {
        status: 'failed',
        completedAt: new Date().toISOString(),
      })
      await redis.del(`${EXECUTION_PREFIX}${jobId}`)
      await redis.del(waitKey)
    }
  })

  return worker
}

function simulateStep(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration))
}