'use client'

import { useEffect, useState } from 'react'

export function CompleteToast({ message, onDone }: { message: string; onDone: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10)
    const t2 = setTimeout(() => setVisible(false), 2800)
    const t3 = setTimeout(() => onDone(), 3400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div
      className="fixed top-6 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold text-base"
      style={{
        transform: `translateX(-50%) translateY(${visible ? '0' : '-80px'})`,
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
        backgroundColor: '#1F4E79',
        pointerEvents: 'none',
      }}
    >
      <span style={{ fontSize: '1.4rem' }}>🎉</span>
      <span>{message}</span>
      <span style={{ fontSize: '1.4rem' }}>✨</span>
    </div>
  )
}
