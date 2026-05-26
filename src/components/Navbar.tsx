'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Skull, LogIn, LogOut, Plus, User, Sun, Moon, Trophy, BarChart3, Bell, Shuffle, Activity, Globe } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lang, setLang] = useState<'zh' | 'en'>('zh')

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('lang') as 'zh' | 'en'
    if (saved) setLang(saved)
    if (session) fetchUnread()
  }, [session])

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
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
              <Skull className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 dark:from-purple-400 to-gray-600 dark:to-gray-400 bg-clip-text text-transparent">
              代码火葬场
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Random Tombstone */}
            <button
              onClick={handleRandom}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="随机挖坟"
            >
              <Shuffle className="w-5 h-5 text-orange-500" />
            </button>

            {/* Activity */}
            <Link href="/activity" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="活动时间线">
              <Activity className="w-5 h-5 text-cyan-500" />
            </Link>

            {/* Leaderboard */}
            <Link href="/leaderboard" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="排行榜">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </Link>

            {/* Stats */}
            <Link href="/stats" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="数据统计">
              <BarChart3 className="w-5 h-5 text-green-500" />
            </Link>

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Globe className="w-5 h-5 text-indigo-500" />
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            )}

            {session ? (
              <>
                {/* Notifications */}
                <Link href="/notifications" className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="通知">
                  <Bell className="w-5 h-5 text-purple-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link href="/bury" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">埋葬代码</span>
                </Link>
                <Link href="/my-graveyard" className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">我的墓地</span>
                </Link>
                <div className="flex items-center gap-3">
                  <Link href={`/user/${session.user?.id}`}>
                    <img src={session.user?.image || ''} alt="" className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:border-purple-500 transition-colors cursor-pointer" />
                  </Link>
                  <button onClick={() => signOut()} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => signIn('github')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white rounded-lg transition-colors">
                <LogIn className="w-4 h-4" />
                GitHub 登录
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
