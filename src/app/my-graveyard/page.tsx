'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Skull, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import TombstoneCard from '@/components/TombstoneCard'
import { Tombstone } from '@/types'

export default function MyGraveyardPage() {
  const { data: session, status } = useSession()
  const [tombstones, setTombstones] = useState<Tombstone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) fetchMyTombstones()
  }, [session])

  const fetchMyTombstones = async () => {
    try {
      const res = await fetch(`/api/tombstones?userId=${session?.user?.id}&limit=100`)
      const data = await res.json()
      setTombstones(data.tombstones || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个墓碑吗？')) return
    try {
      const res = await fetch(`/api/tombstones/${id}`, { method: 'DELETE' })
      if (res.ok) setTombstones(prev => prev.filter(t => t.id !== id))
    } catch (e) { console.error(e) }
  }

  if (status === 'unauthenticated') return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><Skull className="w-16 h-16 text-gray-600 mx-auto mb-4" /><p className="text-gray-400 mb-4">请先登录</p><Link href="/" className="text-purple-400 hover:text-purple-300">返回首页</Link></div></div>

  const totalFlowers = tombstones.reduce((sum, t) => sum + t.flower_count, 0)
  const totalEulogies = tombstones.reduce((sum, t) => sum + t.eulogy_count, 0)

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            {session?.user?.image && <img src={session.user.image} alt="" className="w-16 h-16 rounded-full border-2 border-purple-500" />}
            <div><h1 className="text-3xl font-bold text-white">{session?.user?.name} 的墓地</h1><p className="text-gray-400">你的代码安息之地</p></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-white">{tombstones.length}</div><div className="text-sm text-gray-400">墓碑数量</div></div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-pink-400">{totalFlowers}</div><div className="text-sm text-gray-400">收到鲜花</div></div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-blue-400">{totalEulogies}</div><div className="text-sm text-gray-400">收到悼词</div></div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-20"><Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" /><p className="text-gray-400 mt-4">加载中...</p></div>
        ) : tombstones.length === 0 ? (
          <div className="text-center py-20"><Skull className="w-16 h-16 text-gray-600 mx-auto mb-4" /><p className="text-gray-400 text-lg mb-4">你的墓地还是空的</p><Link href="/bury" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors inline-block">埋葬第一段代码</Link></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tombstones.map((tombstone, index) => (
              <div key={tombstone.id} className="relative group">
                <TombstoneCard tombstone={tombstone} index={index} />
                <button onClick={() => handleDelete(tombstone.id)} className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="删除墓碑"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
