'use client'

import { motion } from 'framer-motion'
import { Flower2, MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Tombstone } from '@/types'
import { CAUSE_OF_DEATH_LABELS } from '@/lib/constants'

interface TombstoneCardProps {
  tombstone: Tombstone
  index?: number
}

export default function TombstoneCard({ tombstone, index = 0 }: TombstoneCardProps) {
  const cause = CAUSE_OF_DEATH_LABELS[tombstone.cause_of_death as keyof typeof CAUSE_OF_DEATH_LABELS]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
      <Link href={`/tombstone/${tombstone.id}`}>
        <div className="relative group cursor-pointer">
          <div className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-[50%] rounded-b-lg p-6 border border-gray-600 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-gray-500 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">✝</div>
            <div className="mt-8 text-center">
              <h3 className="text-lg font-bold text-white mb-1 truncate">{tombstone.code_name}</h3>
              {cause && <span className={`text-sm ${cause.color}`}>{cause.emoji} {cause.label}</span>}
              {tombstone.description && <p className="text-gray-400 text-sm mt-3 line-clamp-2">{tombstone.description}</p>}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {tombstone.birth_date && <span>{tombstone.birth_date}</span>}
                <span>—</span>
                <span>{tombstone.death_date}</span>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-600">
                <div className="flex items-center gap-1 text-gray-400">
                  <Flower2 className="w-4 h-4 text-pink-400" />
                  <span>{tombstone.flower_count}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>{tombstone.eulogy_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
