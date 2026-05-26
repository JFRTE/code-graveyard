'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Skull, ArrowLeft, Flower2, MessageSquare, Calendar, Loader2, Send, Sparkles, Trash2, Edit3, X, Check, Bookmark, BookmarkCheck, Eye, Flag, Tag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Tombstone, Eulogy } from '@/types'
import { CAUSE_OF_DEATH_LABELS, CAUSE_OPTIONS } from '@/lib/constants'
import ShareButton from '@/components/ShareButton'
import Candle from '@/components/Candle'
import BurialAnimation from '@/components/BurialAnimation'
import { showToast } from '@/components/Toast'
import CodeBlock from '@/components/CodeBlock'
import DiffView from '@/components/DiffView'
import ShareImageButton from '@/components/ShareImageButton'
import { playFlowerSound } from '@/lib/sounds'

export default function TombstoneDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const router = useRouter()
  const { data: session } = useSession()
  const [tombstone, setTombstone] = useState<Tombstone | null>(null)
  const [eulogies, setEulogies] = useState<Eulogy[]>([])
  const [loading, setLoading] = useState(true)
  const [hasFlowered, setHasFlowered] = useState(false)
  const [flowering, setFlowering] = useState(false)
  const [hasCandled, setHasCandled] = useState(false)
  const [candling, setCandling] = useState(false)
  const [eulogyContent, setEulogyContent] = useState('')
  const [submittingEulogy, setSubmittingEulogy] = useState(false)
  const [showBurial, setShowBurial] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reporting, setReporting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ code_name: '', code_content: '', description: '', language: '', cause_of_death: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [originalCode, setOriginalCode] = useState('')

  useEffect(() => {
    fetchTombstone()
    fetchEulogies()
    checkFlowered()
    checkCandled()
    checkBookmarked()
    trackView()
  }, [id])

  const fetchTombstone = async () => {
    try {
      const res = await fetch(`/api/tombstones/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTombstone(data)
        setOriginalCode(data.code_content)
        setEditData({
          code_name: data.code_name,
          code_content: data.code_content,
          description: data.description || '',
          language: data.language,
          cause_of_death: data.cause_of_death,
        })
      }
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

  const checkCandled = async () => {
    try {
      const res = await fetch(`/api/tombstones/${id}/candles`)
      if (res.ok) { const data = await res.json(); setHasCandled(data.hasCandled) }
    } catch (e) { console.error(e) }
  }

  const checkBookmarked = async () => {
    if (!session) return
    try {
      const res = await fetch('/api/bookmarks')
      if (res.ok) {
        const data = await res.json()
        setIsBookmarked((data.bookmarks || []).some((b: any) => b.id === id))
      }
    } catch (e) { console.error(e) }
  }

  const trackView = async () => {
    try {
      await fetch(`/api/tombstones/${id}/view`, { method: 'POST' })
    } catch (e) {}
  }

  const handleBookmark = async () => {
    if (!session || bookmarking) return
    setBookmarking(true)
    try {
      if (isBookmarked) {
        await fetch('/api/bookmarks', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tombstone_id: id }),
        })
        setIsBookmarked(false)
        showToast('已取消收藏', 'success')
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tombstone_id: id }),
        })
        setIsBookmarked(true)
        showToast('收藏成功 ❤️', 'success')
      }
    } catch (e) { console.error(e) } finally { setBookmarking(false) }
  }

  const handleReport = async () => {
    if (!session || !reportReason.trim() || reporting) return
    setReporting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tombstone_id: id, reason: reportReason }),
      })
      if (res.ok) {
        showToast('举报已提交', 'success')
        setShowReport(false)
        setReportReason('')
      }
    } catch (e) { console.error(e) } finally { setReporting(false) }
  }

  const handleFlower = async () => {
    if (!session || hasFlowered || flowering) return
    setFlowering(true)
    try {
      const res = await fetch(`/api/tombstones/${id}/flowers`, { method: 'POST' })
      if (res.ok) {
        setHasFlowered(true)
        setTombstone(prev => prev ? { ...prev, flower_count: prev.flower_count + 1 } : null)
        showToast('献花成功 🌸', 'success')
        playFlowerSound()
      }
    } catch (e) { console.error(e) } finally { setFlowering(false) }
  }

  const handleCandle = async () => {
    if (!session || hasCandled || candling) return
    setCandling(true)
    try {
      const res = await fetch(`/api/tombstones/${id}/candles`, { method: 'POST' })
      if (res.ok) {
        setHasCandled(true)
        setTombstone(prev => prev ? { ...prev, candle_count: (prev.candle_count || 0) + 1 } : null)
        showToast('点蜡烛成功 🕯️', 'success')
      }
    } catch (e) { console.error(e) } finally { setCandling(false) }
  }

  const handleEulogy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !eulogyContent.trim() || submittingEulogy) return
    setSubmittingEulogy(true)
    try {
      const res = await fetch(`/api/tombstones/${id}/eulogies`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: eulogyContent }) })
      if (res.ok) {
        const newEulogy = await res.json()
        setEulogies(prev => [newEulogy, ...prev])
        setEulogyContent('')
        setTombstone(prev => prev ? { ...prev, eulogy_count: prev.eulogy_count + 1 } : null)
        showToast('悼词发表成功 💬', 'success')
      }
    } catch (e) { console.error(e) } finally { setSubmittingEulogy(false) }
  }

  const handleGenerateAI = async () => {
    if (!session || generatingAI) return
    setGeneratingAI(true)
    try {
      const res = await fetch(`/api/tombstones/${id}/generate-eulogy`, { method: 'POST' })
      if (res.ok) {
        const newEulogy = await res.json()
        setEulogies(prev => [newEulogy, ...prev])
        setTombstone(prev => prev ? { ...prev, eulogy_count: prev.eulogy_count + 1 } : null)
        showToast('AI 悼词生成成功 🤖✨', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || '生成失败', 'error')
      }
    } catch (e) {
      console.error(e)
      showToast('生成失败，请重试', 'error')
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleDeleteEulogy = async (eulogyId: string) => {
    if (!confirm('确定删除这条悼词？')) return
    try {
      const res = await fetch(`/api/tombstones/${id}/eulogies?eulogyId=${eulogyId}`, { method: 'DELETE' })
      if (res.ok) {
        setEulogies(prev => prev.filter(e => e.id !== eulogyId))
        setTombstone(prev => prev ? { ...prev, eulogy_count: Math.max(0, prev.eulogy_count - 1) } : null)
        showToast('悼词已删除', 'success')
      }
    } catch (e) { console.error(e) }
  }

  const handleSaveEdit = async () => {
    if (!editData.code_name || !editData.code_content) {
      showToast('代码名称和内容不能为空', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/tombstones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (res.ok) {
        const data = await res.json()
        setTombstone(data)
        setIsEditing(false)
        showToast('墓碑已更新 ⚰️', 'success')
      } else {
        const data = await res.json()
        showToast(data.error || '保存失败', 'error')
      }
    } catch (e) {
      showToast('保存失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定删除这个墓碑？此操作不可撤销！')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tombstones/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('墓碑已删除 💀', 'success')
        router.push('/')
      } else {
        const data = await res.json()
        showToast(data.error || '删除失败', 'error')
      }
    } catch (e) {
      showToast('删除失败', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" /></div>
  if (!tombstone) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><Skull className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-600 dark:text-gray-400">墓碑不存在</p><Link href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 mt-4 inline-block">返回首页</Link></div></div>

  const cause = CAUSE_OF_DEATH_LABELS[tombstone.cause_of_death as keyof typeof CAUSE_OF_DEATH_LABELS]
  const isOwner = session?.user?.id === tombstone.user_id

  return (
    <div className="min-h-screen py-12 px-4">
      <BurialAnimation show={showBurial} onComplete={() => setShowBurial(false)} />

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowReport(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚠️ 举报墓碑</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="请描述举报原因..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowReport(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">取消</button>
              <button onClick={handleReport} disabled={!reportReason.trim() || reporting} className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2">
                {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                提交举报
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回墓地
          </Link>
          <div className="flex items-center gap-2">
            <ShareButton tombstoneId={tombstone.id} codeName={tombstone.code_name} />
            <ShareImageButton tombstone={tombstone} />
            {session && (
              <>
                <button
                  onClick={handleBookmark}
                  disabled={bookmarking}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={isBookmarked ? '取消收藏' : '收藏'}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-500" /> : <Bookmark className="w-4 h-4 text-gray-500" />}
                </button>
                <button
                  onClick={() => setShowReport(!showReport)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="举报"
                >
                  <Flag className="w-4 h-4 text-red-400" />
                </button>
              </>
            )}
            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="编辑墓碑"
                >
                  {isEditing ? <X className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <Edit3 className="w-4 h-4 text-blue-500" />}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="删除墓碑"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Edit Mode */}
        {isEditing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">编辑墓碑</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">代码名称</label>
                <input
                  type="text"
                  value={editData.code_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, code_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">代码内容</label>
                <textarea
                  value={editData.code_content}
                  onChange={(e) => setEditData(prev => ({ ...prev, code_content: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">编程语言</label>
                  <select
                    value={editData.language}
                    onChange={(e) => setEditData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    {['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c', 'cpp', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql', 'shell', 'other'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">死因</label>
                  <select
                    value={editData.cause_of_death}
                    onChange={(e) => setEditData(prev => ({ ...prev, cause_of_death: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  >
                    {CAUSE_OPTIONS.map(c => {
                      const info = CAUSE_OF_DEATH_LABELS[c]
                      return <option key={c} value={c}>{info.emoji} {info.label}</option>
                    })}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  取消
                </button>
                <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  保存
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
            <div className="bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-t-[30%] rounded-b-xl p-8 md:p-12 border border-gray-300 dark:border-gray-600">
              <div className="text-center mb-6"><span className="text-4xl text-gray-400 dark:text-gray-500">✝</span></div>
              <div className="text-center mb-6"><h2 className="text-sm uppercase tracking-widest text-gray-500">R.I.P</h2></div>
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{tombstone.code_name}</h1>
                {cause && <span className={`text-lg ${cause.color}`}>{cause.emoji} {cause.label}</span>}
              </div>
              <div className="flex items-center justify-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
                <Calendar className="w-4 h-4" />
                {tombstone.birth_date && <span>{tombstone.birth_date}</span>}
                <span>—</span>
                <span>{tombstone.death_date}</span>
              </div>
              {tombstone.description && <div className="text-center text-gray-700 dark:text-gray-300 mb-8 italic max-w-lg mx-auto">&ldquo;{tombstone.description}&rdquo;</div>}
              <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400">
                <Link href={`/user/${tombstone.user_id}`} className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <img src={tombstone.avatar_url} alt={tombstone.username} className="w-6 h-6 rounded-full" loading="lazy" />
                  <span>埋葬者：{tombstone.username}</span>
                </Link>
                <span className="text-gray-400 dark:text-gray-600">·</span>
                <span className="flex items-center gap-1 text-sm">
                  <Eye className="w-4 h-4" />
                  {tombstone.view_count || 0}
                </span>
              </div>
              <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
                <button onClick={handleFlower} disabled={!session || hasFlowered || flowering} className={`flex items-center gap-2 transition-all ${hasFlowered ? 'text-pink-600 dark:text-pink-400' : session ? 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 cursor-pointer' : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}>
                  <Flower2 className={`w-6 h-6 ${flowering ? 'animate-bounce' : ''}`} />
                  <span className="text-lg font-medium">{tombstone.flower_count}</span>
                  <span className="text-sm">{hasFlowered ? '已献花' : '献花'}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-lg font-medium">{tombstone.eulogy_count}</span>
                  <span className="text-sm">悼词</span>
                </div>
                <Candle count={tombstone.candle_count || 0} onLight={handleCandle} disabled={!session || hasCandled} />
              </div>
            </div>

            {/* Code Block with Syntax Highlighting */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Skull className="w-5 h-5 text-purple-600 dark:text-purple-400" /> 代码遗体
                </h3>
                {tombstone.cause_of_death === 'rewritten' && (
                  <button
                    onClick={() => setShowDiff(!showDiff)}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors"
                  >
                    {showDiff ? '隐藏 Diff' : '查看 Diff'}
                  </button>
                )}
              </div>
              {showDiff ? (
                <DiffView oldCode={originalCode} newCode={`// 重构后的代码\n// (这是演示 - 实际代码在新版本中)\n${editData.code_content}`} />
              ) : (
                <CodeBlock code={tombstone.code_content} language={tombstone.language} />
              )}
              <div className="mt-2 text-sm text-gray-500">语言：{tombstone.language}</div>
            </motion.div>
          </motion.div>
        )}

        {/* Eulogies */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 悼词 ({eulogies.length})</h3>
          {session ? (
            <form onSubmit={handleEulogy} className="mb-8">
              <div className="flex gap-3">
                <img src={session.user?.image || ''} alt="" className="w-10 h-10 rounded-full flex-shrink-0" loading="lazy" />
                <div className="flex-1">
                  <textarea value={eulogyContent} onChange={(e) => setEulogyContent(e.target.value)} placeholder="写一段悼词..." rows={3} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none" />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={!session || generatingAI}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
                    >
                      {generatingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      AI 写悼词
                    </button>
                    <button type="submit" disabled={!eulogyContent.trim() || submittingEulogy} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2">
                      {submittingEulogy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      发表悼词
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : <div className="text-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-8"><p className="text-gray-600 dark:text-gray-400">登录后可以发表悼词</p></div>}

          {eulogies.length === 0 ? (
            <div className="text-center py-12"><MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" /><p className="text-gray-600 dark:text-gray-400">还没有悼词</p></div>
          ) : (
            <div className="space-y-6">
              {eulogies.map((eulogy, index) => (
                <motion.div key={eulogy.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex gap-3 group">
                  <img src={eulogy.avatar_url} alt={eulogy.username} className="w-10 h-10 rounded-full flex-shrink-0" loading="lazy" />
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{eulogy.username}</span>
                      <span className="text-sm text-gray-500">{new Date(eulogy.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{eulogy.content}</p>
                    {session?.user?.id === eulogy.user_id && (
                      <button
                        onClick={() => handleDeleteEulogy(eulogy.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                        title="删除悼词"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
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
