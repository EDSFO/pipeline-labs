'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Play } from 'lucide-react'
import { ExecutionView } from '@/components/dashboard/ExecutionView'

interface Squad {
  id: string
  name: string
  description: string
  pipelineConfig?: {
    inputs: Array<{
      name: string
      label: string
      type: string
      required: boolean
    }>
  }
}

export default function ExecuteSquadPage() {
  const t = useTranslations('executor')
  const router = useRouter()
  const params = useParams()
  const squadId = params.squadId as string

  const [squad, setSquad] = useState<Squad | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch squad details
    const fetchSquad = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/squads/${squadId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setSquad(data)

          // Initialize inputs from pipeline config
          if (data.pipelineConfig?.inputs) {
            const initialInputs: Record<string, string> = {}
            data.pipelineConfig.inputs.forEach((input: { name: string; type: string }) => {
              initialInputs[input.name] = ''
            })
            setInputs(initialInputs)
          }
        } else {
          setError('Failed to load squad')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSquad()
  }, [squadId])

  const handleInputChange = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }))
  }

  const handleStartExecution = async () => {
    setIsStarting(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/executor/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          squadId,
          inputs,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start execution')
      }

      const data = await response.json()
      setJobId(data.jobId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start execution')
    } finally {
      setIsStarting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (error && !squad) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-sm text-slate-600">{squad?.name || squadId}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Execution View (if running) */}
      {jobId && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <ExecutionView jobId={jobId} />
        </div>
      )}

      {/* Input Form (if not running) */}
      {!jobId && squad && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('inputs.title')}</h2>
              <p className="mt-1 text-sm text-slate-600">{t('inputs.description')}</p>
            </div>

            {/* Dynamic inputs based on squad pipeline config */}
            {squad.pipelineConfig?.inputs?.length > 0 ? (
              <div className="space-y-4">
                {squad.pipelineConfig.inputs.map((input) => (
                  <div key={input.name} className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      {input.label}
                      {input.required && <span className="text-red-500"> *</span>}
                    </label>
                    {input.type === 'textarea' ? (
                      <textarea
                        value={inputs[input.name] || ''}
                        onChange={(e) => handleInputChange(input.name, e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={4}
                      />
                    ) : (
                      <input
                        type="text"
                        value={inputs[input.name] || ''}
                        onChange={(e) => handleInputChange(input.name, e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No inputs required for this squad.</p>
            )}

            <button
              onClick={handleStartExecution}
              disabled={isStarting || (squad.pipelineConfig?.inputs?.some((i: { required: boolean }) => i.required && !inputs[i.name]))}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {isStarting ? t('starting') : t('start')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}