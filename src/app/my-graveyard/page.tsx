'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Skull, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import TombstoneCard from '@/components/TombstoneCard'
import { Tombstone } from '@/types'
import { useI18n } from '@/components/I18nProvider'

export default function MyGraveyardPage() {
  const { data: session, status } = useSession()
  const { t } = useI18n()
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
    if (!confirm(t.myGraveyard.deleteConfirm)) return
    try {
      const res = await fetch(`/api/tombstones/${id}`, { method: 'DELETE' })
      if (res.ok) setTombstones(prev => prev.filter(t => t.id !== id))
    } catch (e) { console.error(e) }
  }

  if (status === 'unauthenticated') return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><Skull className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-600 dark:text-gray-400 mb-4">{t.myGraveyard.loginFirst}</p><Link href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">{t.common.backHome}</Link></div></div>

  const totalFlowers = tombstones.reduce((sum, item) => sum + item.flower_count, 0)
  const totalEulogies = tombstones.reduce((sum, item) => sum + item.eulogy_count, 0)

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            {session?.user?.image && <img src={session.user.image} alt="" className="w-16 h-16 rounded-full border-2 border-purple-500 dark:border-purple-500" />}
            <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">{session?.user?.name} {t.myGraveyard.userGraveyard}</h1><p className="text-gray-600 dark:text-gray-400">{t.myGraveyard.subtitle}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-gray-900 dark:text-white">{tombstones.length}</div><div className="text-sm text-gray-600 dark:text-gray-400">{t.myGraveyard.tombstoneCount}</div></div>
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{totalFlowers}</div><div className="text-sm text-gray-600 dark:text-gray-400">{t.myGraveyard.flowersReceived}</div></div>
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalEulogies}</div><div className="text-sm text-gray-600 dark:text-gray-400">{t.myGraveyard.eulogiesReceived}</div></div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-20"><Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin mx-auto" /><p className="text-gray-600 dark:text-gray-400 mt-4">{t.common.loading}</p></div>
        ) : tombstones.length === 0 ? (
          <div className="text-center py-20"><Skull className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{t.myGraveyard.empty}</p><Link href="/bury" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors inline-block">{t.myGraveyard.buryFirst}</Link></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tombstones.map((tombstone, index) => (
              <div key={tombstone.id} className="relative group">
                <TombstoneCard tombstone={tombstone} index={index} />
                <button onClick={() => handleDelete(tombstone.id)} className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title={t.tombstone.delete}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
