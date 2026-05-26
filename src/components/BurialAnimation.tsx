'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Skull } from 'lucide-react'

interface BurialAnimationProps {
  show: boolean
  onComplete: () => void
}

export default function BurialAnimation({ show, onComplete }: BurialAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            setTimeout(onComplete, 2000)
          }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80"
        >
          <div className="text-center">
            {/* Coffin animation */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="mb-8"
            >
              <div className="text-8xl">⚰️</div>
            </motion.div>

            {/* Falling animation */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: 200 }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeIn' }}
            >
              <Skull className="w-16 h-16 text-purple-400 mx-auto" />
            </motion.div>

            {/* Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-2xl font-bold text-white mt-8"
            >
              R.I.P
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-gray-400 mt-2"
            >
              代码已安息
            </motion.p>

            {/* Flowers */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 }}
              className="flex justify-center gap-2 mt-6 text-3xl"
            >
              🌸 🌹 🌺 🌻 🌷
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
