'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Skull, Flower2, MessageSquare, Trophy, Crown, Medal } from 'lucide-react'
import Link from 'next/link'
import { Tombstone } from '@/types'
import { CAUSE_OF_DEATH_LABELS } from '@/lib/constants'

export default function LeaderboardPage() {
  const [topFlowers, setTopFlowers] = useState<Tombstone[]>([])
  const [topEulogies, setTopEulogies] = useState<Tombstone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/tombstones?limit=100')
      const data = await res.json()
      const tombstones = data.tombstones || []

      const sortedByFlowers = [...tombstones].sort((a, b) => b.flower_count - a.flower_count).slice(0, 10)
      const sortedByEulogies = [...tombstones].sort((a, b) => b.eulogy_count - a.eulogy_count).slice(0, 10)

      setTopFlowers(sortedByFlowers)
      setTopEulogies(sortedByEulogies)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">排行榜</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">最受关注的代码墓碑</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Top Flowers */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Flower2 className="w-5 h-5 text-pink-500" />
                最多献花
              </h2>
              <div className="space-y-3">
                {topFlowers.map((t, i) => (
                  <Link key={t.id} href={`/tombstone/${t.id}`}>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-purple-500/50 transition-colors">
                      <span className="text-2xl w-10 text-center">{medals[i] || `#${i + 1}`}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{t.code_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.username}</p>
                      </div>
                      <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                        <Flower2 className="w-4 h-4" />
                        <span className="font-bold">{t.flower_count}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Top Eulogies */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                最多悼词
              </h2>
              <div className="space-y-3">
                {topEulogies.map((t, i) => (
                  <Link key={t.id} href={`/tombstone/${t.id}`}>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-purple-500/50 transition-colors">
                      <span className="text-2xl w-10 text-center">{medals[i] || `#${i + 1}`}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{t.code_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.username}</p>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-bold">{t.eulogy_count}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
