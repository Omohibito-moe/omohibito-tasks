'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

const NAV = [
  { href: '/', label: 'ダッシュボード', icon: '⊞' },
  { href: '/kanban', label: 'カンバン', icon: '⊡' },
  { href: '/timeline', label: 'タイムライン', icon: '▤' },
  { href: '/list', label: 'リスト', icon: '≡' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col py-6 px-3 overflow-y-auto"
      style={{ backgroundColor: 'var(--bg-sidebar)' }}
    >
      {/* Logo */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: '#C9A96E' }}
          >
            想
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">想ひ人</p>
            <p className="text-white/40 text-xs">Year 1 管理</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="mt-auto pt-4 border-t border-white/10 px-1">
        <button
          onClick={toggle}
          className="sidebar-item w-full justify-start"
        >
          <span>{theme === 'dark' ? '☀' : '☾'}</span>
          <span>{theme === 'dark' ? 'ライトモード' : 'ダークモード'}</span>
        </button>
      </div>
    </aside>
  )
}
