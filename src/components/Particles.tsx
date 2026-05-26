'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  emoji: string
}

const EMOJIS = ['💀', '🪦', '🕯️', '👻', '⚰️', '🌸', '🦇']

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 16 + 12,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.5 - 0.1,
      opacity: Math.random() * 0.3 + 0.1,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }))
    setParticles(initialParticles)

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.speedX + 100) % 100,
        y: (p.y + p.speedY + 100) % 100,
      })))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute transition-transform duration-1000 ease-linear"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            transform: `rotate(${p.x * 3.6}deg)`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}
