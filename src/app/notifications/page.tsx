'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Flower2, MessageSquare, Flame, Check, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { showToast } from '@/components/Toast'

interface Notification {
  id: string
  type: 'flower' | 'eulogy' | 'candle'
  from_username: string
  from_avatar_url: string
  tombstone_id: string
  tombstone_name: string
  is_read: boolean
  created_at: string
}

const TYPE_CONFIG = {
  flower: { icon: Flower2, label: '给你献了花 🌸', color: 'text-pink-500' },
  eulogy: { icon: MessageSquare, label: '写了悼词 💬', color: 'text-blue-500' },
  candle: { icon: Flame, label: '点了蜡烛 🕯️', color: 'text-yellow-500' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      showToast('全部已读 ✓', 'success')
    } catch (e) {
      console.error(e)
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
    return `${days}天前`
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">通知</h1>
              {unreadCount > 0 && (
                <span className="text-sm text-gray-500">{unreadCount} 条未读</span>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              全部已读
            </button>
          )}
        </motion.div>

        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">没有通知</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">当有人给你墓碑献花、写悼词时会通知你</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => {
              const config = TYPE_CONFIG[n.type]
              const Icon = config.icon

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/tombstone/${n.tombstone_id}`}
                    className={`block p-4 rounded-xl border transition-all hover:shadow-md ${
                      n.is_read
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                        : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img src={n.from_avatar_url} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{n.from_username}</span>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{config.label}</span>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                          {n.tombstone_name || '墓碑'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {timeAgo(n.created_at)}
                        </div>
                      </div>
                      {!n.is_read && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
