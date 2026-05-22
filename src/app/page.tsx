'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Skull, Flower2, MessageSquare, TrendingUp } from 'lucide-react'
import TombstoneCard from '@/components/TombstoneCard'
import { Tombstone, GlobalStats } from '@/types'
import { CAUSE_OF_DEATH_LABELS } from '@/lib/constants'

export default function Home() {
  const [tombstones, setTombstones] = useState<Tombstone[]>([])
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTombstones()
  }, [])

  const fetchTombstones = async () => {
    try {
      const res = await fetch('/api/tombstones?limit=12')
      const data = await res.json()
      setTombstones(data.tombstones || [])

      const totalFlowers = (data.tombstones || []).reduce((sum: number, t: Tombstone) => sum + t.flower_count, 0)
      const totalEulogies = (data.tombstones || []).reduce((sum: number, t: Tombstone) => sum + t.eulogy_count, 0)

      const causeCounts: Record<string, number> = {}
      ;(data.tombstones || []).forEach((t: Tombstone) => {
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
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
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
              <Skull className="w-16 h-16 text-purple-400" />
              <h1 className="text-6xl font-bold gradient-text">代码火葬场</h1>
            </div>
            <p className="text-xl text-gray-400 mb-8">每段代码都值得一个体面的葬礼</p>
            <p className="text-gray-500 max-w-2xl mx-auto">
              把你删掉的代码、废弃的项目、重构时牺牲的函数——都埋葬在这里。每段代码都有墓碑和&quot;死因&quot;，其他人可以来扫墓、献花。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Skull, value: stats.total_tombstones, label: '代码已埋葬', color: 'text-purple-400' },
                { icon: Flower2, value: stats.total_flowers, label: '鲜花已献上', color: 'text-pink-400' },
                { icon: MessageSquare, value: stats.total_eulogies, label: '悼词已写下', color: 'text-blue-400' },
                { icon: TrendingUp, value: stats.top_causes[0]?.cause ? CAUSE_OF_DEATH_LABELS[stats.top_causes[0].cause as keyof typeof CAUSE_OF_DEATH_LABELS]?.emoji : '💀', label: '最热门死因', color: 'text-green-400' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
                  <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-2`} />
                  <div className="text-3xl font-bold text-white">{item.value}</div>
                  <div className="text-sm text-gray-400">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tombstones Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Skull className="w-6 h-6 text-purple-400" />
            最近的墓碑
          </h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 mt-4">加载中...</p>
            </div>
          ) : tombstones.length === 0 ? (
            <div className="text-center py-20">
              <Skull className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">还没有人埋葬代码</p>
              <p className="text-gray-500 mt-2">成为第一个献上代码的人吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tombstones.map((tombstone, index) => (
                <TombstoneCard key={tombstone.id} tombstone={tombstone} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
