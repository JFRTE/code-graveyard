'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Skull, Flower2, MessageSquare, Calendar, TrendingUp, Flame } from 'lucide-react'
import PieChart from '@/components/PieChart'

const COLORS = [
  '#ef4444', '#a855f7', '#6b7280', '#eab308',
  '#3b82f6', '#ec4899', '#f97316', '#6b7280',
]

interface StatsData {
  total: number
  totalFlowers: number
  totalEulogies: number
  totalCandles: number
  topCauses: { cause: string; count: number }[]
  topLanguages: { lang: string; count: number }[]
  monthly: { month: string; count: number }[]
}

const CAUSE_LABELS: Record<string, { label: string; emoji: string }> = {
  refactored: { label: '重构牺牲', emoji: '🔪' },
  deleted_by_mistake: { label: '误删手滑', emoji: '💀' },
  project_abandoned: { label: '项目废弃', emoji: '🏚️' },
  client_requirements: { label: '甲方砍需求', emoji: '🤡' },
  tech_obsolete: { label: '技术过时', emoji: '⚰️' },
  mystery_bug: { label: '玄学Bug', emoji: '🎭' },
  rewritten: { label: '推倒重写', emoji: '🔥' },
  other: { label: '其他原因', emoji: '🪦' },
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) setStats(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">加载失败</p>
      </div>
    )
  }

  const pieData = stats.topCauses.map((d, i) => {
    const info = CAUSE_LABELS[d.cause]
    return {
      label: info?.label || d.cause,
      value: d.count,
      color: COLORS[i % COLORS.length],
      emoji: info?.emoji || '💀',
    }
  })

  const maxLangCount = stats.topLanguages[0]?.count || 1
  const maxMonthly = Math.max(...stats.monthly.map(m => m.count), 1)

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <BarChart3 className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">墓地数据</h1>
          <p className="text-gray-600 dark:text-gray-400">代码死亡率统计报告 📊</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Skull, label: '总墓碑', value: stats.total, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { icon: Flower2, label: '总献花', value: stats.totalFlowers, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
            { icon: MessageSquare, label: '总悼词', value: stats.totalEulogies, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { icon: Flame, label: '总蜡烛', value: stats.totalCandles, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`${card.bg} border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center`}
            >
              <card.icon className={`w-8 h-8 ${card.color} mx-auto mb-2`} />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{card.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Skull className="w-5 h-5 text-purple-600 dark:text-purple-400" /> 死因分布
          </h2>
          {pieData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <PieChart data={pieData} size={220} />
              </div>
              <div className="flex-1 space-y-3">
                {pieData.map((d, i) => {
                  const pct = ((d.value / stats.total) * 100).toFixed(1)
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xl">{d.emoji}</span>
                      <span className="text-gray-700 dark:text-gray-300 w-24 text-sm">{d.label}</span>
                      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full" style={{ backgroundColor: d.color }} />
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-mono w-14 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">暂无数据</p>
          )}
        </motion.div>

        {/* Language Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" /> 编程语言分布
          </h2>
          {stats.topLanguages.length > 0 ? (
            <div className="space-y-3">
              {stats.topLanguages.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-700 dark:text-gray-300 w-24 text-sm font-mono">{d.lang}</span>
                  <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(d.count / maxLangCount) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.08 }} className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-end pr-2">
                      <span className="text-white text-xs font-bold">{d.count}</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">暂无数据</p>
          )}
        </motion.div>

        {/* Monthly Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 近 12 个月埋葬趋势
          </h2>
          <div className="flex items-end justify-between gap-1 h-40">
            {stats.monthly.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{d.count > 0 ? d.count : ''}</span>
                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max((d.count / maxMonthly) * 120, d.count > 0 ? 8 : 2)}px` }} transition={{ duration: 0.5, delay: i * 0.05 }} className="w-full rounded-t bg-gradient-to-t from-purple-600 to-indigo-400 min-h-[2px]" />
                <span className="text-[10px] text-gray-600 dark:text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
