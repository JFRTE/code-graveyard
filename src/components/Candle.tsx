'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface CandleProps {
  count: number
  onLight: () => void
  disabled?: boolean
}

export default function Candle({ count, onLight, disabled }: CandleProps) {
  const [lighting, setLighting] = useState(false)

  const handleLight = async () => {
    if (disabled || lighting) return
    setLighting(true)
    await onLight()
    setLighting(false)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="text-2xl"
          >
            🕯️
          </motion.div>
        ))}
        {count > 10 && (
          <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">+{count - 10}</span>
        )}
      </div>
      <button
        onClick={handleLight}
        disabled={disabled || lighting}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
          disabled
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 cursor-pointer'
        }`}
      >
        <span className={lighting ? 'animate-pulse' : ''}>🕯️</span>
        <span>{count}</span>
        <span>{disabled ? '登录点蜡烛' : '点蜡烛'}</span>
      </button>
    </div>
  )
}
