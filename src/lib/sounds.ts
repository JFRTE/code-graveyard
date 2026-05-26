'use client'

// Simple sound effect player (no external files needed - uses Web Audio API)
export function playBurialSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Spooky descending tone
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 1.5)

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2)

    osc.start()
    osc.stop(audioCtx.currentTime + 2)

    // Second tone (minor third)
    setTimeout(() => {
      const osc2 = audioCtx.createOscillator()
      const gain2 = audioCtx.createGain()
      osc2.connect(gain2)
      gain2.connect(audioCtx.destination)
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(330, audioCtx.currentTime)
      osc2.frequency.exponentialRampToValueAtTime(82, audioCtx.currentTime + 1.5)
      gain2.gain.setValueAtTime(0.2, audioCtx.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2)
      osc2.start()
      osc2.stop(audioCtx.currentTime + 2)
    }, 300)
  } catch (e) {
    // Audio not supported, silently fail
  }
}

export function playFlowerSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(523, audioCtx.currentTime)
    osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1)
    osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.5)
  } catch (e) {}
}
