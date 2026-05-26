'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Bookmark, LogIn } from 'lucide-react'
import Link from 'next/link'
import TombstoneCard from '@/components/TombstoneCard'
import { Tombstone } from '@/types'

export default function BookmarksPage() {
  const { data: session, status } = useSession()
  const [tombstones, setTombstones] = useState<Tombstone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) fetchBookmarks()
    else if (status === 'unauthenticated') setLoading(false)
  }, [session, status])

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks')
      if (res.ok) {
        const data = await res.json()
        setTombstones(data.bookmarks || [])
      }
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

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">请先登录查看收藏</p>
          <Link href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Bookmark className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">我的收藏</h1>
          <p className="text-gray-600 dark:text-gray-400">收藏的墓碑 ❤️</p>
        </motion.div>

        {tombstones.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">还没有收藏</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">在墓碑详情页点击收藏按钮</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tombstones.map((tombstone, index) => (
              <TombstoneCard key={tombstone.id} tombstone={tombstone} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
