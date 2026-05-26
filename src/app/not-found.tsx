'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Skull, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8"
        >
          <Skull className="w-24 h-24 text-purple-600 dark:text-purple-400 mx-auto" />
        </motion.div>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          这段代码已经被埋葬了
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          你寻找的页面已经安息在代码火葬场的某个角落，或者从未存在过。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          <Home className="w-5 h-5" />
          返回墓地首页
        </Link>
      </motion.div>
    </div>
  )
}
