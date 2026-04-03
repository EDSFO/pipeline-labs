'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Play, Pause, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { CheckpointModal } from './CheckpointModal'

interface Checkpoint {
  id: string
  name: string
  description: string
}

interface ExecutionStatus {
  id: string
  status: 'pending' | 'active' | 'waiting_checkpoint' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  checkpoint?: Checkpoint
  output: Record<string, unknown>
  startedAt: string | null
  completedAt: string | null
}

interface ExecutionViewProps {
  jobId: string
  onStatusChange?: (status: string) => void
}

export function ExecutionView({ jobId, onStatusChange }: ExecutionViewProps) {
  const t = useTranslations('executor')
  const [status, setStatus] = useState<ExecutionStatus | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return

    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/executor/status/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch status')
        }

        const data = await response.json()
        setStatus(data)
        onStatusChange?.(data.status)

        // Stop polling if terminal state
        if (['completed', 'failed'].includes(data.status)) {
          setIsPolling(false)
        }

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    // Initial fetch
    fetchStatus()

    // Set up polling
    if (isPolling) {
      const interval = setInterval(fetchStatus, 3000)
      return () => clearInterval(interval)
    }
  }, [jobId, isPolling, onStatusChange])

  const getStatusIcon = () => {
    if (!status) return null

    switch (status.status) {
      case 'pending':
        return <Pause className="h-5 w-5 text-slate-500" />
      case 'active':
        return <Play className="h-5 w-5 text-blue-500" />
      case 'waiting_checkpoint':
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    if (!status) return 'text-slate-500'

    switch (status.status) {
      case 'pending':
        return 'bg-slate-100 text-slate-600'
      case 'active':
        return 'bg-blue-100 text-blue-600'
      case 'waiting_checkpoint':
        return 'bg-amber-100 text-amber-600'
      case 'completed':
        return 'bg-green-100 text-green-600'
      case 'failed':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor()}`}>
          {status ? t(`status.${status.status}`) : 'Loading...'}
        </span>
      </div>

      {/* Progress Bar */}
      {status && status.totalSteps > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>
              {t('step')} {status.currentStep} {t('of')} {status.totalSteps}
            </span>
            <span>{Math.round((status.currentStep / status.totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full transition-all duration-300 bg-blue-600"
              style={{ width: `${(status.currentStep / status.totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Checkpoint Modal */}
      {status?.status === 'waiting_checkpoint' && status.checkpoint && (
        <CheckpointModal
          checkpoint={status.checkpoint}
          onApprove={async () => {
            try {
              const token = localStorage.getItem('token')
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/executor/checkpoint/${jobId}/approve`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
            } catch (err) {
              console.error('Failed to approve checkpoint:', err)
            }
          }}
          onReject={async () => {
            try {
              const token = localStorage.getItem('token')
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/executor/checkpoint/${jobId}/reject`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
            } catch (err) {
              console.error('Failed to reject checkpoint:', err)
            }
          }}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Output Section */}
      {status?.output && Object.keys(status.output).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-slate-900">{t('output')}</h3>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <pre className="whitespace-pre-wrap text-sm text-slate-700">
              {JSON.stringify(status.output, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}