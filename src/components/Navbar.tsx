'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Skull, LogIn, LogOut, Plus, User } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
              <Skull className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-gray-400 bg-clip-text text-transparent">
              代码火葬场
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/bury" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">埋葬代码</span>
                </Link>
                <Link href="/my-graveyard" className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">我的墓地</span>
                </Link>
                <div className="flex items-center gap-3">
                  <img src={session.user?.image || ''} alt="" className="w-8 h-8 rounded-full border-2 border-gray-700" />
                  <button onClick={() => signOut()} className="text-gray-400 hover:text-white transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => signIn('github')} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
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
