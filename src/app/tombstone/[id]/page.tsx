'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Skull, ArrowLeft, Flower2, MessageSquare, Calendar, Loader2, Send } from 'lucide-react'
import Link from 'next/link'
import { Tombstone, Eulogy } from '@/types'
import { CAUSE_OF_DEATH_LABELS } from '@/lib/constants'

export default function TombstoneDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const { data: session } = useSession()
  const [tombstone, setTombstone] = useState<Tombstone | null>(null)
  const [eulogies, setEulogies] = useState<Eulogy[]>([])
  const [loading, setLoading] = useState(true)
  const [hasFlowered, setHasFlowered] = useState(false)
  const [flowering, setFlowering] = useState(false)
  const [eulogyContent, setEulogyContent] = useState('')
  const [submittingEulogy, setSubmittingEulogy] = useState(false)

  useEffect(() => {
    fetchTombstone()
    fetchEulogies()
    checkFlowered()
  }, [id])

  const fetchTombstone = async () => {
    try {
      const res = await fetch(`/api/tombstones/${id}`)
      if (res.ok) setTombstone(await res.json())
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const fetchEulogies = async () => {
    try {
      const res = await fetch(`/api/tombstones/${id}/eulogies`)
      if (res.ok) setEulogies(await res.json())
    } catch (e) { console.error(e) }
  }

  const checkFlowered = async () => {
    try {
      const res = await fetch(`/api/tombstones/${id}/flowers`)
      if (res.ok) { const data = await res.json(); setHasFlowered(data.hasFlowered) }
    } catch (e) { console.error(e) }
  }

  const handleFlower = async () => {
    if (!session || hasFlowered || flowering) return
    setFlowering(true)
    try {
      const res = await fetch(`/api/tombstones/${id}/flowers`, { method: 'POST' })
      if (res.ok) { setHasFlowered(true); setTombstone(prev => prev ? { ...prev, flower_count: prev.flower_count + 1 } : null) }
    } catch (e) { console.error(e) } finally { setFlowering(false) }
  }

  const handleEulogy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !eulogyContent.trim() || submittingEulogy) return
    setSubmittingEulogy(true)
    try {
      const res = await fetch(`/api/tombstones/${id}/eulogies`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: eulogyContent }) })
      if (res.ok) { const newEulogy = await res.json(); setEulogies(prev => [newEulogy, ...prev]); setEulogyContent(''); setTombstone(prev => prev ? { ...prev, eulogy_count: prev.eulogy_count + 1 } : null) }
    } catch (e) { console.error(e) } finally { setSubmittingEulogy(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
  if (!tombstone) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><Skull className="w-16 h-16 text-gray-600 mx-auto mb-4" /><p className="text-gray-400">墓碑不存在</p><Link href="/" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">返回首页</Link></div></div>

  const cause = CAUSE_OF_DEATH_LABELS[tombstone.cause_of_death as keyof typeof CAUSE_OF_DEATH_LABELS]

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"><ArrowLeft className="w-4 h-4" /> 返回墓地</Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-[30%] rounded-b-xl p-8 md:p-12 border border-gray-600">
            <div className="text-center mb-6"><span className="text-4xl text-gray-500">✝</span></div>
            <div className="text-center mb-6"><h2 className="text-sm uppercase tracking-widest text-gray-500">R.I.P</h2></div>
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{tombstone.code_name}</h1>
              {cause && <span className={`text-lg ${cause.color}`}>{cause.emoji} {cause.label}</span>}
            </div>
            <div className="flex items-center justify-center gap-4 text-gray-400 mb-6">
              <Calendar className="w-4 h-4" />
              {tombstone.birth_date && <span>{tombstone.birth_date}</span>}
              <span>—</span>
              <span>{tombstone.death_date}</span>
            </div>
            {tombstone.description && <div className="text-center text-gray-300 mb-8 italic max-w-lg mx-auto">&ldquo;{tombstone.description}&rdquo;</div>}
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <img src={tombstone.avatar_url} alt={tombstone.username} className="w-6 h-6 rounded-full" />
              <span>埋葬者：{tombstone.username}</span>
            </div>
            <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-600">
              <button onClick={handleFlower} disabled={!session || hasFlowered || flowering} className={`flex items-center gap-2 transition-all ${hasFlowered ? 'text-pink-400' : session ? 'text-gray-400 hover:text-pink-400 cursor-pointer' : 'text-gray-500 cursor-not-allowed'}`}>
                <Flower2 className={`w-6 h-6 ${flowering ? 'animate-bounce' : ''}`} />
                <span className="text-lg font-medium">{tombstone.flower_count}</span>
                <span className="text-sm">{hasFlowered ? '已献花' : '献花'}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-400">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-medium">{tombstone.eulogy_count}</span>
                <span className="text-sm">悼词</span>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Skull className="w-5 h-5 text-purple-400" /> 代码遗体</h3>
            <div className="code-block overflow-x-auto"><pre className="text-gray-300"><code>{tombstone.code_content}</code></pre></div>
            <div className="mt-2 text-sm text-gray-500">语言：{tombstone.language}</div>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-400" /> 悼词 ({eulogies.length})</h3>
          {session ? (
            <form onSubmit={handleEulogy} className="mb-8">
              <div className="flex gap-3">
                <img src={session.user?.image || ''} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <textarea value={eulogyContent} onChange={(e) => setEulogyContent(e.target.value)} placeholder="写一段悼词..." rows={3} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none" />
                  <div className="flex justify-end mt-2">
                    <button type="submit" disabled={!eulogyContent.trim() || submittingEulogy} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2">
                      {submittingEulogy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      发表悼词
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : <div className="text-center py-6 bg-gray-900/50 rounded-lg mb-8"><p className="text-gray-400">登录后可以发表悼词</p></div>}

          {eulogies.length === 0 ? (
            <div className="text-center py-12"><MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">还没有悼词</p></div>
          ) : (
            <div className="space-y-6">
              {eulogies.map((eulogy, index) => (
                <motion.div key={eulogy.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex gap-3">
                  <img src={eulogy.avatar_url} alt={eulogy.username} className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-white">{eulogy.username}</span>
                      <span className="text-sm text-gray-500">{new Date(eulogy.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <p className="text-gray-300">{eulogy.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
