'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Skull, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CAUSE_OPTIONS, CAUSE_OF_DEATH_LABELS } from '@/lib/constants'
import { CauseOfDeath } from '@/types'
import BurialAnimation from '@/components/BurialAnimation'
import { showToast } from '@/components/Toast'
import { playBurialSound } from '@/lib/sounds'
import { useI18n } from '@/components/I18nProvider'

export default function BuryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showBurial, setShowBurial] = useState(false)
  const [form, setForm] = useState({
    code_name: '',
    code_content: '',
    language: 'javascript',
    cause_of_death: '' as CauseOfDeath | '',
    birth_date: '',
    death_date: new Date().toISOString().split('T')[0],
    description: '',
    tags: '',
  })

  const languages = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c', 'cpp', 'csharp', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql', 'shell', 'other']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.code_name.trim()) { setError(t.tombstone.nameRequired); return }
    if (!form.code_content.trim()) { setError(t.tombstone.contentRequired); return }
    if (!form.cause_of_death) { setError(t.tombstone.causeRequired); return }

    setLoading(true)
    try {
      const submitData = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      }
      const res = await fetch('/api/tombstones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.common.error)
      }
      if (data && data.id) {
        setShowBurial(true)
        playBurialSound()
        showToast(t.bury.success, 'success')
        setTimeout(() => {
          router.push(`/tombstone/${data.id}`)
        }, 2500)
      } else {
        throw new Error(t.common.error)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Skull className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{t.bury.loginFirst}</p>
          <Link href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">{t.bury.loginToBury}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <BurialAnimation show={showBurial} onComplete={() => setShowBurial(false)} />

      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t.bury.back}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Skull className="w-8 h-8 text-purple-600 dark:text-purple-400" /> {t.bury.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t.bury.subtitle}</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bury.name} *</label>
            <input type="text" value={form.code_name} onChange={(e) => setForm({ ...form, code_name: e.target.value })} placeholder={t.bury.namePlaceholder} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bury.lang}</label>
            <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors">
              {languages.map((lang) => (<option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bury.content} *</label>
            <textarea value={form.code_content} onChange={(e) => setForm({ ...form, code_content: e.target.value })} placeholder={t.bury.contentPlaceholder} rows={10} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-mono text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bury.cause} *</label>
            <div className="grid grid-cols-2 gap-3">
              {CAUSE_OPTIONS.map((cause) => {
                const info = CAUSE_OF_DEATH_LABELS[cause]
                return (
                  <button key={cause} type="button" onClick={() => setForm({ ...form, cause_of_death: cause })} className={`p-4 rounded-lg border transition-all text-left ${form.cause_of_death === cause ? 'border-purple-500 bg-purple-100 dark:bg-purple-500/20' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600'}`}>
                    <span className="text-xl mr-2">{info.emoji}</span>
                    <span className="text-gray-900 dark:text-white">{info.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bury.birthDate}</label>
              <input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bury.deathDate}</label>
              <input type="date" value={form.death_date} onChange={(e) => setForm({ ...form, death_date: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bury.description}</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t.bury.descriptionPlaceholder} rows={3} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bury.tags}</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder={t.bury.tagsPlaceholder} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors" />
          </div>

          {error && <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-400/10 px-4 py-3 rounded-lg">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> {t.bury.submitting}</>) : (<><Skull className="w-5 h-5" /> {t.bury.submit}</>)}
          </button>
        </motion.form>
      </div>
    </div>
  )
}
