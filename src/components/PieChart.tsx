'use client'

import { motion } from 'framer-motion'

interface PieData {
  label: string
  value: number
  color: string
  emoji: string
}

interface PieChartProps {
  data: PieData[]
  size?: number
}

export default function PieChart({ data, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null

  const radius = size / 2 - 10
  const cx = size / 2
  const cy = size / 2

  let currentAngle = -90 // start from top

  const slices = data.map((d) => {
    const percentage = d.value / total
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

    return { ...d, path, percentage }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {slices.map((slice, i) => (
          <motion.path
            key={i}
            d={slice.path}
            fill={slice.color}
            stroke="var(--tw-bg-opacity, #1f2937)"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 + 0.3 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{`${slice.emoji} ${slice.label}: ${slice.value} (${(slice.percentage * 100).toFixed(1)}%)`}</title>
          </motion.path>
        ))}
        {/* Center circle for donut effect */}
        <circle cx={cx} cy={cy} r={radius * 0.5} fill="var(--center-fill, #f9fafb)" />
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-900 dark:fill-white text-lg font-bold" fontSize="24">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize="11">
          总墓碑
        </text>
      </motion.svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-sm">
        {slices.map((slice, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 + 0.5 }}
            className="flex items-center gap-2 text-sm"
          >
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
            <span className="text-gray-700 dark:text-gray-300 truncate">
              {slice.emoji} {slice.label}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-auto font-mono text-xs">
              {slice.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
