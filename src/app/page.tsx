'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Skull, Flower2, MessageSquare, TrendingUp, Search, Filter, ChevronDown, ArrowUpDown } from 'lucide-react'
import TombstoneCard from '@/components/TombstoneCard'
import { SkeletonGrid } from '@/components/Skeleton'
import { Tombstone, GlobalStats } from '@/types'
import { CAUSE_OF_DEATH_LABELS, CAUSE_OPTIONS } from '@/lib/constants'
import { useI18n } from '@/components/I18nProvider'

export default function Home() {
  const { t } = useI18n()

  const SORT_OPTIONS = [
    { value: 'newest', label: t.home.sortNewest },
    { value: 'oldest', label: t.home.sortOldest },
    { value: 'popular', label: t.home.sortPopular },
    { value: 'eulogies', label: t.home.sortEulogies },
    { value: 'candles', label: t.home.sortCandles },
  ]

  const [tombstones, setTombstones] = useState<Tombstone[]>([])
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCause, setSelectedCause] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const languages = ['', 'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c', 'cpp', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql', 'shell', 'other']

  // Debounced search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // AbortController for race condition prevention
  const abortRef = useCallback((() => {
    let controller: AbortController | null = null
    return {
      abort: () => { controller?.abort(); controller = null },
      signal: () => { controller = new AbortController(); return controller.signal },
    }
  })(), [])

  useEffect(() => {
    abortRef.abort()
    const signal = abortRef.signal()

    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page: '1', limit: '12', sort })
        if (search) params.set('search', search)
        if (selectedCause) params.set('cause', selectedCause)
        if (selectedLanguage) params.set('language', selectedLanguage)

        const res = await fetch(`/api/tombstones?${params}`, { signal })
        if (!res.ok) return
        const data = await res.json()
        if (signal.aborted) return

        setTombstones(data.tombstones || [])
        setHasMore((data.tombstones || []).length === 12)
        setPage(1)
      } catch (e: any) {
        if (e.name !== 'AbortError') console.error(e)
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }

    load()

    // Also fetch stats (only on first load or filter change)
    fetch('/api/stats', { signal })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && !signal.aborted) {
          setStats({
            total_tombstones: data.total || 0,
            total_flowers: data.totalFlowers || 0,
            total_eulogies: data.totalEulogies || 0,
            top_causes: data.topCauses || [],
          })
        }
      })
      .catch(() => {})

    return () => abortRef.abort()
  }, [search, selectedCause, selectedLanguage, sort])

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const params = new URLSearchParams({ page: nextPage.toString(), limit: '12', sort })
      if (search) params.set('search', search)
      if (selectedCause) params.set('cause', selectedCause)
      if (selectedLanguage) params.set('language', selectedLanguage)

      const res = await fetch(`/api/tombstones?${params}`)
      if (!res.ok) return
      const data = await res.json()
      const newTombstones = data.tombstones || []

      setTombstones(prev => [...prev, ...newTombstones])
      setHasMore(newTombstones.length === 12)
      setPage(nextPage)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Skull className="w-16 h-16 text-purple-600 dark:text-purple-400" />
              <h1 className="text-6xl font-bold gradient-text">{t.site.title}</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">{t.site.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Skull, value: stats.total_tombstones, label: t.home.buried, color: 'text-purple-600 dark:text-purple-400' },
                { icon: Flower2, value: stats.total_flowers, label: t.home.flowers, color: 'text-pink-600 dark:text-pink-400' },
                { icon: MessageSquare, value: stats.total_eulogies, label: t.home.eulogiesWritten, color: 'text-blue-600 dark:text-blue-400' },
                { icon: TrendingUp, value: stats.top_causes[0]?.cause ? CAUSE_OF_DEATH_LABELS[stats.top_causes[0].cause as keyof typeof CAUSE_OF_DEATH_LABELS]?.emoji : '💀', label: t.home.topCause, color: 'text-green-600 dark:text-green-400' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
                  <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search, Filter & Sort */}
      <section className="py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.home.search}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-purple-500 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>{t.home.filter}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.home.cause}</label>
                  <select
                    value={selectedCause}
                    onChange={(e) => setSelectedCause(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">{t.home.allCauses}</option>
                    {CAUSE_OPTIONS.map(cause => {
                      const info = CAUSE_OF_DEATH_LABELS[cause]
                      return <option key={cause} value={cause}>{info.emoji} {info.label}</option>
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.home.language}</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">{t.home.allLanguages}</option>
                    {languages.filter(Boolean).map(lang => (
                      <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Tombstones Grid */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <SkeletonGrid count={8} />
          ) : tombstones.length === 0 ? (
            <div className="text-center py-20">
              <Skull className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">{t.home.noTombstones}</p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">{t.home.tryOther}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tombstones.map((tombstone, index) => (
                  <TombstoneCard key={tombstone.id} tombstone={tombstone} index={index} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.home.loading}
                      </>
                    ) : (
                      {t.home.loadMore}
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
