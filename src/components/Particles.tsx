'use client'

import { useMemo } from 'react'

const EMOJIS = ['💀', '🪦', '🕯️', '👻', '⚰️', '🌸', '🦇']

export default function Particles() {
  // Generate particles once with CSS animations (no setState, no re-renders)
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      // Random initial positions and animation parameters
      startX: Math.random() * 100,
      startY: 100 + Math.random() * 20, // Start below viewport
      size: Math.random() * 16 + 12,
      duration: Math.random() * 15 + 15, // 15-30 seconds
      delay: Math.random() * 10, // 0-10 seconds delay
      drift: (Math.random() - 0.5) * 30, // -15 to +15 horizontal drift
      opacity: Math.random() * 0.3 + 0.1,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-float-up"
          style={{
            left: `${p.startX}%`,
            bottom: `-${Math.abs(p.startY - 100)}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}
