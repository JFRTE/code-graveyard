'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Skull, Flower2, MessageSquare, Flame, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  id: string
  type: 'tombstone' | 'flower' | 'eulogy' | 'candle'
  username: string
  avatar_url: string
  tombstone_id: string
  tombstone_name?: string
  created_at: string
  detail?: string
}

const TYPE_CONFIG = {
  tombstone: { icon: Skull, label: '埋葬了', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  flower: { icon: Flower2, label: '献花给', color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  eulogy: { icon: MessageSquare, label: '写悼词给', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  candle: { icon: Flame, label: '点蜡烛给', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      // Fetch recent tombstones, and combine with recent flowers/eulogies
      const [tombRes] = await Promise.all([
        fetch('/api/tombstones?limit=20'),
      ])
      const tombData = await tombRes.json()
      const tombstones = tombData.tombstones || []

      const items: ActivityItem[] = tombstones.map((t: any) => ({
        id: t.id,
        type: 'tombstone' as const,
        username: t.username,
        avatar_url: t.avatar_url,
        tombstone_id: t.id,
        tombstone_name: t.code_name,
        created_at: t.created_at,
      }))

      // Sort by date
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setActivities(items)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '刚刚'
    if (mins < 60) return `${mins}分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}天前`
    return `${Math.floor(days / 30)}个月前`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Activity className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">活动时间线</h1>
          <p className="text-gray-600 dark:text-gray-400">墓地里的最新动态 🕊️</p>
        </motion.div>

        {activities.length === 0 ? (
          <div className="text-center py-20">
            <Skull className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">还没有任何活动</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-transparent" />

            <div className="space-y-6">
              {activities.map((item, i) => {
                const config = TYPE_CONFIG[item.type]
                const Icon = config.icon

                return (
                  <motion.div
                    key={`${item.id}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pl-20"
                  >
                    {/* Icon */}
                    <div className={`absolute left-4 w-9 h-9 rounded-full ${config.bg} flex items-center justify-center z-10`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={item.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{item.username}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{config.label}</span>
                        <Link href={`/tombstone/${item.tombstone_id}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-sm font-medium">
                          {item.tombstone_name || '墓碑'}
                        </Link>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {timeAgo(item.created_at)}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
