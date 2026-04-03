'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { UserSquadList } from '@/components/dashboard/UserSquadList'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

interface UserSquad {
  id: string
  squadId: string
  name: string
  description: string
  price: number
  currency: 'BRL' | 'USD'
  isActive: boolean
  category: string
}

export default function MeusSquadsPage() {
  const t = useTranslations('meuSquads')

  const [squads, setSquads] = useState<UserSquad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [executingId, setExecutingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUserSquads()
  }, [])

  const fetchUserSquads = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }

      const response = await fetch(`${BACKEND_URL}/squads/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch squads')
      }

      const data = await response.json()
      setSquads(data.squads || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecute = async (squadId: string) => {
    setExecutingId(squadId)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${BACKEND_URL}/squads/${squadId}/execute`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to execute squad')
      }

      const data = await response.json()
      alert(`Squad executed! Execution ID: ${data.executionId || 'N/A'}`)
    } catch (err) {
      alert(`Error executing squad: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setExecutingId(null)
    }
  }

  const handleToggleActive = async (squadId: string, newIsActive: boolean) => {
    setTogglingId(squadId)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${BACKEND_URL}/squads/${squadId}/activate`, {
        method: newIsActive ? 'POST' : 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newIsActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update squad status')
      }

      // Update local state
      setSquads((prev) =>
        prev.map((squad) =>
          squad.id === squadId ? { ...squad, isActive: newIsActive } : squad
        )
      )
    } catch (err) {
      alert(`Error updating squad: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-600">{t('subtitle')}</p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Squads list */}
      {!isLoading && !error && (
        <UserSquadList
          squads={squads}
          onExecute={handleExecute}
          onToggleActive={handleToggleActive}
          executingId={executingId}
          togglingId={togglingId}
        />
      )}
    </div>
  )
}
