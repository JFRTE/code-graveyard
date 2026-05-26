'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Skull, Flower2, MessageSquare, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import TombstoneCard from '@/components/TombstoneCard'
import { Tombstone } from '@/types'

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const userId = params.id
  const [tombstones, setTombstones] = useState<Tombstone[]>([])
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<{ name: string; image: string } | null>(null)

  useEffect(() => {
    fetchUserTombstones()
  }, [userId])

  const fetchUserTombstones = async () => {
    try {
      const res = await fetch(`/api/tombstones?userId=${userId}&limit=100`)
      const data = await res.json()
      const userTombstones = data.tombstones || []
      setTombstones(userTombstones)

      if (userTombstones.length > 0) {
        setUserInfo({
          name: userTombstones[0].username,
          image: userTombstones[0].avatar_url,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const totalFlowers = tombstones.reduce((sum, t) => sum + t.flower_count, 0)
  const totalEulogies = tombstones.reduce((sum, t) => sum + t.eulogy_count, 0)

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* User Info */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <div className="flex items-center gap-6 mb-8">
                {userInfo?.image ? (
                  <img src={userInfo.image} alt="" className="w-20 h-20 rounded-full border-4 border-purple-500" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{userInfo?.name || '未知用户'}</h1>
                  <p className="text-gray-600 dark:text-gray-400">代码火葬场贡献者</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
                  <Skull className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{tombstones.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">墓碑</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
                  <Flower2 className="w-6 h-6 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalFlowers}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">收到鲜花</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalEulogies}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">收到悼词</div>
                </div>
              </div>
            </motion.div>

            {/* User's Tombstones */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Skull className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              {userInfo?.name} 的墓地
            </h2>

            {tombstones.length === 0 ? (
              <div className="text-center py-20">
                <Skull className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">还没有墓碑</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tombstones.map((tombstone, index) => (
                  <TombstoneCard key={tombstone.id} tombstone={tombstone} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
