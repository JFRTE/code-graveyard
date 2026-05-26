'use client'

import { motion } from 'framer-motion'
import { Flower2, MessageSquare, Calendar, Flame, Eye } from 'lucide-react'
import Link from 'next/link'
import { Tombstone } from '@/types'
import { CAUSE_OF_DEATH_LABELS } from '@/lib/constants'

interface TombstoneCardProps {
  tombstone: Tombstone
  index?: number
}

export default function TombstoneCard({ tombstone, index = 0 }: TombstoneCardProps) {
  const cause = CAUSE_OF_DEATH_LABELS[tombstone.cause_of_death as keyof typeof CAUSE_OF_DEATH_LABELS]

  // Code preview for hover tooltip
  const codePreview = tombstone.code_content
    ? tombstone.code_content.split('\n').slice(0, 6).join('\n') + (tombstone.code_content.split('\n').length > 6 ? '\n...' : '')
    : ''

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group/card">
      <Link href={`/tombstone/${tombstone.id}`}>
        <div className="relative cursor-pointer">
          <div className="bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-t-[50%] rounded-b-lg p-6 border border-gray-300 dark:border-gray-600 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-gray-400 dark:text-gray-500 text-2xl opacity-50 group-hover/card:opacity-100 transition-opacity">✝</div>
            <div className="mt-8 text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">{tombstone.code_name}</h3>
              {cause && <span className={`text-sm ${cause.color}`}>{cause.emoji} {cause.label}</span>}
              {tombstone.description && <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 line-clamp-2">{tombstone.description}</p>}
              {tombstone.tags && tombstone.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {tombstone.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-500">
                <Calendar className="w-3 h-3" />
                {tombstone.birth_date && <span>{tombstone.birth_date}</span>}
                <span>—</span>
                <span>{tombstone.death_date}</span>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400" title="献花">
                  <Flower2 className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                  <span>{tombstone.flower_count}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400" title="悼词">
                  <MessageSquare className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span>{tombstone.eulogy_count}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400" title="蜡烛">
                  <Flame className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  <span>{tombstone.candle_count || 0}</span>
                </div>
                {tombstone.view_count > 0 && (
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400" title="浏览">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span>{tombstone.view_count}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hover code preview tooltip */}
          {codePreview && (
            <div className="absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto transition-opacity duration-200">
              <div className="bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-3">
                <div className="text-[11px] text-gray-400 mb-1">{tombstone.language}</div>
                <pre className="text-[11px] text-green-400 font-mono overflow-hidden max-h-24 whitespace-pre-wrap leading-relaxed">
                  {codePreview}
                </pre>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-700" />
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
