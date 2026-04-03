'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { SquadCard } from '@/components/dashboard/SquadCard'
import { SquadFilter } from '@/components/dashboard/SquadFilter'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

interface Squad {
  id: string
  name: string
  description: string
  price: number
  currency: 'BRL' | 'USD'
  category: string
}

export default function MarketplacePage() {
  const t = useTranslations('marketplace')
  const pathname = usePathname()
  const locale = pathname.startsWith('/pt-BR') ? 'pt-BR' : 'en-US'

  const [squads, setSquads] = useState<Squad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [buyingId, setBuyingId] = useState<string | null>(null)

  useEffect(() => {
    fetchSquads()
  }, [locale])

  const fetchSquads = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${BACKEND_URL}/squads?locale=${locale}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  const handleBuy = async (squadId: string) => {
    setBuyingId(squadId)
    // TODO: Implement purchase logic with Stripe
    // For now, just simulate a delay
    setTimeout(() => {
      setBuyingId(null)
      alert(`TODO: Implement Stripe checkout for squad ${squadId}`)
    }, 1000)
  }

  const filteredSquads = selectedCategory === 'all'
    ? squads
    : squads.filter(squad => squad.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {t('subtitle')}
        </p>
      </div>

      {/* Filter */}
      <SquadFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

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

      {/* Empty state */}
      {!isLoading && !error && filteredSquads.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-600">{t('empty')}</p>
        </div>
      )}

      {/* Squads grid */}
      {!isLoading && !error && filteredSquads.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSquads.map((squad) => (
            <SquadCard
              key={squad.id}
              id={squad.id}
              name={squad.name}
              description={squad.description}
              price={squad.price}
              currency={squad.currency}
              locale={locale}
              isLoading={buyingId === squad.id}
              onBuy={handleBuy}
            />
          ))}
        </div>
      )}
    </div>
  )
}
