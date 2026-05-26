'use client'

import { useRef, useCallback } from 'react'
import { Download } from 'lucide-react'
import { CAUSE_OF_DEATH_LABELS } from '@/lib/constants'
import { Tombstone } from '@/types'

interface ShareImageButtonProps {
  tombstone: Tombstone
}

export default function ShareImageButton({ tombstone }: ShareImageButtonProps) {
  const cause = CAUSE_OF_DEATH_LABELS[tombstone.cause_of_death as keyof typeof CAUSE_OF_DEATH_LABELS]

  const generateImage = useCallback(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const w = 600
    const h = 800
    canvas.width = w
    canvas.height = h

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#1a1a2e')
    grad.addColorStop(1, '#16213e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Decorative border
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, w - 40, h - 40)

    // Cross symbol
    ctx.font = '48px serif'
    ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'
    ctx.textAlign = 'center'
    ctx.fillText('✝', w / 2, 100)

    // R.I.P
    ctx.font = '14px Arial'
    ctx.fillStyle = '#9ca3af'
    ctx.letterSpacing = '8px'
    ctx.fillText('R . I . P', w / 2, 140)

    // Code name
    ctx.font = 'bold 32px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(tombstone.code_name, w / 2, 210)

    // Cause of death
    if (cause) {
      ctx.font = '18px Arial'
      ctx.fillStyle = '#a855f7'
      ctx.fillText(`${cause.emoji} ${cause.label}`, w / 2, 250)
    }

    // Dates
    ctx.font = '14px Arial'
    ctx.fillStyle = '#9ca3af'
    const dates = tombstone.birth_date
      ? `${tombstone.birth_date} — ${tombstone.death_date}`
      : tombstone.death_date
    ctx.fillText(dates, w / 2, 290)

    // Description
    if (tombstone.description) {
      ctx.font = 'italic 16px Arial'
      ctx.fillStyle = '#d1d5db'
      const desc = tombstone.description.length > 60
        ? tombstone.description.substring(0, 60) + '...'
        : tombstone.description
      ctx.fillText(`"${desc}"`, w / 2, 340)
    }

    // Divider
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)'
    ctx.beginPath()
    ctx.moveTo(100, 380)
    ctx.lineTo(w - 100, 380)
    ctx.stroke()

    // Stats
    ctx.font = '16px Arial'
    ctx.fillStyle = '#ec4899'
    ctx.fillText(`🌸 ${tombstone.flower_count}`, w / 2 - 80, 420)
    ctx.fillStyle = '#3b82f6'
    ctx.fillText(`💬 ${tombstone.eulogy_count}`, w / 2, 420)
    ctx.fillStyle = '#eab308'
    ctx.fillText(`🕯️ ${tombstone.candle_count || 0}`, w / 2 + 80, 420)

    // Language
    ctx.font = '14px monospace'
    ctx.fillStyle = '#6b7280'
    ctx.fillText(`Language: ${tombstone.language}`, w / 2, 470)

    // Code preview (first 10 lines)
    ctx.font = '12px monospace'
    ctx.fillStyle = '#c3e88d'
    ctx.textAlign = 'left'
    const lines = tombstone.code_content.split('\n').slice(0, 10)
    lines.forEach((line, i) => {
      const truncated = line.length > 55 ? line.substring(0, 55) + '...' : line
      ctx.fillText(truncated, 60, 520 + i * 20)
    })

    // Footer
    ctx.textAlign = 'center'
    ctx.font = 'bold 16px Arial'
    ctx.fillStyle = '#a855f7'
    ctx.fillText('代码火葬场', w / 2, h - 60)
    ctx.font = '12px Arial'
    ctx.fillStyle = '#6b7280'
    ctx.fillText('code-graveyard.vercel.app', w / 2, h - 35)

    // Download
    const link = document.createElement('a')
    link.download = `${tombstone.code_name}-tombstone.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [tombstone, cause])

  return (
    <button
      onClick={generateImage}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title="下载分享图片"
    >
      <Download className="w-4 h-4 text-green-500" />
    </button>
  )
}
