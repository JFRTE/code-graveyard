'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Skull, Flower2, MessageSquare, TrendingUp, Search, Filter, ChevronDown } from 'lucide-react'
import TombstoneCard from '@/components/TombstoneCard'
import { Tombstone, GlobalStats } from '@/types'
import { CAUSE_OF_DEATH_LABELS, CAUSE_OPTIONS } from '@/lib/constants'

export default function Home() {
  const [tombstones, setTombstones] = useState<Tombstone[]>([])
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCause, setSelectedCause] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const languages = ['', 'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c', 'cpp', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql', 'shell', 'other']

  useEffect(() => {
    fetchTombstones(1, true)
    fetchStats()
  }, [search, selectedCause, selectedLanguage])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/tombstones?limit=1000')
      const data = await res.json()
      const all = data.tombstones || []

      const totalFlowers = all.reduce((sum: number, t: Tombstone) => sum + t.flower_count, 0)
      const totalEulogies = all.reduce((sum: number, t: Tombstone) => sum + t.eulogy_count, 0)

      const causeCounts: Record<string, number> = {}
      all.forEach((t: Tombstone) => {
        causeCounts[t.cause_of_death] = (causeCounts[t.cause_of_death] || 0) + 1
      })

      const topCauses = Object.entries(causeCounts)
        .map(([cause, count]) => ({ cause, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setStats({
        total_tombstones: data.total || 0,
        total_flowers: totalFlowers,
        total_eulogies: totalEulogies,
        top_causes: topCauses,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTombstones = async (pageNum: number, reset: boolean = false) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
      })
      if (search) params.set('search', search)
      if (selectedCause) params.set('cause', selectedCause)
      if (selectedLanguage) params.set('language', selectedLanguage)

      const res = await fetch(`/api/tombstones?${params}`)
      const data = await res.json()
      const newTombstones = data.tombstones || []

      if (reset) {
        setTombstones(newTombstones)
      } else {
        setTombstones(prev => [...prev, ...newTombstones])
      }

      setHasMore(newTombstones.length === 12)
      setPage(pageNum)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTombstones(page + 1)
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
              <h1 className="text-6xl font-bold gradient-text">代码火葬场</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">每段代码都值得一个体面的葬礼</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Skull, value: stats.total_tombstones, label: '代码已埋葬', color: 'text-purple-600 dark:text-purple-400' },
                { icon: Flower2, value: stats.total_flowers, label: '鲜花已献上', color: 'text-pink-600 dark:text-pink-400' },
                { icon: MessageSquare, value: stats.total_eulogies, label: '悼词已写下', color: 'text-blue-600 dark:text-blue-400' },
                { icon: TrendingUp, value: stats.top_causes[0]?.cause ? CAUSE_OF_DEATH_LABELS[stats.top_causes[0].cause as keyof typeof CAUSE_OF_DEATH_LABELS]?.emoji : '💀', label: '最热门死因', color: 'text-green-600 dark:text-green-400' },
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

      {/* Search & Filter */}
      <section className="py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索代码名称、描述..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-purple-500 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>筛选</span>
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
                {/* Cause Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">死因</label>
                  <select
                    value={selectedCause}
                    onChange={(e) => setSelectedCause(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">全部死因</option>
                    {CAUSE_OPTIONS.map(cause => {
                      const info = CAUSE_OF_DEATH_LABELS[cause]
                      return <option key={cause} value={cause}>{info.emoji} {info.label}</option>
                    })}
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">编程语言</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">全部语言</option>
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
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 dark:text-gray-400 mt-4">加载中...</p>
            </div>
          ) : tombstones.length === 0 ? (
            <div className="text-center py-20">
              <Skull className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">没有找到墓碑</p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">试试其他搜索条件</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tombstones.map((tombstone, index) => (
                  <TombstoneCard key={tombstone.id} tombstone={tombstone} index={index} />
                ))}
              </div>

              {/* Load More */}
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
                        加载中...
                      </>
                    ) : (
                      '加载更多'
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
