'use client'

import { useCallback } from 'react'

export function useConfetti() {
  const fire = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default
    const count = 200
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 }

    function shoot(particleRatio: number, opts: object) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
    }

    shoot(0.25, { spread: 26, startVelocity: 55, colors: ['#C9A96E', '#1F4E79', '#6B8E7B'] })
    shoot(0.2, { spread: 60, colors: ['#ff6b6b', '#ffd93d', '#6bcb77'] })
    shoot(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#C9A96E', '#fff'] })
    shoot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    shoot(0.1, { spread: 120, startVelocity: 45 })
  }, [])

  return fire
}
