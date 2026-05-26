'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Skull, LogIn, LogOut, Plus, User, Sun, Moon, Trophy, BarChart3, Bell, Shuffle, Activity, Globe, Menu, X, Bookmark, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

export default function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lang, setLang] = useState<'zh' | 'en'>('zh')
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('lang') as 'zh' | 'en'
    if (saved) setLang(saved)
    if (session) fetchUnread()
  }, [session])

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    if (mobileOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (e) {}
  }

  const toggleLang = () => {
    const newLang = lang === 'zh' ? 'en' : 'zh'
    setLang(newLang)
    localStorage.setItem('lang', newLang)
    window.dispatchEvent(new CustomEvent('langChange', { detail: newLang }))
  }

  const handleRandom = async () => {
    try {
      const res = await fetch('/api/tombstones/random')
      if (res.ok) {
        const data = await res.json()
        if (data.id) router.push(`/tombstone/${data.id}`)
      }
    } catch (e) { console.error(e) }
    setMobileOpen(false)
  }

  const NavButton = ({ href, icon: Icon, label, color, badge }: { href?: string; icon: any; label: string; color: string; badge?: number }) => {
    const cls = `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300`
    const content = (
      <>
        <div className="relative">
          <Icon className={`w-5 h-5 ${color}`} />
          {badge && badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{badge > 9 ? '9+' : badge}</span>
          )}
        </div>
        <span className="text-sm">{label}</span>
      </>
    )
    return href ? (
      <Link href={href} onClick={() => setMobileOpen(false)} className={cls}>{content}</Link>
    ) : (
      <button onClick={() => {}} className={cls}>{content}</button>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
              <Skull className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 dark:from-purple-400 to-gray-600 dark:to-gray-400 bg-clip-text text-transparent">
              代码火葬场
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={handleRandom} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="随机挖坟">
              <Shuffle className="w-5 h-5 text-orange-500" />
            </button>
            <Link href="/activity" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="活动时间线">
              <Activity className="w-5 h-5 text-cyan-500" />
            </Link>
            <Link href="/leaderboard" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="排行榜">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </Link>
            <Link href="/stats" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="数据统计">
              <BarChart3 className="w-5 h-5 text-green-500" />
            </Link>
            <button onClick={toggleLang} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={lang === 'zh' ? 'Switch to English' : '切换到中文'}>
              <Globe className="w-5 h-5 text-indigo-500" />
            </button>
            {mounted && (
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={theme === 'dark' ? '亮色模式' : '暗色模式'}>
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            )}
            {session ? (
              <>
                <Link href="/notifications" className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="通知">
                  <Bell className="w-5 h-5 text-purple-500" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </Link>
                <Link href="/bookmarks" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="收藏">
                  <Bookmark className="w-5 h-5 text-amber-500" />
                </Link>
                <Link href="/bury" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="hidden lg:inline">埋葬代码</span>
                </Link>
                <Link href="/my-graveyard" className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                </Link>
                <Link href={`/user/${session.user?.id}`}>
                  <img src={session.user?.image || ''} alt="" className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:border-purple-500 transition-colors cursor-pointer" loading="lazy" />
                </Link>
                <button onClick={() => signOut()} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button onClick={() => signIn('github')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white rounded-lg transition-colors">
                <LogIn className="w-4 h-4" />
                GitHub 登录
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && (
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {mobileOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              <button onClick={handleRandom} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 w-full">
                <Shuffle className="w-5 h-5 text-orange-500" />
                <span className="text-sm">随机挖坟</span>
              </button>
              <Link href="/activity" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                <Activity className="w-5 h-5 text-cyan-500" />
                <span className="text-sm">活动时间线</span>
              </Link>
              <Link href="/leaderboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">排行榜</span>
              </Link>
              <Link href="/stats" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <span className="text-sm">数据统计</span>
              </Link>
              <button onClick={() => { toggleLang(); setMobileOpen(false) }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 w-full">
                <Globe className="w-5 h-5 text-indigo-500" />
                <span className="text-sm">{lang === 'zh' ? 'English' : '中文'}</span>
              </button>

              {session ? (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
                  <Link href="/bury" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-600 text-white">
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">埋葬代码</span>
                  </Link>
                  <Link href="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                    <div className="relative">
                      <Bell className="w-5 h-5 text-purple-500" />
                      {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </div>
                    <span className="text-sm">通知</span>
                  </Link>
                  <Link href="/bookmarks" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                    <Bookmark className="w-5 h-5 text-amber-500" />
                    <span className="text-sm">收藏</span>
                  </Link>
                  <Link href="/my-graveyard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">我的墓地</span>
                  </Link>
                  <button onClick={() => { signOut(); setMobileOpen(false) }} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 w-full">
                    <LogOut className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">退出</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
                  <button onClick={() => { signIn('github'); setMobileOpen(false) }} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white w-full">
                    <LogIn className="w-5 h-5" />
                    <span className="text-sm">GitHub 登录</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
